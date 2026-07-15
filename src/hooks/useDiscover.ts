import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '../store/useAppStore';
import { Place } from '../types';

async function resolveGpsLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const last = await Location.getLastKnownPositionAsync({});
    if (last) return { lat: last.coords.latitude, lng: last.coords.longitude };
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);
    if (!pos) return null;
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}


export function useDiscover() {
  const deck = useAppStore((s) => s.deck);
  const history = useAppStore((s) => s.history);
  const swipeLike = useAppStore((s) => s.swipeLike);
  const swipePass = useAppStore((s) => s.swipePass);
  const undoSwipe = useAppStore((s) => s.undoSwipe);
  const resetDeck = useAppStore((s) => s.resetDeck);
  const activeFilterCount = useAppStore((s) => s.activeFilterCount);
  const fetchDeck = useAppStore((s) => s.fetchDeck);
  const fetchMoreDeck = useAppStore((s) => s.fetchMoreDeck);
  const hydrateFilters = useAppStore((s) => s.hydrateFilters);
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const isLoading = useAppStore((s) => s.isLoading);
  const isLoadingMore = useAppStore((s) => s.isLoadingMore);
  const filters = useAppStore((s) => s.filters);
  const totalFetched = useAppStore((s) => s.totalFetched);
  const nextPageToken = useAppStore((s) => s.nextPageToken);
  const userLocation = useAppStore((s) => s.userLocation);

  const isMounted = useRef(false);

  // Auto-fetch more when 3 cards remain and a next page exists
  useEffect(() => {
    if (!isMounted.current) return;
    if (deck.length <= 3 && nextPageToken && !isLoading && !isLoadingMore) {
      fetchMoreDeck();
    }
  }, [deck.length, nextPageToken, isLoading, isLoadingMore]);

  // On mount: load saved filters first, then try GPS
  useEffect(() => {
    (async () => {
      await hydrateFilters();
      const loc = await resolveGpsLocation();
      if (loc) {
        setUserLocation(loc);
        await fetchDeck();
      }
      isMounted.current = true;
    })();
  }, []);

  // Re-fetch when filter values actually change (skip if same)
  const filtersKey = JSON.stringify(filters);
  const prevFiltersKey = useRef(filtersKey);

  useEffect(() => {
    if (!isMounted.current) return;
    if (prevFiltersKey.current === filtersKey) return;
    prevFiltersKey.current = filtersKey;

    fetchDeck();
  }, [filtersKey]);

  const topCard: Place | undefined = deck[0];
  const deckIndex = totalFetched - deck.length;
  const totalDeck = totalFetched;
  const canUndo = history.length > 0;

  const like = () => {
    if (topCard) swipeLike(topCard);
  };

  const pass = () => {
    if (topCard) swipePass(topCard);
  };

  const undo = () => {
    undoSwipe();
  };

  const reset = () => {
    resetDeck();
  };

  return {
    deck,
    topCard,
    deckIndex,
    totalDeck,
    activeFilterCount: activeFilterCount(),
    canUndo,
    isLoading,
    isLoadingMore,
    hasLocation: userLocation !== null,
    like,
    pass,
    undo,
    reset,
  };
}
