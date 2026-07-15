import { act, renderHook } from '@testing-library/react-native';
import { useDiscover } from '../hooks/useDiscover';
import { useAppStore } from '../store/useAppStore';
import { MOCK_PLACES } from './fixtures/places';

beforeEach(() => {
  useAppStore.setState({
    deck: [...MOCK_PLACES],
    allFetchedPlaces: [...MOCK_PLACES],
    savedPlacesById: {},
    history: [],
    swipedIds: new Set(),
    totalFetched: MOCK_PLACES.length,
  });
});

describe('useDiscover', () => {
  it('like() removes top card from deck and saves it', () => {
    const { result } = renderHook(() => useDiscover());

    const initialLength = result.current.deck.length;
    const topCardId = result.current.topCard?.id;

    expect(topCardId).toBeDefined();

    act(() => {
      result.current.like();
    });

    expect(result.current.deck.length).toBe(initialLength - 1);
    expect(useAppStore.getState().isSaved(topCardId!)).toBe(true);
  });

  it('pass() removes top card from deck without saving', () => {
    const { result } = renderHook(() => useDiscover());

    const initialLength = result.current.deck.length;
    const topCardId = result.current.topCard?.id;

    act(() => {
      result.current.pass();
    });

    expect(result.current.deck.length).toBe(initialLength - 1);
    expect(useAppStore.getState().isSaved(topCardId!)).toBe(false);
  });

  it('undo() reverses the last like action', () => {
    const { result } = renderHook(() => useDiscover());

    const topCardId = result.current.topCard?.id;
    const initialLength = result.current.deck.length;

    act(() => { result.current.like(); });

    expect(result.current.deck.length).toBe(initialLength - 1);
    expect(useAppStore.getState().isSaved(topCardId!)).toBe(true);

    act(() => { result.current.undo(); });

    expect(result.current.deck.length).toBe(initialLength);
    expect(useAppStore.getState().isSaved(topCardId!)).toBe(false);
  });

  it('undo() reverses the last pass action', () => {
    const { result } = renderHook(() => useDiscover());

    const initialLength = result.current.deck.length;

    act(() => { result.current.pass(); });
    expect(result.current.deck.length).toBe(initialLength - 1);

    act(() => { result.current.undo(); });
    expect(result.current.deck.length).toBe(initialLength);
  });

  it('reset() restores the full deck', () => {
    const { result } = renderHook(() => useDiscover());

    act(() => {
      result.current.like();
      result.current.like();
    });

    act(() => { result.current.reset(); });

    expect(result.current.deck.length).toBe(MOCK_PLACES.length);
  });
});
