import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';
import { useAppStore } from '../store/useAppStore';
import { mapSupabaseUser } from '../mappers/user';

/**
 * Restores the persisted Supabase session on launch and keeps the store's
 * user in sync with every subsequent auth state change (sign-in, sign-out,
 * token refresh). Meant to be mounted once, at the navigation root.
 */
export function useAuthSession() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.session ? mapSupabaseUser(data.session.user) : null);
      })
      .finally(() => {
        if (active) setRestoring(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session ? mapSupabaseUser(session.user) : null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, restoring };
}
