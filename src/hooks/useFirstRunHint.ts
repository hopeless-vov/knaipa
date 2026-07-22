import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logWarn } from '../utils/logger';

export const SWIPE_HINT_KEY = '@knaipa/swipeHintSeen';

/**
 * One-time coach hint for the swipe gesture. Reads a persisted flag on mount;
 * `dismissHint` hides it and remembers it so it never shows again.
 */
export function useFirstRunHint() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(SWIPE_HINT_KEY)
      .then((seen) => {
        /* istanbul ignore next -- post-unmount guard */
        if (!active) return;
        if (!seen) setShowHint(true);
      })
      .catch((e) => logWarn('swipe-hint read failed', e));
    return () => {
      active = false;
    };
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    AsyncStorage.setItem(SWIPE_HINT_KEY, '1').catch((e) => logWarn('swipe-hint persist failed', e));
  };

  return { showHint, dismissHint };
}
