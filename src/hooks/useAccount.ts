import { useState } from 'react';
import { supabase } from '../api/supabase';
import { useAppStore } from '../store/useAppStore';
import { isValidEmail, MIN_PASSWORD_LENGTH, VALIDATION_MESSAGES } from '../utils/validation';

/**
 * Account self-service: update display name, password, and email via Supabase.
 * Email changes require confirmation, so we surface a message rather than
 * mutating the local user immediately.
 */
export function useAccount() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (
    validate: () => string | null,
    action: () => Promise<void>
  ): Promise<boolean> => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setMessage(null);
      return false;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateName = (name: string) =>
    run(
      () => (name.trim() ? null : VALIDATION_MESSAGES.nameRequired),
      async () => {
        const { error: e } = await supabase.auth.updateUser({ data: { name: name.trim() } });
        if (e) throw e;
        if (user) setUser({ ...user, name: name.trim() });
        setMessage('Display name updated');
      }
    );

  const updatePassword = (password: string) =>
    run(
      () =>
        !password
          ? VALIDATION_MESSAGES.passwordRequired
          : password.length < MIN_PASSWORD_LENGTH
          ? VALIDATION_MESSAGES.passwordTooShort
          : null,
      async () => {
        const { error: e } = await supabase.auth.updateUser({ password });
        if (e) throw e;
        setMessage('Password updated');
      }
    );

  const updateEmail = (email: string) =>
    run(
      () =>
        !email.trim()
          ? VALIDATION_MESSAGES.emailRequired
          : !isValidEmail(email)
          ? VALIDATION_MESSAGES.emailInvalid
          : null,
      async () => {
        const { error: e } = await supabase.auth.updateUser({ email: email.trim() });
        if (e) throw e;
        setMessage('Check your inbox to confirm the new email');
      }
    );

  return { user, loading, error, message, updateName, updatePassword, updateEmail };
}
