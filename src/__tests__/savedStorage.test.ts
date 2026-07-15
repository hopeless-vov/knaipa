import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SAVED_KEY,
  loadSavedPlaces,
  persistSavedPlaces,
  toSavedList,
} from '../store/savedStorage';
import { MOCK_PLACES } from './fixtures/places';
import { buildSavedMap } from './fixtures/saved';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('loadSavedPlaces', () => {
  it('returns {} when nothing is stored', async () => {
    expect(await loadSavedPlaces()).toEqual({});
  });

  it('returns the parsed map when stored', async () => {
    const map = buildSavedMap(MOCK_PLACES.slice(0, 2));
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(map));
    expect(await loadSavedPlaces()).toEqual(map);
  });

  it('returns {} on corrupt JSON', async () => {
    await AsyncStorage.setItem(SAVED_KEY, 'not-json{');
    expect(await loadSavedPlaces()).toEqual({});
  });

  it('returns {} when stored value is not an object', async () => {
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(42));
    expect(await loadSavedPlaces()).toEqual({});
  });
});

describe('persistSavedPlaces', () => {
  it('round-trips a map through storage', async () => {
    const map = buildSavedMap(MOCK_PLACES.slice(0, 3));
    await persistSavedPlaces(map);
    expect(await loadSavedPlaces()).toEqual(map);
  });

  it('swallows storage errors', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    await expect(persistSavedPlaces({})).resolves.toBeUndefined();
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
