import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAuthSession } from '../hooks/useAuthSession';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../api/supabase';

const SUPA_USER = {
  id: 'user-1',
  email: 'vova@example.com',
  user_metadata: { name: 'Vova' },
  created_at: '2025-01-01T00:00:00Z',
};

type AuthCallback = (event: string, session: { user: typeof SUPA_USER } | null) => void;

const getSessionMock = supabase.auth.getSession as jest.Mock;
const onAuthStateChangeMock = supabase.auth.onAuthStateChange as jest.Mock;

let authCallback: AuthCallback | null;
let unsubscribeMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  useAppStore.setState({ user: null });
  authCallback = null;
  unsubscribeMock = jest.fn();
  getSessionMock.mockResolvedValue({ data: { session: null }, error: null });
  onAuthStateChangeMock.mockImplementation((cb: AuthCallback) => {
    authCallback = cb;
    return { data: { subscription: { unsubscribe: unsubscribeMock } } };
  });
});

describe('useAuthSession', () => {
  it('starts in restoring state', async () => {
    const { result } = renderHook(() => useAuthSession());
    expect(result.current.restoring).toBe(true);
    // Let the getSession promise settle inside act to avoid stray updates
    await waitFor(() => expect(result.current.restoring).toBe(false));
  });

  it('restores a persisted session into the store', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: SUPA_USER } },
      error: null,
    });
    const { result } = renderHook(() => useAuthSession());

    await waitFor(() => expect(result.current.restoring).toBe(false));

    expect(result.current.user?.id).toBe('user-1');
    expect(useAppStore.getState().user?.name).toBe('Vova');
  });

  it('finishes restoring with no user when there is no session', async () => {
    const { result } = renderHook(() => useAuthSession());

    await waitFor(() => expect(result.current.restoring).toBe(false));

    expect(result.current.user).toBeNull();
  });

  it('updates the user on subsequent auth state changes', async () => {
    const { result } = renderHook(() => useAuthSession());
    await waitFor(() => expect(result.current.restoring).toBe(false));

    act(() => {
      authCallback?.('SIGNED_IN', { user: SUPA_USER });
    });
    expect(useAppStore.getState().user?.id).toBe('user-1');

    act(() => {
      authCallback?.('SIGNED_OUT', null);
    });
    expect(useAppStore.getState().user).toBeNull();
  });

  it('unsubscribes from auth changes on unmount', async () => {
    const { result, unmount } = renderHook(() => useAuthSession());
    await waitFor(() => expect(result.current.restoring).toBe(false));

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
