import { Place, Filters } from '../types';
import { GooglePlace, AutocompleteSuggestion } from '../types/googleApi';
import { RADIUS_MAP } from '../utils/places';
import { haversineDistance } from '../utils/geo';
import { buildRequestBody, mapGooglePlace } from '../mappers/googlePlaces';
import { applyPostFetchFilters } from '../utils/placeFilters';
import {
  GOOGLE_API_KEY,
  PLACES_BASE_URL,
  SEARCH_URL,
  AUTOCOMPLETE_URL,
  REQUEST_TIMEOUT_MS,
  FIELD_MASK,
  DETAILS_FIELD_MASK,
} from '../config/googlePlaces';
import { PlaceExtraDetails } from '../types';

export async function fetchNearbyPlaces(
  userLat: number,
  userLng: number,
  filters: Filters,
  pageToken?: string
): Promise<{ places: Place[]; nextPageToken: string | null }> {
  const radius = RADIUS_MAP[filters.radius] ?? 1500;
  const body = buildRequestBody(userLat, userLng, filters, pageToken);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // locationBias is a hint — enforce radius strictly post-fetch
  const rawPlaces: GooglePlace[] = (data.places ?? []).filter((g: GooglePlace) => {
    const lat = g.location?.latitude ?? 0;
    const lng = g.location?.longitude ?? 0;
    return haversineDistance(userLat, userLng, lat, lng) <= radius;
  });

  const mapped = rawPlaces.map((g) => mapGooglePlace(g, userLat, userLng, GOOGLE_API_KEY));
  const places = applyPostFetchFilters(mapped, rawPlaces, filters);

  return { places, nextPageToken: data.nextPageToken ?? null };
}

export async function fetchPlaceLocation(
  placeId: string,
  sessionToken?: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = sessionToken
      ? `${PLACES_BASE_URL}/places/${placeId}?sessionToken=${sessionToken}`
      : `${PLACES_BASE_URL}/places/${placeId}`;
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'location',
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const lat = data.location?.latitude;
    const lng = data.location?.longitude;
    if (!lat || !lng) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export async function fetchPlaceDetails(
  placeId: string
): Promise<PlaceExtraDetails | null> {
  try {
    const response = await fetch(`${PLACES_BASE_URL}/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': DETAILS_FIELD_MASK,
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      websiteUri: data.websiteUri ?? undefined,
      nationalPhoneNumber: data.nationalPhoneNumber ?? undefined,
    };
  } catch {
    return null;
  }
}

export async function autocompletePlaces(
  input: string,
  sessionToken?: string
): Promise<AutocompleteSuggestion[]> {
  if (!input.trim()) return [];
  try {
    const response = await fetch(AUTOCOMPLETE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
      },
      body: JSON.stringify({
        input: input.trim(),
        languageCode: 'en',
        ...(sessionToken && { sessionToken }),
      }),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.suggestions ?? [])
      .slice(0, 5)
      .map(
        (s: {
          placePrediction?: {
            placeId?: string;
            text?: { text?: string };
            structuredFormat?: {
              mainText?: { text?: string };
              secondaryText?: { text?: string };
            };
          };
        }) => ({
          placeId: s.placePrediction?.placeId ?? '',
          text: s.placePrediction?.text?.text ?? '',
          mainText:
            s.placePrediction?.structuredFormat?.mainText?.text ??
            s.placePrediction?.text?.text ??
            '',
          secondaryText:
            s.placePrediction?.structuredFormat?.secondaryText?.text ?? '',
        })
      )
      .filter((s: AutocompleteSuggestion) => s.text);
  } catch {
    return [];
  }
}
