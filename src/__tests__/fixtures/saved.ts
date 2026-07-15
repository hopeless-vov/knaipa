import { Place, SavedPlace } from '../../types';
import { SavedPlacesById } from '../../store/savedStorage';

/** Builds a savedPlacesById map from places, with per-id visited/savedAt overrides. */
export function buildSavedMap(
  places: Place[],
  overrides: Record<string, { visited?: boolean; savedAt?: string }> = {}
): SavedPlacesById {
  const map: SavedPlacesById = {};
  places.forEach((place, idx) => {
    const o = overrides[place.id] ?? {};
    const saved: SavedPlace = {
      ...place,
      visited: o.visited ?? false,
      // Descending default order so index 0 is newest
      savedAt: o.savedAt ?? `2025-01-${String(places.length - idx).padStart(2, '0')}T00:00:00Z`,
    };
    map[place.id] = saved;
  });
  return map;
}
