import { act, renderHook } from '@testing-library/react-native';
import { useAccount } from '../hooks/useAccount';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../api/supabase';
import { MIN_PASSWORD_LENGTH } from '../utils/validation';
import { translate } from '../i18n';

const msg = {
  nameRequired: translate('validation.nameRequired', 'en'),
  passwordTooShort: translate('validation.passwordTooShort', 'en', { min: MIN_PASSWORD_LENGTH }),
  emailInvalid: translate('validation.emailInvalid', 'en'),
};

const updateUserMock = supabase.auth.updateUser as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  useAppStore.setState({
    user: { id: 'u1', email: 'old@example.com', name: 'Old', createdAt: '2025-01-01' },
  });
  updateUserMock.mockResolvedValue({ data: { user: null }, error: null });
});

describe('updateName', () => {
  it('updates the store user and sets a message on success', async () => {
    const { result } = renderHook(() => useAccount());
    let ok = false;
    await act(async () => {
      ok = await result.current.updateName('New Name');
    });
    expect(ok).toBe(true);
    expect(updateUserMock).toHaveBeenCalledWith({ data: { name: 'New Name' } });
    expect(useAppStore.getState().user?.name).toBe('New Name');
    expect(result.current.message).toBeTruthy();
  });

  it('rejects an empty name without calling the API', async () => {
    const { result } = renderHook(() => useAccount());
    let ok = true;
    await act(async () => {
      ok = await result.current.updateName('   ');
    });
    expect(ok).toBe(false);
    expect(result.current.error).toBe(msg.nameRequired);
    expect(updateUserMock).not.toHaveBeenCalled();
  });
});

describe('updatePassword', () => {
  it('rejects a short password', async () => {
    const { result } = renderHook(() => useAccount());
    await act(async () => {
      await result.current.updatePassword('123');
    });
    expect(result.current.error).toBe(msg.passwordTooShort);
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it('calls updateUser with the new password on success', async () => {
    const { result } = renderHook(() => useAccount());
    await act(async () => {
      await result.current.updatePassword('secret1');
    });
    expect(updateUserMock).toHaveBeenCalledWith({ password: 'secret1' });
  });
});

describe('updateEmail', () => {
  it('rejects an invalid email', async () => {
    const { result } = renderHook(() => useAccount());
    await act(async () => {
      await result.current.updateEmail('nope');
    });
    expect(result.current.error).toBe(msg.emailInvalid);
  });

  it('surfaces a confirmation message on success without changing the local email', async () => {
    const { result } = renderHook(() => useAccount());
    await act(async () => {
      await result.current.updateEmail('new@example.com');
    });
    expect(updateUserMock).toHaveBeenCalledWith({ email: 'new@example.com' });
    expect(result.current.message).toMatch(/confirm/i);
    expect(useAppStore.getState().user?.email).toBe('old@example.com'); // unchanged until confirmed
  });

  it('surfaces API errors', async () => {
    updateUserMock.mockResolvedValueOnce({ data: { user: null }, error: new Error('taken') });
    const { result } = renderHook(() => useAccount());
    let ok = true;
    await act(async () => {
      ok = await result.current.updateEmail('new@example.com');
    });
    expect(ok).toBe(false);
    expect(result.current.error).toBe('taken');
  });
});
