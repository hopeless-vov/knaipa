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
  const syncSaved = useAppStore((s) => s.syncSaved);

  useEffect(() => {
    hydrateSaved();
  }, []);

  useEffect(() => {
    if (userId) syncSaved(userId);
  }, [userId]);
}
