import { useState } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '../store/useAppStore';

type GpsResult =
  | { status: 'ok'; coords: { lat: number; lng: number } }
  | { status: 'denied' }
  | { status: 'unavailable' };

async function resolveGpsLocation(): Promise<GpsResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { status: 'denied' };
    const last = await Location.getLastKnownPositionAsync({});
    if (last) return { status: 'ok', coords: { lat: last.coords.latitude, lng: last.coords.longitude } };
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      /* istanbul ignore next -- 5s GPS timeout fallback */
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);
    if (!pos) return { status: 'unavailable' };
    return { status: 'ok', coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } };
  } catch {
    return { status: 'unavailable' };
  }
}

/**
 * Owns the deck's location lifecycle: GPS permission + resolution, the
 * "denied" state, and re-requesting on demand. `resolveInitial` is called by
 * the deck's mount bootstrap; `requestLocation` backs the "enable location"
 * empty-state CTA.
 */
export function useDeckLocation() {
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const fetchDeck = useAppStore((s) => s.fetchDeck);
  const [locationDenied, setLocationDenied] = useState(false);

  const resolveInitial = async (): Promise<void> => {
    const res = await resolveGpsLocation();
    if (res.status === 'ok') {
      setUserLocation(res.coords);
      await fetchDeck();
    } else if (res.status === 'denied') {
      setLocationDenied(true);
    }
  };

  const requestLocation = async (): Promise<void> => {
    const res = await resolveGpsLocation();
    if (res.status === 'ok') {
      setLocationDenied(false);
      setUserLocation(res.coords);
      fetchDeck();
    } else if (res.status === 'denied') {
      setLocationDenied(true);
    }
  };

  return { locationDenied, requestLocation, resolveInitial };
}
