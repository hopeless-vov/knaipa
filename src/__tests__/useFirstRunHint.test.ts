import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useFirstRunHint, SWIPE_HINT_KEY } from '../hooks/useFirstRunHint';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('useFirstRunHint', () => {
  it('shows the hint on first run (no flag stored)', async () => {
    const { result } = renderHook(() => useFirstRunHint());
    await waitFor(() => expect(result.current.showHint).toBe(true));
  });

  it('does not show the hint once the flag is stored', async () => {
    await AsyncStorage.setItem(SWIPE_HINT_KEY, '1');
    const { result } = renderHook(() => useFirstRunHint());
    // give the async read a tick
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.showHint).toBe(false);
  });

  it('dismiss hides the hint and persists the flag', async () => {
    const { result } = renderHook(() => useFirstRunHint());
    await waitFor(() => expect(result.current.showHint).toBe(true));
    await act(async () => {
      result.current.dismissHint();
    });
    expect(result.current.showHint).toBe(false);
    expect(await AsyncStorage.getItem(SWIPE_HINT_KEY)).toBe('1');
  });
});
