import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Place, SavedPlace, User, Filters, SwipeHistoryEntry, UserPreferences } from '../types';
import { fetchNearbyPlaces } from '../api/googlePlaces';
import {
  SavedPlacesById,
  loadSavedPlaces,
  persistSavedPlaces,
  toSavedList,
} from './savedStorage';
import { SyncOp, enqueue, flushQueue, pullAndMerge } from './savedSync';

export const FILTERS_KEY = '@knaipa/filters';
const DECK_CACHE_PREFIX = '@knaipa/deck:';
const DECK_CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — cache still usable
// Within this window a cache hit is served with NO background request (saves
// billed searches on repeat opens). Between this and the TTL we revalidate.
const DECK_REVALIDATE_AFTER_MS = 10 * 60 * 1000; // 10 minutes

export const DEFAULT_FILTERS: Filters = {
  mode: 'browse',
  categories: [],
  query: '',
  locText: '',
  radius: 'near',
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
  savedPlacesById: SavedPlacesById;
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
  removeSaved: (placeId: string) => void;
  toggleVisited: (placeId: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
  fetchDeck: () => Promise<void>;
  fetchMoreDeck: () => Promise<void>;
  hydrateFilters: () => Promise<void>;
  hydrateSaved: () => Promise<void>;
  syncSaved: (userId: string) => Promise<void>;

  // Getters
  savedPlaces: () => SavedPlace[];
  isSaved: (placeId: string) => boolean;
  activeFilterCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => {
  /**
   * Commits a new saved snapshot: updates state, persists locally, and (if
   * signed in) enqueues a sync op and kicks a background flush.
   */
  const commitSaved = (next: SavedPlacesById, op: SyncOp) => {
    set({ savedPlacesById: next });
    persistSavedPlaces(next);
    enqueue(op).then(() => {
      const { user } = get();
      if (user) flushQueue(user.id);
    });
  };

  return {
    user: null,
    deck: [],
    allFetchedPlaces: [],
    seenIds: new Set(),
    swipedIds: new Set(),
    history: [],
    savedPlacesById: {},
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

    hydrateSaved: async () => {
      const map = await loadSavedPlaces();
      set({ savedPlacesById: map });
    },

    syncSaved: async (userId) => {
      try {
        const merged = await pullAndMerge(userId, get().savedPlacesById);
        set({ savedPlacesById: merged });
        await persistSavedPlaces(merged);
        await flushQueue(userId);
      } catch {
        // Offline / transient — local snapshot stays authoritative
      }
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
          const age = Date.now() - timestamp;
          if (age < DECK_CACHE_TTL_MS) {
            applyPlaces(data, nextPageToken);
            // Only spend a billed request revalidating once the cache is stale-ish
            if (age >= DECK_REVALIDATE_AFTER_MS) {
              fetchFresh(true); // silent background revalidation
            }
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
      const { history, savedPlacesById, swipedIds } = get();
      const newHistory = [{ place, action: 'like' as const }, ...history].slice(0, MAX_HISTORY);
      const existing = savedPlacesById[place.id];
      const savedAt = existing?.savedAt ?? new Date().toISOString();
      const visited = existing?.visited ?? false;
      const saved: SavedPlace = { ...place, visited, savedAt };
      const next = { ...savedPlacesById, [place.id]: saved };
      const newSwipedIds = new Set(swipedIds);
      newSwipedIds.add(place.id);
      set((state) => ({
        deck: state.deck.filter((p) => p.id !== place.id),
        history: newHistory,
        swipedIds: newSwipedIds,
      }));
      commitSaved(next, { type: 'save', place, savedAt, visited });
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
      const { history, savedPlacesById } = get();
      if (history.length === 0) return;
      const [last, ...rest] = history;
      set((state) => ({
        deck: [last.place, ...state.deck],
        history: rest,
      }));
      if (last.action === 'like') {
        const next = { ...savedPlacesById };
        delete next[last.place.id];
        commitSaved(next, { type: 'unsave', placeId: last.place.id });
      }
    },

    resetDeck: () => {
      const { allFetchedPlaces } = get();
      set({ deck: [...allFetchedPlaces], history: [] });
    },

    removeSaved: (placeId) => {
      const { savedPlacesById } = get();
      if (!(placeId in savedPlacesById)) return;
      const next = { ...savedPlacesById };
      delete next[placeId];
      commitSaved(next, { type: 'unsave', placeId });
    },

    toggleVisited: (placeId) => {
      const { savedPlacesById } = get();
      const existing = savedPlacesById[placeId];
      if (!existing) return;
      const visited = !existing.visited;
      const next = { ...savedPlacesById, [placeId]: { ...existing, visited } };
      commitSaved(next, { type: 'visited', placeId, visited });
    },

    setFilters: (filters) => {
      set((state) => ({ filters: { ...state.filters, ...filters } }));
    },

    setPreference: (key, value) => {
      set((state) => ({ preferences: { ...state.preferences, [key]: value } }));
    },

    savedPlaces: () => toSavedList(get().savedPlacesById),

    isSaved: (placeId) => placeId in get().savedPlacesById,

    // Counts only the refinements hidden behind the Filters modal.
    // Mode / categories / query live in the Discover header (always visible).
    activeFilterCount: () => {
      const { filters } = get();
      let count = 0;
      if (filters.locText) count++;
      if (filters.radius !== DEFAULT_FILTERS.radius) count++;
      if (filters.price !== DEFAULT_FILTERS.price) count++;
      if (filters.rating !== DEFAULT_FILTERS.rating) count++;
      if (filters.availability !== DEFAULT_FILTERS.availability) count++;
      if (filters.sort !== DEFAULT_FILTERS.sort) count++;
      if (filters.minReviews !== DEFAULT_FILTERS.minReviews) count++;
      if (filters.hideSeen !== DEFAULT_FILTERS.hideSeen) count++;
      return count;
    },
  };
});
