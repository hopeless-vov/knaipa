import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place, SavedPlace } from '../types';
import { fetchRemoteSaved, pushSave, pushUnsave, pushVisited } from '../api/savedPlaces';
import { SavedPlacesById } from './savedStorage';
import { logWarn } from '../utils/logger';

// The sync queue is scoped per user so pending offline ops for account A can
// never be flushed into account B after an account switch on the same device.
export const SYNC_QUEUE_PREFIX = '@knaipa/syncQueue:';
export const DEAD_LETTER_PREFIX = '@knaipa/syncDeadLetter:';

// After this many failed flush attempts a head op is treated as a poison pill
// (e.g. an RLS rejection or a row deleted server-side) and quarantined to the
// dead-letter store so it stops blocking every other op behind it.
export const MAX_FLUSH_ATTEMPTS = 6;

export const queueKey = (userId: string) => `${SYNC_QUEUE_PREFIX}${userId}`;
export const deadLetterKey = (userId: string) => `${DEAD_LETTER_PREFIX}${userId}`;

export type SyncOp =
  | { type: 'save'; place: Place; savedAt: string; visited: boolean }
  | { type: 'unsave'; placeId: string }
  | { type: 'visited'; placeId: string; visited: boolean };

// Persisted ops carry a private attempt counter so a poison op can be detected
// across flushes without changing the public SyncOp shape at call sites.
type QueuedOp = SyncOp & { attempts?: number };

function opPlaceId(op: SyncOp): string {
  return op.type === 'save' ? op.place.id : op.placeId;
}

/** Loads a user's pending sync-op queue. Returns [] on miss or corruption. */
export async function loadQueue(userId: string): Promise<SyncOp[]> {
  try {
    const raw = await AsyncStorage.getItem(queueKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SyncOp[]) : [];
  } catch (e) {
    logWarn('loadQueue failed', e);
    return [];
  }
}

async function persistQueue(userId: string, queue: SyncOp[]): Promise<void> {
  try {
    await AsyncStorage.setItem(queueKey(userId), JSON.stringify(queue));
  } catch (e) {
    logWarn('persistQueue failed — a pending sync op may be lost', e);
  }
}

/** Appends an op to a user's persisted queue and returns the new queue. */
export async function enqueue(userId: string, op: SyncOp): Promise<SyncOp[]> {
  const queue = await loadQueue(userId);
  queue.push(op);
  await persistQueue(userId, queue);
  return queue;
}

/** Clears a user's queue (used on sign-out after a best-effort flush). */
export async function clearQueue(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(queueKey(userId));
  } catch (e) {
    logWarn('clearQueue failed', e);
  }
}

/** Returns ops that were quarantined after repeated flush failures. */
export async function loadDeadLetter(userId: string): Promise<SyncOp[]> {
  try {
    const raw = await AsyncStorage.getItem(deadLetterKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SyncOp[]) : [];
  } catch (e) {
    logWarn('loadDeadLetter failed', e);
    return [];
  }
}

async function quarantine(userId: string, op: SyncOp): Promise<void> {
  const dead = await loadDeadLetter(userId);
  const { attempts, ...clean } = op as QueuedOp; // drop the attempt counter
  dead.push(clean);
  try {
    await AsyncStorage.setItem(deadLetterKey(userId), JSON.stringify(dead));
  } catch (e) {
    logWarn('quarantine persist failed', e);
  }
}

async function runOp(userId: string, op: SyncOp): Promise<void> {
  switch (op.type) {
    case 'save':
      return pushSave(userId, op.place, op.savedAt, op.visited);
    case 'unsave':
      return pushUnsave(userId, op.placeId);
    case 'visited':
      return pushVisited(userId, op.placeId, op.visited);
  }
}

let flushing = false;

/**
 * Flushes queued ops to Supabase in order. Stops at the first failure and
 * keeps the remaining ops for a later attempt. Re-entrant-safe.
 */
export async function flushQueue(userId: string): Promise<void> {
  /* istanbul ignore next -- re-entrancy guard for concurrent flushes */
  if (flushing) return;
  flushing = true;
  try {
    let queue = (await loadQueue(userId)) as QueuedOp[];
    while (queue.length > 0) {
      try {
        await runOp(userId, queue[0]);
      } catch {
        const head = queue[0];
        const attempts = (head.attempts ?? 0) + 1;
        if (attempts >= MAX_FLUSH_ATTEMPTS) {
          // Poison pill — quarantine it and carry on so the rest can drain.
          await quarantine(userId, head);
          logWarn(`sync op dead-lettered after ${attempts} attempts`, head.type);
          queue = queue.slice(1);
          await persistQueue(userId, queue);
          continue;
        }
        // Transient failure — remember the attempt and retry the queue later.
        queue[0] = { ...head, attempts };
        await persistQueue(userId, queue);
        break;
      }
      queue = queue.slice(1);
      await persistQueue(userId, queue);
    }
  } finally {
    flushing = false;
  }
}

/**
 * Merges remote saved places with the local snapshot. Remote is the base;
 * any place with a pending local op wins (pending saves/edits keep the local
 * copy, pending unsaves drop it) so unsynced offline changes are not lost.
 */
export async function pullAndMerge(
  userId: string,
  localMap: SavedPlacesById
): Promise<SavedPlacesById> {
  const remote = await fetchRemoteSaved(userId);
  const merged: SavedPlacesById = {};
  for (const place of remote) {
    merged[place.id] = place;
  }

  const queue = await loadQueue(userId);
  for (const op of queue) {
    const id = opPlaceId(op);
    if (op.type === 'unsave') {
      delete merged[id];
    } else if (localMap[id]) {
      merged[id] = localMap[id];
    }
  }

  return merged;
}

/**
 * Re-applies local mutations that happened *during* a sync round-trip on top of
 * the merged result, so a swipe/toggle made while `pullAndMerge` was in flight
 * isn't clobbered by the pre-sync snapshot. `before` is the local map captured
 * before the network call; `current` is the live map at write time.
 */
export function reconcileConcurrent(
  merged: SavedPlacesById,
  before: SavedPlacesById,
  current: SavedPlacesById
): SavedPlacesById {
  const result = { ...merged };
  // Saves/edits added or changed during the round-trip win over the snapshot.
  for (const id of Object.keys(current)) {
    if (current[id] !== before[id]) result[id] = current[id];
  }
  // Unsaves that happened during the round-trip are honored.
  for (const id of Object.keys(before)) {
    if (!(id in current)) delete result[id];
  }
  return result;
}
