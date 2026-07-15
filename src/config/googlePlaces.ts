export const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
export const PLACES_BASE_URL = 'https://places.googleapis.com/v1';
export const SEARCH_URL = `${PLACES_BASE_URL}/places:searchText`;
export const AUTOCOMPLETE_URL = `${PLACES_BASE_URL}/places:autocomplete`;
export const REQUEST_TIMEOUT_MS = 10000;

export const DETAILS_FIELD_MASK = ['websiteUri', 'nationalPhoneNumber'].join(',');

export const FIELD_MASK = [
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
  'nextPageToken',
].join(',');
