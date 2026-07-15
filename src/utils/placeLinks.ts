import { Platform } from 'react-native';
import { Place, PlaceExtraDetails } from '../types';

function mapsQuery(place: Place): string {
  return encodeURIComponent(`${place.name}, ${place.address}`);
}

/** Web Google Maps search URL (used for sharing — always openable). */
export function buildWebMapsUrl(place: Place): string {
  return `https://www.google.com/maps/search/?api=1&query=${mapsQuery(place)}`;
}

/** Platform-native maps deep link, falling back to the web URL. */
export function buildMapsUrl(place: Place): string {
  const q = mapsQuery(place);
  return Platform.select({
    ios: `maps://?q=${q}`,
    android: `geo:0,0?q=${q}`,
    default: buildWebMapsUrl(place),
  }) as string;
}

/** The place's website, or a Google search for its name as a fallback. */
export function resolveWebsiteUrl(place: Place, details?: PlaceExtraDetails | null): string {
  return details?.websiteUri ?? `https://www.google.com/search?q=${encodeURIComponent(place.name)}`;
}

/** Payload for the native share sheet. */
export function buildSharePayload(place: Place): { title: string; message: string; url: string } {
  const url = buildWebMapsUrl(place);
  return { title: place.name, message: `${place.name}\n${place.address}\n${url}`, url };
}
