import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place, SavedPlace, User, Filters, SwipeHistoryEntry, UserPreferences } from '../types';
import { fetchNearbyPlaces } from '../api/googlePlaces';

const FILTERS_KEY = '@kutok/filters';
const DECK_CACHE_PREFIX = '@kutok/deck:';
const DECK_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const DEFAULT_FILTERS: Filters = {
  locText: '',
  radius: 'near',
  category: 'All',
  price: 'any',
  rating: 'any',
  availability: 'any',
  sort: 'relevance',
  minReviews: 'any',
  hideSeen: false,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  distanceUnit: 'km',
  language: 'en',
  notifications: {
    push: true,
    email: false,
    location: true,
  },
};

const MAX_HISTORY = 10;

interface AppState {
  user: User | null;
  deck: Place[];
  allFetchedPlaces: Place[];
  seenIds: Set<string>;
  swipedIds: Set<string>;
  history: SwipeHistoryEntry[];
  savedIds: Set<string>;
  visitedMap: Record<string, boolean>;
  filters: Filters;
  preferences: UserPreferences;
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  totalFetched: number;
  nextPageToken: string | null;

  // Actions
  setUser: (user: User | null) => void;
  swipeLike: (place: Place) => void;
  swipePass: (place: Place) => void;
  undoSwipe: () => void;
  resetDeck: () => void;
  addSaved: (placeId: string) => void;
  removeSaved: (placeId: string) => void;
  toggleVisited: (placeId: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  fetchDeck: () => Promise<void>;
  fetchMoreDeck: () => Promise<void>;
  hydrateFilters: () => Promise<void>;

  // Getters
  savedPlaces: () => SavedPlace[];
  activeFilterCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  deck: [],
  allFetchedPlaces: [],
  seenIds: new Set(),
  swipedIds: new Set(),
  history: [],
  savedIds: new Set(),
  visitedMap: {},
  filters: { ...DEFAULT_FILTERS },
  preferences: { ...DEFAULT_PREFERENCES },
  userLocation: null,
  isLoading: false,
  isLoadingMore: false,
  totalFetched: 0,
  nextPageToken: null,

  setUser: (user) => set({ user }),

  setUserLocation: (loc) => set({ userLocation: loc }),

  hydrateFilters: async () => {
    try {
      const raw = await SecureStore.getItemAsync(FILTERS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Filters>;
        set((state) => ({ filters: { ...DEFAULT_FILTERS, ...state.filters, ...saved } }));
      }
    } catch {}
  },

  fetchDeck: async () => {
    const state = get();
    if (!state.userLocation) return;

    const { lat, lng } = state.userLocation;
    const cacheKey = `${DECK_CACHE_PREFIX}${JSON.stringify(state.filters)}:${Math.round(lat * 100)}:${Math.round(lng * 100)}`;

    const applyPlaces = (places: Place[], nextPageToken: string | null) => {
      const { swipedIds, filters } = get();
      const visible = filters.hideSeen ? places.filter((p) => !swipedIds.has(p.id)) : places;
      set({
        deck: visible,
        allFetchedPlaces: visible,
        totalFetched: visible.length,
        nextPageToken,
        seenIds: new Set(visible.map((p) => p.id)),
        isLoading: false,
      });
    };

    const fetchFresh = async (background: boolean) => {
      const s = get();
      if (!s.userLocation) return;
      try {
        const { places, nextPageToken } = await fetchNearbyPlaces(s.userLocation.lat, s.userLocation.lng, s.filters);
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: places, nextPageToken, timestamp: Date.now() }));
        applyPlaces(places, nextPageToken);
      } catch (err) {
        if (!background) {
          console.error('fetchDeck error:', err);
          set({ isLoading: false });
        }
      }
    };

    // Try cached data first
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const { data, nextPageToken, timestamp } = JSON.parse(raw) as { data: Place[]; nextPageToken: string | null; timestamp: number };
        if (Date.now() - timestamp < DECK_CACHE_TTL_MS) {
          applyPlaces(data, nextPageToken);
          fetchFresh(true); // silent background revalidation
          return;
        }
      }
    } catch {}

    // No valid cache — show spinner
    set({ isLoading: true, deck: [], nextPageToken: null, seenIds: new Set() });
    await fetchFresh(false);
  },

  fetchMoreDeck: async () => {
    const state = get();
    if (!state.userLocation || !state.nextPageToken || state.isLoadingMore) return;
    set({ isLoadingMore: true });
    try {
      const { places: newPlaces, nextPageToken } = await fetchNearbyPlaces(
        state.userLocation.lat,
        state.userLocation.lng,
        state.filters,
        state.nextPageToken
      );
      const { seenIds, swipedIds, filters, deck, allFetchedPlaces } = get();
      let fresh = newPlaces.filter((p) => !seenIds.has(p.id));
      if (filters.hideSeen) fresh = fresh.filter((p) => !swipedIds.has(p.id));
      const newSeenIds = new Set([...seenIds, ...fresh.map((p) => p.id)]);
      set({
        deck: [...deck, ...fresh],
        allFetchedPlaces: [...allFetchedPlaces, ...fresh],
        totalFetched: allFetchedPlaces.length + fresh.length,
        nextPageToken,
        seenIds: newSeenIds,
        isLoadingMore: false,
      });
    } catch (err) {
      console.error('fetchMoreDeck error:', err);
      set({ isLoadingMore: false });
    }
  },

  swipeLike: (place) => {
    const { history, savedIds, visitedMap, swipedIds } = get();
    const newHistory = [{ place, action: 'like' as const }, ...history].slice(0, MAX_HISTORY);
    const newSavedIds = new Set(savedIds);
    newSavedIds.add(place.id);
    const newVisitedMap = { ...visitedMap };
    if (!(place.id in newVisitedMap)) {
      newVisitedMap[place.id] = false;
    }
    const newSwipedIds = new Set(swipedIds);
    newSwipedIds.add(place.id);
    set((state) => ({
      deck: state.deck.filter((p) => p.id !== place.id),
      history: newHistory,
      savedIds: newSavedIds,
      visitedMap: newVisitedMap,
      swipedIds: newSwipedIds,
    }));
  },

  swipePass: (place) => {
    const { history, swipedIds } = get();
    const newHistory = [{ place, action: 'pass' as const }, ...history].slice(0, MAX_HISTORY);
    const newSwipedIds = new Set(swipedIds);
    newSwipedIds.add(place.id);
    set((state) => ({
      deck: state.deck.filter((p) => p.id !== place.id),
      history: newHistory,
      swipedIds: newSwipedIds,
    }));
  },

  undoSwipe: () => {
    const { history, savedIds, visitedMap } = get();
    if (history.length === 0) return;
    const [last, ...rest] = history;
    const newSavedIds = new Set(savedIds);
    const newVisitedMap = { ...visitedMap };
    if (last.action === 'like') {
      newSavedIds.delete(last.place.id);
      delete newVisitedMap[last.place.id];
    }
    set((state) => ({
      deck: [last.place, ...state.deck],
      history: rest,
      savedIds: newSavedIds,
      visitedMap: newVisitedMap,
    }));
  },

  resetDeck: () => {
    const { allFetchedPlaces } = get();
    set({ deck: [...allFetchedPlaces], history: [] });
  },

  addSaved: (placeId) => {
    set((state) => {
      const newSavedIds = new Set(state.savedIds);
      newSavedIds.add(placeId);
      const newVisitedMap = { ...state.visitedMap };
      if (!(placeId in newVisitedMap)) {
        newVisitedMap[placeId] = false;
      }
      return { savedIds: newSavedIds, visitedMap: newVisitedMap };
    });
  },

  removeSaved: (placeId) => {
    set((state) => {
      const newSavedIds = new Set(state.savedIds);
      newSavedIds.delete(placeId);
      const newVisitedMap = { ...state.visitedMap };
      delete newVisitedMap[placeId];
      return { savedIds: newSavedIds, visitedMap: newVisitedMap };
    });
  },

  toggleVisited: (placeId) => {
    set((state) => ({
      visitedMap: {
        ...state.visitedMap,
        [placeId]: !state.visitedMap[placeId],
      },
    }));
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setPreference: (key, value) => {
    set((state) => ({ preferences: { ...state.preferences, [key]: value } }));
  },

  savedPlaces: () => {
    const { savedIds, visitedMap, allFetchedPlaces } = get();
    const pool = allFetchedPlaces;
    return pool.filter((p) => savedIds.has(p.id)).map((p) => ({
      ...p,
      visited: visitedMap[p.id] ?? false,
      savedAt: new Date().toISOString(),
    }));
  },

  activeFilterCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.locText) count++;
    if (filters.radius !== DEFAULT_FILTERS.radius) count++;
    if (filters.category !== DEFAULT_FILTERS.category) count++;
    if (filters.price !== DEFAULT_FILTERS.price) count++;
    if (filters.rating !== DEFAULT_FILTERS.rating) count++;
    if (filters.availability !== 'any') count++;
    return count;
  },
}));
