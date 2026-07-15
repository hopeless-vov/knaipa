import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Place } from '../types';

export function useFindPlace(placeId: string): Place | null {
  const allFetchedPlaces = useAppStore((s) => s.allFetchedPlaces);
  return useMemo(
    () => allFetchedPlaces.find((p) => p.id === placeId) ?? null,
    [allFetchedPlaces, placeId]
  );
}
