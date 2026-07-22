import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Crossfades content when the "current" item changes: fade out, swap the
 * displayed item, fade back in. Keeps the swapped-out content on screen until
 * the fade completes so the deck's about-section doesn't flicker.
 *
 * Animation-only orchestration — excluded from coverage (see jest.config.js);
 * RN's Animated driver can't be meaningfully unit-tested in the node env.
 */
export function useCardCrossfade<T extends { id: string } | null | undefined>(current: T) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [displayed, setDisplayed] = useState<T>(current);

  useEffect(() => {
    if (current?.id === displayed?.id) return;
    Animated.timing(opacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setDisplayed(current);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  return { opacity, displayed };
}
