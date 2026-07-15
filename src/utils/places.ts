import { OpeningHours } from '../types/googleApi';

// ─── Display constants ─────────────────────────────────────────────────────────

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80';

// ─── Filter option → API value mappings ───────────────────────────────────────

/** Filter radius label → metres */
export const RADIUS_MAP: Record<string, number> = {
  near: 1500,
  '5km': 5000,
  '10km': 10000,
  '25km': 25000,
  '50km': 50000,
};

/**
 * UI category label → Google Places textQuery.
 * Each value must be a single search intent — never mix unrelated place types
 * in one query (e.g. "McDonalds KFC Kyiv" is explicitly banned by the API docs).
 * Synonyms for the same concept are fine ("cafes and coffee shops").
 */
export const CATEGORY_QUERY_MAP: Record<string, string> = {
  All: 'things to do',
  Culture: 'cultural attractions',
  Café: 'cafes and coffee shops',
  Museum: 'museums and art galleries',
  Nature: 'parks and nature',
  Food: 'restaurants',
  Market: 'markets',
  Bar: 'bars and nightlife',
};

/** UI price label → Google API priceLevels array */
export const PRICE_FILTER_MAP: Record<string, string[]> = {
  Free: ['PRICE_LEVEL_FREE'],
  '£': ['PRICE_LEVEL_INEXPENSIVE'],
  '££': ['PRICE_LEVEL_MODERATE'],
  '£££': ['PRICE_LEVEL_EXPENSIVE'],
  '££££': ['PRICE_LEVEL_VERY_EXPENSIVE'],
};

/** Google API priceLevel enum → UI display label */
export const PRICE_LEVEL_MAP: Record<string, string> = {
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '£',
  PRICE_LEVEL_MODERATE: '££',
  PRICE_LEVEL_EXPENSIVE: '£££',
  PRICE_LEVEL_VERY_EXPENSIVE: '££££',
};

/** Google primaryType → human-readable category label */
export const PRIMARY_TYPE_LABEL_MAP: Record<string, string> = {
  cafe: 'Café / Coffee',
  coffee_shop: 'Café / Coffee',
  museum: 'Museum / Art',
  art_gallery: 'Art / Gallery',
  park: 'Nature / Park',
  botanical_garden: 'Nature / Botanical',
  national_park: 'Nature / Park',
  garden: 'Nature / Garden',
  restaurant: 'Food / Restaurant',
  food_court: 'Food / Market',
  bar: 'Bar / Nightlife',
  night_club: 'Bar / Nightlife',
  tourist_attraction: 'Culture / Attraction',
  cultural_center: 'Culture / Attraction',
  historical_landmark: 'Culture / History',
  performing_arts_theater: 'Culture / Arts',
  market: 'Food / Market',
  supermarket: 'Market',
  shopping_mall: 'Shopping / Mall',
};

// ─── Business logic ────────────────────────────────────────────────────────────

/**
 * Returns true if a place is open past 20:00 today.
 * Used for the "Open evening" filter (client-side only — the API has no equivalent).
 */
export function isOpenEvening(hours: OpeningHours | undefined): boolean {
  const today = new Date().getDay();
  const period = hours?.periods?.find((p) => p.open?.day === today);
  if (!period?.close) return false;
  return (period.close.hour ?? 0) * 60 + (period.close.minute ?? 0) >= 20 * 60;
}
