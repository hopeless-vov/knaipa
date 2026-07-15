import { Place, Filters } from '../types';
import { GooglePlace, AddressComponent } from '../types/googleApi';
import { haversineDistance, formatDistance } from '../utils/geo';
import { formatHours } from '../utils/formatters';
import { FALLBACK_IMAGE, PRICE_LEVEL_MAP, PRIMARY_TYPE_LABEL_MAP, RADIUS_MAP, CATEGORY_QUERY_MAP, PRICE_FILTER_MAP } from '../utils/places';
import {
  PLACES_BASE_URL,
  PHOTO_COVER_WIDTH_PX,
  PHOTO_GALLERY_WIDTH_PX,
  GALLERY_MAX,
} from '../config/googlePlaces';

const PAGE_SIZE = 20;

// ─── Request builder ───────────────────────────────────────────────────────────

/**
 * Builds the request body for the Google Places searchText endpoint.
 * Server-side filters: openNow, minRating, priceLevels.
 * Client-side-only filters (minReviews, Open evening, sort by rating)
 * are applied in utils/placeFilters.ts after the response arrives.
 */
export function buildRequestBody(
  userLat: number,
  userLng: number,
  filters: Filters,
  pageToken?: string
): Record<string, unknown> {
  const radius = RADIUS_MAP[filters.radius] ?? 1500;

  const base: Record<string, unknown> = {
    textQuery: CATEGORY_QUERY_MAP[filters.category] ?? CATEGORY_QUERY_MAP.All,
    pageSize: PAGE_SIZE,
    rankPreference: filters.sort === 'distance' ? 'DISTANCE' : 'RELEVANCE',
    languageCode: 'en',
    locationBias: {
      circle: { center: { latitude: userLat, longitude: userLng }, radius },
    },
  };

  if (filters.availability === 'Open now') base.openNow = true;

  const minRating = parseFloat(filters.rating);
  if (!isNaN(minRating)) base.minRating = minRating;

  const priceLevels = PRICE_FILTER_MAP[filters.price];
  if (priceLevels) base.priceLevels = priceLevels;

  return pageToken ? { ...base, pageToken } : base;
}

// ─── Response mapper ───────────────────────────────────────────────────────────

function getPhotoUrl(photoName: string, apiKey: string, maxWidthPx: number): string {
  return `${PLACES_BASE_URL}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}`;
}

function extractAddressComponents(
  components: AddressComponent[]
): { city: string; neighborhood: string } {
  const find = (...types: string[]) =>
    components.find((c) => types.some((t) => c.types?.includes(t)));
  const cityComp = find('locality', 'postal_town');
  const countryComp = find('country');
  const neighborhoodComp = find('sublocality', 'neighborhood');
  const cityName = cityComp?.longText ?? '';
  const countryName = countryComp?.longText ?? '';
  return {
    city: cityName && countryName ? `${cityName}, ${countryName}` : cityName || countryName,
    neighborhood: neighborhoodComp?.longText ?? '',
  };
}

export function mapGooglePlace(
  gPlace: GooglePlace,
  userLat: number,
  userLng: number,
  apiKey: string
): Place {
  const lat = gPlace.location?.latitude ?? 0;
  const lng = gPlace.location?.longitude ?? 0;
  const photoNames = (gPlace.photos ?? []).map((p) => p.name);
  const cover = photoNames.length
    ? getPhotoUrl(photoNames[0], apiKey, PHOTO_COVER_WIDTH_PX)
    : FALLBACK_IMAGE;
  const gallery = photoNames
    .slice(1, 1 + GALLERY_MAX)
    .map((name) => getPhotoUrl(name, apiKey, PHOTO_GALLERY_WIDTH_PX));
  if (gallery.length === 0) gallery.push(FALLBACK_IMAGE);

  const hoursSource = gPlace.currentOpeningHours ?? gPlace.regularOpeningHours;

  return {
    id: gPlace.id,
    name: gPlace.displayName?.text ?? 'Unknown',
    category:
      PRIMARY_TYPE_LABEL_MAP[gPlace.primaryType ?? ''] ??
      (gPlace.primaryType ?? '').replace(/_/g, ' '),
    cover,
    gallery,
    distance: formatDistance(haversineDistance(userLat, userLng, lat, lng)),
    hours: formatHours(hoursSource, new Date().getDay()),
    price: PRICE_LEVEL_MAP[gPlace.priceLevel ?? ''] ?? '—',
    rating: gPlace.rating != null ? String(gPlace.rating) : 'N/A',
    userRatingCount: gPlace.userRatingCount ?? 0,
    type: (gPlace.primaryType ?? '').replace(/_/g, ' '),
    highlights: (gPlace.types ?? []).slice(0, 4).map((t) => t.replace(/_/g, ' ')),
    address: gPlace.formattedAddress ?? '',
    ...extractAddressComponents(gPlace.addressComponents ?? []),
    lat,
    lng,
  };
}
