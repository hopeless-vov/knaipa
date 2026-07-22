import { Filters } from '../types';

/**
 * Stable identity over only the filters that change the Google request (and
 * thus the cached result set). Client-only refinements — sort, minReviews,
 * hideSeen — are deliberately excluded so toggling them re-derives from the
 * cached results (see applyClientRefinements) instead of triggering a fresh,
 * billed search. `locText` is excluded too: the request keys off the resolved
 * lat/lng, not the raw text.
 */
export function serverFilterKey(filters: Filters): string {
  return JSON.stringify({
    mode: filters.mode,
    categories: filters.categories,
    query: filters.query,
    radius: filters.radius,
    price: filters.price,
    rating: filters.rating,
    availability: filters.availability,
  });
}
