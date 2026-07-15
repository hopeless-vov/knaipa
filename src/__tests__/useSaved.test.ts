import { act, renderHook } from '@testing-library/react-native';
import { useSaved } from '../hooks/useSaved';
import { useAppStore } from '../store/useAppStore';
import { MOCK_PLACES } from './fixtures/places';
import { buildSavedMap } from './fixtures/saved';

// place-1, place-2, place-3, place-5 are in London; place-4 in Kyiv
beforeEach(() => {
  useAppStore.setState({
    savedPlacesById: buildSavedMap(MOCK_PLACES, {
      'place-1': { visited: true },
      'place-3': { visited: true },
    }),
    history: [],
  });
});

afterEach(() => {
  useAppStore.setState({ savedPlacesById: {}, history: [] });
});

describe('useSaved', () => {
  it('returns all saved places when tab is "all"', () => {
    const { result } = renderHook(() => useSaved());
    expect(result.current.filteredPlaces.length).toBe(5);
  });

  it('returns only visited places when tab is "been"', () => {
    const { result } = renderHook(() => useSaved());

    act(() => { result.current.setActiveTab('been'); });

    const visited = result.current.filteredPlaces;
    expect(visited.length).toBe(2);
    expect(visited.every((p) => p.visited)).toBe(true);
  });

  it('returns only unvisited places when tab is "havent"', () => {
    const { result } = renderHook(() => useSaved());

    act(() => { result.current.setActiveTab('havent'); });

    const unvisited = result.current.filteredPlaces;
    expect(unvisited.length).toBe(3);
    expect(unvisited.every((p) => !p.visited)).toBe(true);
  });

  it('groups places by city correctly', () => {
    const { result } = renderHook(() => useSaved());
    const { byCity } = result.current;
    expect(Object.keys(byCity)).toContain('London, UK');
    expect(byCity['London, UK'].length).toBe(4);
  });

  it('byCity reflects filtered places for "been" tab', () => {
    const { result } = renderHook(() => useSaved());

    act(() => { result.current.setActiveTab('been'); });

    const { byCity } = result.current;
    const londonPlaces = byCity['London, UK'] ?? [];
    expect(londonPlaces.every((p) => p.visited)).toBe(true);
  });
});
