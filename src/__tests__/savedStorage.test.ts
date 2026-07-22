import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  savedKey,
  loadSavedPlaces,
  persistSavedPlaces,
  clearSavedPlaces,
  toSavedList,
} from '../store/savedStorage';
import { MOCK_PLACES } from './fixtures/places';
import { buildSavedMap } from './fixtures/saved';

const U = 'user-1';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('loadSavedPlaces', () => {
  it('returns {} when nothing is stored', async () => {
    expect(await loadSavedPlaces(U)).toEqual({});
  });

  it('returns the parsed map when stored', async () => {
    const map = buildSavedMap(MOCK_PLACES.slice(0, 2));
    await AsyncStorage.setItem(savedKey(U), JSON.stringify(map));
    expect(await loadSavedPlaces(U)).toEqual(map);
  });

  it('returns {} on corrupt JSON', async () => {
    await AsyncStorage.setItem(savedKey(U), 'not-json{');
    expect(await loadSavedPlaces(U)).toEqual({});
  });

  it('returns {} when stored value is not an object', async () => {
    await AsyncStorage.setItem(savedKey(U), JSON.stringify(42));
    expect(await loadSavedPlaces(U)).toEqual({});
  });

  it('isolates data per user', async () => {
    const mapA = buildSavedMap(MOCK_PLACES.slice(0, 2));
    await persistSavedPlaces('user-A', mapA);
    expect(await loadSavedPlaces('user-B')).toEqual({});
    expect(await loadSavedPlaces('user-A')).toEqual(mapA);
  });
});

describe('persistSavedPlaces', () => {
  it('round-trips a map through storage', async () => {
    const map = buildSavedMap(MOCK_PLACES.slice(0, 3));
    await persistSavedPlaces(U, map);
    expect(await loadSavedPlaces(U)).toEqual(map);
  });

  it('swallows storage errors', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    await expect(persistSavedPlaces(U, {})).resolves.toBeUndefined();
  });
});

describe('clearSavedPlaces', () => {
  it('removes only the given user snapshot', async () => {
    await persistSavedPlaces('user-A', buildSavedMap([MOCK_PLACES[0]]));
    await persistSavedPlaces('user-B', buildSavedMap([MOCK_PLACES[1]]));
    await clearSavedPlaces('user-A');
    expect(await loadSavedPlaces('user-A')).toEqual({});
    expect(Object.keys(await loadSavedPlaces('user-B'))).toHaveLength(1);
  });

  it('swallows removal errors', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    await expect(clearSavedPlaces(U)).resolves.toBeUndefined();
  });
});

describe('toSavedList', () => {
  it('sorts by savedAt descending (newest first)', () => {
    const map = buildSavedMap(MOCK_PLACES.slice(0, 3), {
      'place-1': { savedAt: '2025-05-01T00:00:00Z' },
      'place-2': { savedAt: '2025-05-03T00:00:00Z' },
      'place-3': { savedAt: '2025-05-02T00:00:00Z' },
    });
    const list = toSavedList(map);
    expect(list.map((p) => p.id)).toEqual(['place-2', 'place-3', 'place-1']);
  });

  it('returns [] for an empty map', () => {
    expect(toSavedList({})).toEqual([]);
  });
});
