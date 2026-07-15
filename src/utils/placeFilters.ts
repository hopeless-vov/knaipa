import { Place, Filters } from '../types';
import { GooglePlace } from '../types/googleApi';
import { isOpenEvening } from './places';

/**
 * Applies client-side filters that Google can't do for the current request:
 * - minReviews  (no API parameter, either endpoint)
 * - Open evening (no "open past 20:00" concept)
 * - sort by rating (API ranks by RELEVANCE/DISTANCE/POPULARITY only)
 * - rating / price / Open now — server-side in SEARCH mode, but searchNearby
 *   (BROWSE mode) has no such params, so they are enforced here instead.
 */
export function applyPostFetchFilters(
  places: Place[],
  rawPlaces: GooglePlace[],
  filters: Filters
): Place[] {
  let result = places;

  // BROWSE mode: searchNearby can't filter by rating/price/openNow — do it here
  if (filters.mode === 'browse') {
    const minRating = parseFloat(filters.rating);
    if (!isNaN(minRating)) {
      result = result.filter((p) => {
        const r = parseFloat(p.rating);
        return !isNaN(r) && r >= minRating;
      });
    }

    if (filters.price !== 'any') {
      result = result.filter((p) => p.price === filters.price);
    }

    if (filters.availability === 'Open now') {
      const openIds = new Set(
        rawPlaces
          .filter((g) => (g.currentOpeningHours ?? g.regularOpeningHours)?.openNow)
          .map((g) => g.id)
      );
      result = result.filter((p) => openIds.has(p.id));
    }
  }

  if (filters.minReviews !== 'any') {
    const min = parseInt(filters.minReviews.replace('+', ''), 10);
    result = result.filter((p) => p.userRatingCount >= min);
  }

  if (filters.availability === 'Open evening') {
    const eveningIds = new Set(
      rawPlaces
        .filter((g) => isOpenEvening(g.currentOpeningHours ?? g.regularOpeningHours))
        .map((g) => g.id)
    );
    result = result.filter((p) => eveningIds.has(p.id));
  }

  if (filters.sort === 'rating') {
    result = [...result].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }

  return result;
}
