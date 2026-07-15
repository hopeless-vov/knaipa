import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedPlace } from '../types';

export const SAVED_KEY = '@knaipa/saved';

export type SavedPlacesById = Record<string, SavedPlace>;

/** Loads the persisted saved-places snapshot. Returns {} on miss or corruption. */
export async function loadSavedPlaces(): Promise<SavedPlacesById> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as SavedPlacesById;
  } catch {
    return {};
  }
}

/** Persists the saved-places snapshot. Silently no-ops on failure. */
export async function persistSavedPlaces(map: SavedPlacesById): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(map));
  } catch {}
}

/** Returns saved places as a list, newest first. */
export function toSavedList(map: SavedPlacesById): SavedPlace[] {
  return Object.values(map).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
