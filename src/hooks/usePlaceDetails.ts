import { useState, useEffect } from 'react';
import { PlaceExtraDetails } from '../types';
import { fetchPlaceDetails } from '../api/googlePlaces';

// Module-level cache — persists for the app session, no re-fetches on re-mount
const detailsCache = new Map<string, PlaceExtraDetails>();

export function usePlaceDetails(placeId: string) {
  const cached = detailsCache.get(placeId);
  const [details, setDetails] = useState<PlaceExtraDetails | null>(cached ?? null);
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    if (detailsCache.has(placeId)) {
      setDetails(detailsCache.get(placeId)!);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchPlaceDetails(placeId).then((d) => {
      /* istanbul ignore next -- unmount race guard */
      if (cancelled) return;
      if (d) {
        detailsCache.set(placeId, d);
        setDetails(d);
      }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [placeId]);

  return { details, isLoading };
}
