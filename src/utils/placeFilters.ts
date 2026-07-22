import { Place, Filters } from '../types';
import { GooglePlace } from '../types/googleApi';
import { isOpenEvening } from './places';

/**
 * Filters that depend on the raw Google payload (opening hours) or on gaps in
 * a specific endpoint, so they must run at fetch time against `rawPlaces`:
 * - Open evening (no "open past 20:00" API concept) — both modes
 * - rating / price / Open now — server-side in SEARCH mode, but searchNearby
 *   (BROWSE mode) has no such params, so they are enforced here instead.
 *
 * The result of this is what gets cached (keyed by the server-affecting
 * filters). Purely re-derivable refinements live in applyClientRefinements.
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

  if (filters.availability === 'Open evening') {
    const eveningIds = new Set(
      rawPlaces
        .filter((g) => isOpenEvening(g.currentOpeningHours ?? g.regularOpeningHours))
        .map((g) => g.id)
    );
    result = result.filter((p) => eveningIds.has(p.id));
  }

  return result;
}

/**
 * Refinements that can be re-derived from the mapped Place list alone
 * (no raw payload needed): minReviews and sort-by-rating. Kept out of the
 * fetch/cache layer so toggling them re-derives from the cached result set
 * instead of triggering a fresh (billed) Google search.
 */
export function applyClientRefinements(places: Place[], filters: Filters): Place[] {
  let result = places;

  if (filters.minReviews !== 'any') {
    const min = parseInt(filters.minReviews.replace('+', ''), 10);
    result = result.filter((p) => p.userRatingCount >= min);
  }

  if (filters.sort === 'rating') {
    result = [...result].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }

  return result;
}
