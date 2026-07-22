import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore, DEFAULT_FILTERS } from '../store/useAppStore';
import { savedKey } from '../store/savedStorage';
import * as sync from '../store/savedSync';
import { MOCK_PLACES } from './fixtures/places';
import { buildSavedMap } from './fixtures/saved';

jest.mock('../store/savedSync', () => ({
  // reconcileConcurrent is a pure helper — use the real implementation.
  reconcileConcurrent: jest.requireActual('../store/savedSync').reconcileConcurrent,
  enqueue: jest.fn(async () => []),
  flushQueue: jest.fn(async () => {}),
  pullAndMerge: jest.fn(async () => ({})),
}));

const mockedSync = sync as jest.Mocked<typeof sync>;
const [p1, p2, p3] = MOCK_PLACES;
// The app is auth-gated, so saving always happens with a signed-in user.
const USER = { id: 'u1', email: 'e', name: 'n', createdAt: '2025-01-01' };

function resetStore() {
  useAppStore.setState({
    user: USER,
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

describe('setUser', () => {
  it('sets the user when signing in', () => {
    useAppStore.setState({ user: null });
    useAppStore.getState().setUser(USER);
    expect(useAppStore.getState().user).toEqual(USER);
  });

  it('clears in-memory saved/deck/history on sign-out', () => {
    useAppStore.setState({
      savedPlacesById: buildSavedMap([p1, p2]),
      history: [{ place: p1, action: 'like' }],
      deck: [p3],
    });
    useAppStore.getState().setUser(null);
    const s = useAppStore.getState();
    expect(s.user).toBeNull();
    expect(s.savedPlacesById).toEqual({});
    expect(s.history).toEqual([]);
    expect(s.deck).toEqual([]);
  });
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

  it('enqueues a save op for the signed-in user', () => {
    useAppStore.getState().swipeLike(p1);
    expect(mockedSync.enqueue).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ type: 'save', place: p1, visited: false })
    );
  });

  it('persists the snapshot under the per-user key', async () => {
    useAppStore.getState().swipeLike(p1);
    await Promise.resolve();
    const raw = await AsyncStorage.getItem(savedKey('u1'));
    expect(raw && JSON.parse(raw).places[p1.id]).toBeTruthy();
  });

  it('flushes the sync queue when a user is signed in', async () => {
    useAppStore.getState().swipeLike(p1);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockedSync.flushQueue).toHaveBeenCalledWith('u1');
  });

  it('keeps a save in memory but does not persist when signed out', () => {
    useAppStore.setState({ user: null });
    useAppStore.getState().swipeLike(p1);
    expect(useAppStore.getState().isSaved(p1.id)).toBe(true);
    expect(mockedSync.enqueue).not.toHaveBeenCalled();
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
    expect(mockedSync.enqueue).toHaveBeenLastCalledWith('u1', { type: 'unsave', placeId: p1.id });
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
    expect(mockedSync.enqueue).toHaveBeenCalledWith('u1', { type: 'unsave', placeId: p1.id });
  });

  it('is a no-op for an unknown id', () => {
    useAppStore.getState().removeSaved('nope');
    expect(mockedSync.enqueue).not.toHaveBeenCalled();
  });
});

describe('restoreSaved', () => {
  it('re-adds a removed place with its original savedAt/visited and enqueues a save', () => {
    const map = buildSavedMap([p1], { 'place-1': { visited: true, savedAt: '2025-02-02T00:00:00Z' } });
    const saved = map[p1.id];
    useAppStore.getState().restoreSaved(saved);
    const s = useAppStore.getState();
    expect(s.savedPlacesById[p1.id]).toEqual(saved);
    expect(mockedSync.enqueue).toHaveBeenCalledWith(
      'u1',
      { type: 'save', place: saved, savedAt: '2025-02-02T00:00:00Z', visited: true }
    );
  });
});

describe('toggleVisited', () => {
  it('flips visited and enqueues a visited op', () => {
    useAppStore.setState({ savedPlacesById: buildSavedMap([p1]) });
    useAppStore.getState().toggleVisited(p1.id);
    expect(useAppStore.getState().savedPlacesById[p1.id].visited).toBe(true);
    expect(mockedSync.enqueue).toHaveBeenCalledWith('u1', { type: 'visited', placeId: p1.id, visited: true });
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
    await AsyncStorage.setItem(savedKey('u1'), JSON.stringify(map));
    await useAppStore.getState().hydrateSaved('u1');
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

  it('preserves a swipe made while sync is in flight', async () => {
    useAppStore.setState({ savedPlacesById: {} });
    // Remote returns only p3, but a like for p2 lands during the await.
    mockedSync.pullAndMerge.mockImplementationOnce(async () => {
      useAppStore.getState().swipeLike(p2);
      return buildSavedMap([p3]);
    });
    await useAppStore.getState().syncSaved('u1');
    const s = useAppStore.getState();
    expect(s.isSaved(p3.id)).toBe(true); // merged from remote
    expect(s.isSaved(p2.id)).toBe(true); // concurrent swipe not clobbered
  });
});
