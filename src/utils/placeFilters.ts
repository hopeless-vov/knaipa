import { Place, Filters } from '../types';
import { GooglePlace } from '../types/googleApi';
import { isOpenEvening } from './places';

/**
 * Applies client-side-only filters that the Google Places API cannot handle:
 * - minReviews  (API has no minimum review count parameter)
 * - Open evening (API has openNow but no "open past 20:00" concept)
 * - sort by rating (API RELEVANCE/DISTANCE only)
 */
export function applyPostFetchFilters(
  places: Place[],
  rawPlaces: GooglePlace[],
  filters: Filters
): Place[] {
  let result = places;

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
