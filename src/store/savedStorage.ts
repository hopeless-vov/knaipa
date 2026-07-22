import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedPlace } from '../types';
import { logWarn } from '../utils/logger';

// Saved data is scoped per user so that switching accounts on one device never
// leaks or merges one user's collection into another's.
export const SAVED_KEY_PREFIX = '@knaipa/saved:';

export const savedKey = (userId: string) => `${SAVED_KEY_PREFIX}${userId}`;

export type SavedPlacesById = Record<string, SavedPlace>;

// Bump when the persisted SavedPlace shape changes incompatibly, and add a
// branch in `migrate`. Snapshots are local-first (re-derivable from Supabase),
// so an unknown/older version safely degrades to validation + prune.
export const SCHEMA_VERSION = 1;

interface VersionedSnapshot {
  version: number;
  places: SavedPlacesById;
}

function isSavedPlace(value: unknown): value is SavedPlace {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as SavedPlace).id === 'string' &&
    typeof (value as SavedPlace).savedAt === 'string'
  );
}

/** Drops entries that don't match the current SavedPlace shape. */
function sanitize(map: Record<string, unknown>): SavedPlacesById {
  const out: SavedPlacesById = {};
  for (const [id, value] of Object.entries(map)) {
    if (isSavedPlace(value)) out[id] = value;
  }
  return out;
}

/** Brings an older snapshot forward. Only validation is needed today (v1). */
function migrate(_fromVersion: number, places: Record<string, unknown>): SavedPlacesById {
  return sanitize(places);
}

/** Loads a user's persisted saved-places snapshot. Returns {} on miss or corruption. */
export async function loadSavedPlaces(userId: string): Promise<SavedPlacesById> {
  try {
    const raw = await AsyncStorage.getItem(savedKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    // Versioned format: migrate if older, always validate.
    if (typeof (parsed as VersionedSnapshot).version === 'number') {
      const { version, places } = parsed as VersionedSnapshot;
      if (!places || typeof places !== 'object') return {};
      return version === SCHEMA_VERSION ? sanitize(places) : migrate(version, places);
    }

    // Legacy raw map (pre-versioning) — migrate it forward.
    return migrate(0, parsed as Record<string, unknown>);
  } catch (e) {
    logWarn('loadSavedPlaces failed', e);
    return {};
  }
}

/** Persists a user's saved-places snapshot. Surfaces (but does not throw) on failure. */
export async function persistSavedPlaces(userId: string, map: SavedPlacesById): Promise<void> {
  try {
    const snapshot: VersionedSnapshot = { version: SCHEMA_VERSION, places: map };
    await AsyncStorage.setItem(savedKey(userId), JSON.stringify(snapshot));
  } catch (e) {
    logWarn('persistSavedPlaces failed — a save may not survive a restart', e);
  }
}

/** Removes a user's locally-persisted saved snapshot. */
export async function clearSavedPlaces(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(savedKey(userId));
  } catch (e) {
    logWarn('clearSavedPlaces failed', e);
  }
}

/** Returns saved places as a list, newest first. */
export function toSavedList(map: SavedPlacesById): SavedPlace[] {
  return Object.values(map).sort((a, b) =>
    (b.savedAt ?? '').localeCompare(a.savedAt ?? '')
  );
}
