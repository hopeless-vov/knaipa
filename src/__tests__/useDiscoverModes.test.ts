import { act, renderHook } from '@testing-library/react-native';
import { useDiscover } from '../hooks/useDiscover';
import { useAppStore, DEFAULT_FILTERS } from '../store/useAppStore';

// Keep the mount effect from doing GPS/fetch work during these unit tests
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  getLastKnownPositionAsync: jest.fn(async () => null),
  getCurrentPositionAsync: jest.fn(async () => null),
}));

beforeEach(() => {
  useAppStore.setState({ filters: { ...DEFAULT_FILTERS }, deck: [], history: [], userLocation: null });
});

describe('useDiscover discovery controls', () => {
  it('exposes the current mode/categories/query from filters', () => {
    useAppStore.setState({
      filters: { ...DEFAULT_FILTERS, mode: 'search', query: 'ramen', categories: ['Food'] },
    });
    const { result } = renderHook(() => useDiscover());
    expect(result.current.mode).toBe('search');
    expect(result.current.query).toBe('ramen');
    expect(result.current.categories).toEqual(['Food']);
  });

  it('setMode updates the store filter', () => {
    const { result } = renderHook(() => useDiscover());
    act(() => result.current.setMode('search'));
    expect(useAppStore.getState().filters.mode).toBe('search');
  });

  it('toggleCategory adds then removes a category', () => {
    const { result } = renderHook(() => useDiscover());
    act(() => result.current.toggleCategory('Bar'));
    expect(useAppStore.getState().filters.categories).toEqual(['Bar']);
    act(() => result.current.toggleCategory('Bar'));
    expect(useAppStore.getState().filters.categories).toEqual([]);
  });

  it('submitSearch commits the query', () => {
    const { result } = renderHook(() => useDiscover());
    act(() => result.current.submitSearch('rooftop bar'));
    expect(useAppStore.getState().filters.query).toBe('rooftop bar');
  });
});
