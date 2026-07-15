import { SavedPlace } from '../types';

export interface ProfileStats {
  visited: number;
  pending: number;
  cities: number;
}

/** Aggregates saved-place counts for the profile stats grid. */
export function computeProfileStats(saved: SavedPlace[]): ProfileStats {
  const visited = saved.filter((p) => p.visited).length;
  return {
    visited,
    pending: saved.length - visited,
    cities: new Set(saved.map((p) => p.city).filter(Boolean)).size,
  };
}

/** "Since 2024" style label from an ISO timestamp; empty string if unparseable. */
export function memberSince(createdAt: string | undefined): string {
  if (!createdAt) return '';
  const year = new Date(createdAt).getFullYear();
  return Number.isNaN(year) ? '' : `Since ${year}`;
}

/** The city the user has saved the most places in, or '' if none. */
export function homeCity(saved: SavedPlace[]): string {
  const counts = new Map<string, number>();
  for (const p of saved) {
    if (!p.city) continue;
    counts.set(p.city, (counts.get(p.city) ?? 0) + 1);
  }
  let best = '';
  let bestCount = 0;
  for (const [city, count] of counts) {
    if (count > bestCount) {
      best = city;
      bestCount = count;
    }
  }
  return best;
}
