import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useAppStore } from '../store/useAppStore';
import { Place, Filters } from '../types';

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
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);
    if (!pos) return { status: 'unavailable' };
    return { status: 'ok', coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } };
  } catch {
    return { status: 'unavailable' };
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
  const setFilters = useAppStore((s) => s.setFilters);
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
  const deckError = useAppStore((s) => s.deckError);

  const [locationDenied, setLocationDenied] = useState(false);
  const isMounted = useRef(false);

  // Auto-fetch more when 3 cards remain and a next page exists
  useEffect(() => {
    if (!isMounted.current) return;
    if (deck.length <= 3 && nextPageToken && !isLoading && !isLoadingMore) {
      fetchMoreDeck();
    }
  }, [deck.length, nextPageToken, isLoading, isLoadingMore]);

  // On mount: load saved filters first, then try GPS (unless the user disabled
  // location services in Settings — then we never prompt).
  useEffect(() => {
    (async () => {
      await hydrateFilters();
      const locationEnabled = useAppStore.getState().preferences.notifications.location;
      if (locationEnabled) {
        const res = await resolveGpsLocation();
        if (res.status === 'ok') {
          setUserLocation(res.coords);
          await fetchDeck();
        } else if (res.status === 'denied') {
          setLocationDenied(true);
        }
      }
      isMounted.current = true;
    })();
  }, []);

  // Re-request GPS on demand (e.g. from the "enable location" empty state)
  const requestLocation = async () => {
    const res = await resolveGpsLocation();
    if (res.status === 'ok') {
      setLocationDenied(false);
      setUserLocation(res.coords);
      fetchDeck();
    } else if (res.status === 'denied') {
      setLocationDenied(true);
    }
  };

  // Re-fetch when filter values actually change (skip if same). Debounced so
  // rapid browse-category toggles collapse into a single request.
  const filtersKey = JSON.stringify(filters);
  const prevFiltersKey = useRef(filtersKey);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isMounted.current) return;
    if (prevFiltersKey.current === filtersKey) return;
    prevFiltersKey.current = filtersKey;

    if (refetchTimer.current) clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => fetchDeck(), 400);
    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
    };
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

  const setMode = (mode: Filters['mode']) => setFilters({ mode });

  const toggleCategory = (category: string) => {
    const current = filters.categories;
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setFilters({ categories: next });
  };

  const submitSearch = (text: string) => setFilters({ query: text });

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
    deckError,
    locationDenied,
    requestLocation,
    retryFetch: fetchDeck,
    mode: filters.mode,
    categories: filters.categories,
    query: filters.query,
    setMode,
    toggleCategory,
    submitSearch,
    like,
    pass,
    undo,
    reset,
  };
}
