import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedPlace } from '../types';
import { logWarn } from '../utils/logger';

// Saved data is scoped per user so that switching accounts on one device never
// leaks or merges one user's collection into another's.
export const SAVED_KEY_PREFIX = '@knaipa/saved:';

export const savedKey = (userId: string) => `${SAVED_KEY_PREFIX}${userId}`;

export type SavedPlacesById = Record<string, SavedPlace>;

/** Loads a user's persisted saved-places snapshot. Returns {} on miss or corruption. */
export async function loadSavedPlaces(userId: string): Promise<SavedPlacesById> {
  try {
    const raw = await AsyncStorage.getItem(savedKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as SavedPlacesById;
  } catch (e) {
    logWarn('loadSavedPlaces failed', e);
    return {};
  }
}

/** Persists a user's saved-places snapshot. Surfaces (but does not throw) on failure. */
export async function persistSavedPlaces(userId: string, map: SavedPlacesById): Promise<void> {
  try {
    await AsyncStorage.setItem(savedKey(userId), JSON.stringify(map));
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
