import { Linking, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Place, PlaceExtraDetails } from '../types';
import { buildMapsUrl, resolveWebsiteUrl, buildSharePayload } from '../utils/placeLinks';

/** Place action handlers (maps deep link, copy, website, share). */
export function usePlaceActions(place: Place, details?: PlaceExtraDetails | null) {
  return {
    openMaps: () => Linking.openURL(buildMapsUrl(place)),
    copyAddress: () => Clipboard.setStringAsync(place.address),
    openWebsite: () => Linking.openURL(resolveWebsiteUrl(place, details)),
    share: () => Share.share(buildSharePayload(place)),
  };
}
