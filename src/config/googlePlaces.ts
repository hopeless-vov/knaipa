export const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
export const PLACES_BASE_URL = 'https://places.googleapis.com/v1';
export const SEARCH_URL = `${PLACES_BASE_URL}/places:searchText`;
export const NEARBY_SEARCH_URL = `${PLACES_BASE_URL}/places:searchNearby`;
export const AUTOCOMPLETE_URL = `${PLACES_BASE_URL}/places:autocomplete`;
export const REQUEST_TIMEOUT_MS = 10000;
export const NEARBY_MAX_RESULTS = 20; // searchNearby hard cap (no pagination)

export const DETAILS_FIELD_MASK = ['websiteUri', 'nationalPhoneNumber'].join(',');

// Photo fetch sizes (px). Billing is per-request regardless of size, so each
// photo keeps ONE width (cover URL === the URL reused everywhere it appears) to
// stay a single cached request. These tune bandwidth only.
export const PHOTO_COVER_WIDTH_PX = 600;
export const PHOTO_GALLERY_WIDTH_PX = 800;
// How many gallery photos (after the cover) to keep references for. Rendering is
// lazy, so extra references cost nothing until the user reveals them.
export const GALLERY_MAX = 7;

const PLACE_FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.photos',
  'places.primaryType',
  'places.types',
  'places.priceLevel',
  'places.regularOpeningHours',
  'places.currentOpeningHours',
  'places.addressComponents',
];

// searchText supports pagination
export const FIELD_MASK = [...PLACE_FIELDS, 'nextPageToken'].join(',');
// searchNearby has no pagination (no nextPageToken field)
export const NEARBY_FIELD_MASK = PLACE_FIELDS.join(',');
