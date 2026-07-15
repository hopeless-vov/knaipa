import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, DEFAULT_FILTERS } from '../store/useAppStore';
import { SAVED_KEY } from '../store/savedStorage';
import * as sync from '../store/savedSync';
import { MOCK_PLACES } from './fixtures/places';
import { buildSavedMap } from './fixtures/saved';

jest.mock('../store/savedSync', () => ({
  enqueue: jest.fn(async () => []),
  flushQueue: jest.fn(async () => {}),
  pullAndMerge: jest.fn(async () => ({})),
}));

const mockedSync = sync as jest.Mocked<typeof sync>;
const [p1, p2, p3] = MOCK_PLACES;

function resetStore() {
  useAppStore.setState({
    user: null,
    deck: [...MOCK_PLACES],
    allFetchedPlaces: [...MOCK_PLACES],
    savedPlacesById: {},
    swipedIds: new Set(),
    history: [],
    filters: { ...DEFAULT_FILTERS },
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  resetStore();
});

describe('swipeLike', () => {
  it('saves the place, removes it from the deck, and records history', () => {
    useAppStore.getState().swipeLike(p1);
    const s = useAppStore.getState();
    expect(s.isSaved(p1.id)).toBe(true);
    expect(s.savedPlacesById[p1.id].visited).toBe(false);
    expect(s.savedPlacesById[p1.id].savedAt).toBeTruthy();
    expect(s.deck.find((p) => p.id === p1.id)).toBeUndefined();
    expect(s.swipedIds.has(p1.id)).toBe(true);
    expect(s.history[0]).toEqual({ place: p1, action: 'like' });
  });

  it('enqueues a save op', () => {
    useAppStore.getState().swipeLike(p1);
    expect(mockedSync.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'save', place: p1, visited: false })
    );
  });

  it('persists the snapshot locally', async () => {
    useAppStore.getState().swipeLike(p1);
    await Promise.resolve();
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    expect(raw && JSON.parse(raw)[p1.id]).toBeTruthy();
  });
});

describe('swipePass', () => {
  it('removes the card without saving', () => {
    useAppStore.getState().swipePass(p1);
    const s = useAppStore.getState();
    expect(s.isSaved(p1.id)).toBe(false);
    expect(s.deck.find((p) => p.id === p1.id)).toBeUndefined();
    expect(s.history[0]).toEqual({ place: p1, action: 'pass' });
    expect(mockedSync.enqueue).not.toHaveBeenCalled();
  });
});

describe('undoSwipe', () => {
  it('unsaves and restores the deck after a like', () => {
    const store = useAppStore.getState();
    store.swipeLike(p1);
    useAppStore.getState().undoSwipe();
    const s = useAppStore.getState();
    expect(s.isSaved(p1.id)).toBe(false);
    expect(s.deck[0].id).toBe(p1.id);
    expect(mockedSync.enqueue).toHaveBeenLastCalledWith({ type: 'unsave', placeId: p1.id });
  });

  it('restores the deck after a pass without touching saved', () => {
    useAppStore.getState().swipePass(p1);
    useAppStore.getState().undoSwipe();
    expect(useAppStore.getState().deck[0].id).toBe(p1.id);
  });

  it('is a no-op with empty history', () => {
    useAppStore.setState({ history: [], deck: [] });
    useAppStore.getState().undoSwipe();
    expect(useAppStore.getState().deck).toHaveLength(0);
  });
});

describe('removeSaved', () => {
  it('deletes a saved place and enqueues an unsave', () => {
    useAppStore.setState({ savedPlacesById: buildSavedMap([p1, p2]) });
    useAppStore.getState().removeSaved(p1.id);
    expect(useAppStore.getState().isSaved(p1.id)).toBe(false);
    expect(mockedSync.enqueue).toHaveBeenCalledWith({ type: 'unsave', placeId: p1.id });
  });

  it('is a no-op for an unknown id', () => {
    useAppStore.getState().removeSaved('nope');
    expect(mockedSync.enqueue).not.toHaveBeenCalled();
  });
});

describe('toggleVisited', () => {
  it('flips visited and enqueues a visited op', () => {
    useAppStore.setState({ savedPlacesById: buildSavedMap([p1]) });
    useAppStore.getState().toggleVisited(p1.id);
    expect(useAppStore.getState().savedPlacesById[p1.id].visited).toBe(true);
    expect(mockedSync.enqueue).toHaveBeenCalledWith({ type: 'visited', placeId: p1.id, visited: true });
  });

  it('is a no-op for an unknown id', () => {
    useAppStore.getState().toggleVisited('nope');
    expect(mockedSync.enqueue).not.toHaveBeenCalled();
  });
});

describe('savedPlaces getter', () => {
  it('returns the list newest-first', () => {
    useAppStore.setState({
      savedPlacesById: buildSavedMap([p1, p2, p3], {
        'place-1': { savedAt: '2025-05-01T00:00:00Z' },
        'place-2': { savedAt: '2025-05-03T00:00:00Z' },
        'place-3': { savedAt: '2025-05-02T00:00:00Z' },
      }),
    });
    expect(useAppStore.getState().savedPlaces().map((p) => p.id)).toEqual([
      'place-2',
      'place-3',
      'place-1',
    ]);
  });
});

describe('activeFilterCount', () => {
  it('is 0 for defaults', () => {
    expect(useAppStore.getState().activeFilterCount()).toBe(0);
  });

  it('counts modal refinements (locText, sort, minReviews, hideSeen) but not header categories/query', () => {
    useAppStore.setState({
      filters: {
        ...DEFAULT_FILTERS,
        // header controls — must NOT be counted
        categories: ['Food', 'Bar'],
        query: 'ramen',
        // modal refinements — counted
        locText: 'Kyiv',
        sort: 'rating',
        minReviews: '200+',
        hideSeen: true,
      },
    });
    expect(useAppStore.getState().activeFilterCount()).toBe(4);
  });
});

describe('hydrateSaved / syncSaved', () => {
  it('hydrates the snapshot from local storage', async () => {
    const map = buildSavedMap([p1, p2]);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(map));
    await useAppStore.getState().hydrateSaved();
    expect(useAppStore.getState().savedPlacesById).toEqual(map);
  });

  it('replaces the snapshot with the merged result and flushes', async () => {
    const merged = buildSavedMap([p3]);
    mockedSync.pullAndMerge.mockResolvedValueOnce(merged);
    await useAppStore.getState().syncSaved('user-1');
    expect(useAppStore.getState().savedPlacesById).toEqual(merged);
    expect(mockedSync.flushQueue).toHaveBeenCalledWith('user-1');
  });

  it('leaves the local snapshot intact when sync fails', async () => {
    useAppStore.setState({ savedPlacesById: buildSavedMap([p1]) });
    mockedSync.pullAndMerge.mockRejectedValueOnce(new Error('offline'));
    await useAppStore.getState().syncSaved('user-1');
    expect(useAppStore.getState().isSaved(p1.id)).toBe(true);
  });
});
