import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, DEFAULT_FILTERS } from '../store/useAppStore';
import * as api from '../api/googlePlaces';
import { MOCK_PLACES } from './fixtures/places';

jest.mock('../api/googlePlaces');
jest.mock('../store/savedSync', () => ({
  enqueue: jest.fn(async () => []),
  flushQueue: jest.fn(async () => {}),
  pullAndMerge: jest.fn(async () => ({})),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const LOC = { lat: 51.5, lng: -0.1 };
const MIN = 60 * 1000;

let now = 1_000_000;
const flush = () => new Promise((r) => setTimeout(r, 0));

function resetStore() {
  useAppStore.setState({
    userLocation: LOC,
    filters: { ...DEFAULT_FILTERS },
    deck: [],
    allFetchedPlaces: [],
    seenIds: new Set(),
    swipedIds: new Set(),
    nextPageToken: null,
    isLoading: false,
    isLoadingMore: false,
    totalFetched: 0,
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  now = 1_000_000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  mockedApi.fetchNearbyPlaces.mockResolvedValue({
    places: [...MOCK_PLACES],
    nextPageToken: 'TKN',
  });
  resetStore();
});

afterEach(() => jest.restoreAllMocks());

describe('fetchDeck', () => {
  it('does nothing without a location', async () => {
    useAppStore.setState({ userLocation: null });
    await useAppStore.getState().fetchDeck();
    expect(mockedApi.fetchNearbyPlaces).not.toHaveBeenCalled();
  });

  it('fetches fresh when there is no cache and populates the deck', async () => {
    await useAppStore.getState().fetchDeck();
    expect(mockedApi.fetchNearbyPlaces).toHaveBeenCalledTimes(1);
    const s = useAppStore.getState();
    expect(s.deck).toHaveLength(MOCK_PLACES.length);
    expect(s.nextPageToken).toBe('TKN');
    expect(s.isLoading).toBe(false);
  });

  it('serves a FRESH cache WITHOUT a billed revalidation (HIGH-2)', async () => {
    await useAppStore.getState().fetchDeck(); // seeds cache at now
    mockedApi.fetchNearbyPlaces.mockClear();

    now += 5 * MIN; // within the 10-min fresh window
    resetStore();
    await useAppStore.getState().fetchDeck();
    await flush();

    expect(mockedApi.fetchNearbyPlaces).not.toHaveBeenCalled();
    expect(useAppStore.getState().deck).toHaveLength(MOCK_PLACES.length);
  });

  it('revalidates in the background when the cache is stale-ish (10–30 min)', async () => {
    await useAppStore.getState().fetchDeck();
    mockedApi.fetchNearbyPlaces.mockClear();

    now += 15 * MIN;
    resetStore();
    await useAppStore.getState().fetchDeck();
    await flush();

    expect(mockedApi.fetchNearbyPlaces).toHaveBeenCalledTimes(1);
  });

  it('re-fetches with a spinner once the cache has expired (>30 min)', async () => {
    await useAppStore.getState().fetchDeck();
    mockedApi.fetchNearbyPlaces.mockClear();

    now += 31 * MIN;
    resetStore();
    await useAppStore.getState().fetchDeck();

    expect(mockedApi.fetchNearbyPlaces).toHaveBeenCalledTimes(1);
  });

  it('hides already-swiped places when hideSeen is on', async () => {
    useAppStore.setState({
      filters: { ...DEFAULT_FILTERS, hideSeen: true },
      swipedIds: new Set(['place-1', 'place-2']),
    });
    await useAppStore.getState().fetchDeck();
    const ids = useAppStore.getState().deck.map((p) => p.id);
    expect(ids).not.toContain('place-1');
    expect(ids).not.toContain('place-2');
    expect(ids).toHaveLength(MOCK_PLACES.length - 2);
  });

  it('passes the distance unit through to the API', async () => {
    useAppStore.setState({
      preferences: { ...useAppStore.getState().preferences, distanceUnit: 'mi' },
    });
    await useAppStore.getState().fetchDeck();
    // fetchNearbyPlaces(lat, lng, filters, pageToken, distanceUnit)
    expect(mockedApi.fetchNearbyPlaces.mock.calls[0][4]).toBe('mi');
  });

  it('sets deckError on a failed fresh fetch and clears it on the next success', async () => {
    mockedApi.fetchNearbyPlaces.mockRejectedValueOnce(new Error('network down'));
    await useAppStore.getState().fetchDeck();
    expect(useAppStore.getState().deckError).toBeTruthy();
    expect(useAppStore.getState().isLoading).toBe(false);

    now += 60 * MIN; // bust the cache
    await useAppStore.getState().fetchDeck();
    expect(useAppStore.getState().deckError).toBeNull();
    expect(useAppStore.getState().deck.length).toBe(MOCK_PLACES.length);
  });
});

describe('fetchMoreDeck', () => {
  it('does nothing without a nextPageToken', async () => {
    useAppStore.setState({ nextPageToken: null });
    await useAppStore.getState().fetchMoreDeck();
    expect(mockedApi.fetchNearbyPlaces).not.toHaveBeenCalled();
  });

  it('appends only unseen places', async () => {
    useAppStore.setState({
      deck: [MOCK_PLACES[0]],
      allFetchedPlaces: [MOCK_PLACES[0]],
      seenIds: new Set(['place-1']),
      nextPageToken: 'TKN',
      totalFetched: 1,
    });
    // API returns place-1 (already seen) + place-2/place-3 (new)
    mockedApi.fetchNearbyPlaces.mockResolvedValueOnce({
      places: [MOCK_PLACES[0], MOCK_PLACES[1], MOCK_PLACES[2]],
      nextPageToken: null,
    });

    await useAppStore.getState().fetchMoreDeck();

    const ids = useAppStore.getState().deck.map((p) => p.id);
    expect(ids).toEqual(['place-1', 'place-2', 'place-3']);
    expect(useAppStore.getState().nextPageToken).toBeNull();
  });

  it('clears the loading-more flag when the fetch fails', async () => {
    useAppStore.setState({ nextPageToken: 'TKN', isLoadingMore: false });
    mockedApi.fetchNearbyPlaces.mockRejectedValueOnce(new Error('boom'));
    await useAppStore.getState().fetchMoreDeck();
    expect(useAppStore.getState().isLoadingMore).toBe(false);
  });
});
