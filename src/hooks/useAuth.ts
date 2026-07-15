import { useState } from 'react';
import { supabase } from '../api/supabase';
import { useAppStore } from '../store/useAppStore';
import { mapSupabaseUser } from '../mappers/user';
import { validateSignIn, validateSignUp, MIN_PASSWORD_LENGTH } from '../utils/validation';
import { useTranslation } from './useTranslation';

export function useAuth() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const validationError = validateSignIn(email, password);
    if (validationError) {
      setError(t(validationError, { min: MIN_PASSWORD_LENGTH }));
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      if (!data.user) throw new Error('Sign in failed');
      setUser(mapSupabaseUser(data.user));
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    const validationError = validateSignUp(name, email, password);
    if (validationError) {
      setError(t(validationError, { min: MIN_PASSWORD_LENGTH }));
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (authError) throw authError;
      if (!data.user) throw new Error('Sign up failed');
      setUser(mapSupabaseUser(data.user));
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (authError) throw authError;
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    sendPasswordReset,
    signOut,
  };
}
