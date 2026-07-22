import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Loads the persisted saved-places snapshot on launch and, whenever a user is
 * signed in, reconciles it with Supabase (pull + merge + flush pending ops).
 * Mount once at the navigation root.
 */
export function useSavedBootstrap() {
  const userId = useAppStore((s) => s.user?.id ?? null);
  const hydrateSaved = useAppStore((s) => s.hydrateSaved);
  const hydratePreferences = useAppStore((s) => s.hydratePreferences);
  const syncSaved = useAppStore((s) => s.syncSaved);

  // Preferences are device-level (not per-user), so hydrate them on mount.
  useEffect(() => {
    hydratePreferences();
  }, []);

  // Saved data is per-user: load *that* user's snapshot then reconcile with
  // Supabase whenever the signed-in user changes. (Sign-out clears in-memory
  // saved state via setUser, so nothing carries into the next account.)
  useEffect(() => {
    if (userId) {
      hydrateSaved(userId);
      syncSaved(userId);
    }
  }, [userId]);
}
