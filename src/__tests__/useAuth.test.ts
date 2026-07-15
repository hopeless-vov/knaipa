import { act, renderHook } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../api/supabase';
import { MIN_PASSWORD_LENGTH } from '../utils/validation';
import { translate } from '../i18n';

const msg = {
  emailRequired: translate('validation.emailRequired', 'en'),
  passwordTooShort: translate('validation.passwordTooShort', 'en', { min: MIN_PASSWORD_LENGTH }),
};

const SUPA_USER = {
  id: 'user-1',
  email: 'vova@example.com',
  user_metadata: { name: 'Vova' },
  created_at: '2025-01-01T00:00:00Z',
};

const signInMock = supabase.auth.signInWithPassword as jest.Mock;
const signUpMock = supabase.auth.signUp as jest.Mock;
const signOutMock = supabase.auth.signOut as jest.Mock;
const resetMock = supabase.auth.resetPasswordForEmail as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  useAppStore.setState({ user: null });
});

describe('useAuth.signIn', () => {
  it('sets the user and returns true on success', async () => {
    signInMock.mockResolvedValueOnce({ data: { user: SUPA_USER }, error: null });
    const { result } = renderHook(() => useAuth());

    let ok = false;
    await act(async () => {
      ok = await result.current.signIn('vova@example.com', 'secret1');
    });

    expect(ok).toBe(true);
    expect(useAppStore.getState().user?.id).toBe('user-1');
    expect(result.current.error).toBeNull();
  });

  it('trims the email before sending', async () => {
    signInMock.mockResolvedValueOnce({ data: { user: SUPA_USER }, error: null });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('  vova@example.com  ', 'secret1');
    });

    expect(signInMock).toHaveBeenCalledWith({
      email: 'vova@example.com',
      password: 'secret1',
    });
  });

  it('surfaces auth errors, returns false, and does not set the user', async () => {
    signInMock.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid login credentials'),
    });
    const { result } = renderHook(() => useAuth());

    let ok = true;
    await act(async () => {
      ok = await result.current.signIn('vova@example.com', 'wrong-pass');
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Invalid login credentials');
    expect(useAppStore.getState().user).toBeNull();
  });

  it('short-circuits on invalid input without calling the API', async () => {
    const { result } = renderHook(() => useAuth());

    let ok = true;
    await act(async () => {
      ok = await result.current.signIn('', '');
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe(msg.emailRequired);
    expect(signInMock).not.toHaveBeenCalled();
  });
});

describe('useAuth.signUp', () => {
  it('sets the user and returns true on success', async () => {
    signUpMock.mockResolvedValueOnce({ data: { user: SUPA_USER }, error: null });
    const { result } = renderHook(() => useAuth());

    let ok = false;
    await act(async () => {
      ok = await result.current.signUp('Vova', 'vova@example.com', 'secret1');
    });

    expect(ok).toBe(true);
    expect(useAppStore.getState().user?.name).toBe('Vova');
  });

  it('short-circuits on a short password without calling the API', async () => {
    const { result } = renderHook(() => useAuth());

    let ok = true;
    await act(async () => {
      ok = await result.current.signUp('Vova', 'vova@example.com', '123');
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe(msg.passwordTooShort);
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it('surfaces auth errors and returns false', async () => {
    signUpMock.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Email already registered'),
    });
    const { result } = renderHook(() => useAuth());

    let ok = true;
    await act(async () => {
      ok = await result.current.signUp('Vova', 'vova@example.com', 'secret1');
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Email already registered');
  });
});

describe('useAuth.signOut', () => {
  it('clears the user', async () => {
    useAppStore.setState({
      user: { id: 'user-1', email: 'v@e.com', name: 'Vova', createdAt: '2025-01-01' },
    });
    signOutMock.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(useAppStore.getState().user).toBeNull();
  });
});

describe('useAuth.sendPasswordReset', () => {
  it('returns true on success', async () => {
    resetMock.mockResolvedValueOnce({ error: null });
    const { result } = renderHook(() => useAuth());

    let ok = false;
    await act(async () => {
      ok = await result.current.sendPasswordReset('vova@example.com');
    });

    expect(ok).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('surfaces errors and returns false', async () => {
    resetMock.mockResolvedValueOnce({ error: new Error('Rate limited') });
    const { result } = renderHook(() => useAuth());

    let ok = true;
    await act(async () => {
      ok = await result.current.sendPasswordReset('vova@example.com');
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Rate limited');
  });
});
