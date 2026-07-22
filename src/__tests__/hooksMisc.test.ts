import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { useFindPlace } from '../hooks/useFindPlace';
import { useFilters } from '../hooks/useFilters';
import { useTranslation } from '../hooks/useTranslation';
import { useSavedBootstrap } from '../hooks/useSavedBootstrap';
import { useAppStore, DEFAULT_FILTERS, FILTERS_KEY } from '../store/useAppStore';
import { MOCK_PLACES } from './fixtures/places';

describe('useFindPlace', () => {
  beforeEach(() => useAppStore.setState({ allFetchedPlaces: [...MOCK_PLACES] }));

  it('finds a place by id', () => {
    const { result } = renderHook(() => useFindPlace('place-2'));
    expect(result.current?.name).toBe('Test Café');
  });

  it('returns null for an unknown id', () => {
    const { result } = renderHook(() => useFindPlace('nope'));
    expect(result.current).toBeNull();
  });
});

describe('useFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ filters: { ...DEFAULT_FILTERS } });
  });

  it('updateLocal merges into local draft without touching the store', () => {
    const { result } = renderHook(() => useFilters());
    act(() => result.current.updateLocal({ price: '££' }));
    expect(result.current.localFilters.price).toBe('££');
    expect(useAppStore.getState().filters.price).toBe('any'); // not applied yet
  });

  it('applyFilters commits to the store and persists', () => {
    const { result } = renderHook(() => useFilters());
    act(() => result.current.updateLocal({ radius: '5km' }));
    act(() => result.current.applyFilters());
    expect(useAppStore.getState().filters.radius).toBe('5km');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(FILTERS_KEY, expect.stringContaining('5km'));
  });

  it('resetFilters restores defaults and clears storage', () => {
    const { result } = renderHook(() => useFilters());
    act(() => result.current.updateLocal({ radius: '50km' }));
    act(() => result.current.resetFilters());
    expect(result.current.localFilters.radius).toBe('near');
    expect(useAppStore.getState().filters.radius).toBe('near');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(FILTERS_KEY);
  });
});

describe('useTranslation', () => {
  it('translates in the active locale and switches with the store', () => {
    useAppStore.setState({ preferences: { ...useAppStore.getState().preferences, language: 'uk' } });
    const { result, rerender } = renderHook(() => useTranslation());
    expect(result.current.locale).toBe('uk');
    expect(result.current.t('auth.login')).toBe('Увійти');

    act(() => useAppStore.setState({ preferences: { ...useAppStore.getState().preferences, language: 'en' } }));
    rerender({});
    expect(result.current.t('auth.login')).toBe('Log in');
    expect(result.current.tCount('saved.count', 2)).toBe('2 PLACES');
    expect(result.current.tList('legal.terms').length).toBeGreaterThan(0);
  });
});

describe('useSavedBootstrap', () => {
  it('hydrates preferences on mount, then loads + syncs saved per user', () => {
    const hydrateSaved = jest.fn();
    const hydratePreferences = jest.fn();
    const syncSaved = jest.fn();
    useAppStore.setState({ hydrateSaved, hydratePreferences, syncSaved, user: null });

    const { rerender } = renderHook(() => useSavedBootstrap());
    // Preferences are device-level → hydrated on mount. Saved data is per-user
    // → nothing loaded until a user is present (prevents cross-account bleed).
    expect(hydratePreferences).toHaveBeenCalledTimes(1);
    expect(hydrateSaved).not.toHaveBeenCalled();
    expect(syncSaved).not.toHaveBeenCalled();

    act(() =>
      useAppStore.setState({
        user: { id: 'u1', email: 'e', name: 'n', createdAt: '2025-01-01' },
      })
    );
    rerender({});
    expect(hydrateSaved).toHaveBeenCalledWith('u1');
    expect(syncSaved).toHaveBeenCalledWith('u1');
  });
});
