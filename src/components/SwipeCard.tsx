import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import { Gesture, GestureDetector, Pressable } from 'react-native-gesture-handler';
import { Place } from '../types';
import { INK, PAPER } from '../utils/theme';
import PlaceCover from './PlaceCover';
import { useTranslation } from '../hooks/useTranslation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

export interface SwipeCardRef {
  animateLike: () => void;
  animatePass: () => void;
}

interface SwipeCardProps {
  place: Place;
  depth: number;
  isTop: boolean;
  index: number;
  total: number;
  onLike: () => void;
  onPass: () => void;
  onPress: () => void;
}

const SwipeCard = React.memo(
  forwardRef<SwipeCardRef, SwipeCardProps>(function SwipeCard({
    place,
    depth,
    isTop,
    index,
    total,
    onLike,
    onPass,
    onPress,
  }, ref) {
    const { t } = useTranslation();
    const position = useRef(new Animated.ValueXY()).current;
    const animatedDepth = useRef(new Animated.Value(depth)).current;

    // Keep latest callbacks fresh inside the memoized gesture closure
    const onLikeRef = useRef(onLike);
    const onPassRef = useRef(onPass);
    const isTopRef = useRef(isTop);
    useEffect(() => { onLikeRef.current = onLike; }, [onLike]);
    useEffect(() => { onPassRef.current = onPass; }, [onPass]);
    useEffect(() => { isTopRef.current = isTop; }, [isTop]);

    // Animate depth when card stack shifts
    useEffect(() => {
      Animated.spring(animatedDepth, {
        toValue: depth,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }).start();
    }, [depth]);

    // Button-triggered swipes (LIKE / PASS buttons in DiscoverScreen)
    useImperativeHandle(ref, () => ({
      animateLike: () => {
        Animated.timing(position, {
          toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
          duration: 250,
          useNativeDriver: true,
        }).start(() => onLikeRef.current());
      },
      animatePass: () => {
        Animated.timing(position, {
          toValue: { x: -SCREEN_WIDTH * 1.5, y: 0 },
          duration: 250,
          useNativeDriver: true,
        }).start(() => onPassRef.current());
      },
    }));

    // Gesture created once — callbacks stay fresh via refs above
    // .runOnJS(true) keeps callbacks on JS thread so Animated.Value works
    // .activeOffsetX + .failOffsetY resolve scroll conflict natively (no scrollEnabled state needed)
    const panGesture = useRef(
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-4, 4])
        .failOffsetY([-8, 8])
        .onBegin(() => {
          if (!isTopRef.current) return;
          position.setValue({ x: 0, y: 0 });
        })
        .onUpdate((e) => {
          if (!isTopRef.current) return;
          position.setValue({ x: e.translationX, y: e.translationY * 0.25 });
        })
        .onEnd((e) => {
          if (!isTopRef.current) return;
          if (e.translationX > SWIPE_THRESHOLD || e.velocityX > 800) {
            Animated.timing(position, {
              toValue: { x: SCREEN_WIDTH * 1.5, y: e.translationY },
              duration: 250,
              useNativeDriver: true,
            }).start(() => onLikeRef.current());
          } else if (e.translationX < -SWIPE_THRESHOLD || e.velocityX < -800) {
            Animated.timing(position, {
              toValue: { x: -SCREEN_WIDTH * 1.5, y: e.translationY },
              duration: 250,
              useNativeDriver: true,
            }).start(() => onPassRef.current());
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              tension: 80,
              useNativeDriver: true,
            }).start();
          }
        })
        .onFinalize((_, success) => {
          if (!isTopRef.current) return;
          if (!success) {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              tension: 80,
              useNativeDriver: true,
            }).start();
          }
        })
    ).current;

    const depthTranslateY = animatedDepth.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [0, 10, 20, 30],
      extrapolate: 'clamp',
    });
    const depthScale = animatedDepth.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [1, 0.96, 0.92, 0.88],
      extrapolate: 'clamp',
    });
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-15deg', '0deg', '15deg'],
      extrapolate: 'clamp',
    });
    const likeOpacity = position.x.interpolate({
      inputRange: [20, SWIPE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const passOpacity = position.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -20],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    const cardStyle = isTop
      ? {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { translateY: depthTranslateY },
            { rotate },
            { scale: depthScale },
          ],
          zIndex: 10,
        }
      : {
          transform: [{ translateY: depthTranslateY }, { scale: depthScale }],
          zIndex: 10 - depth,
        };

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Pressable
            onPress={isTop ? onPress : undefined}
            style={styles.pressable}
          >
            <PlaceCover
              place={place}
              size="lg"
              showQuickInfo
              index={index}
              total={total}
              priority={isTop ? 'high' : 'low'}
            />
          </Pressable>

          {isTop && (
            <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]}>
              <Text style={styles.stampTextLike}>{t('discover.like')}</Text>
            </Animated.View>
          )}

          {isTop && (
            <Animated.View style={[styles.stamp, styles.stampPass, { opacity: passOpacity }]}>
              <Text style={styles.stampTextPass}>{t('discover.pass')}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    );
  }),
  (prev, next) =>
    prev.place.id === next.place.id &&
    prev.depth === next.depth &&
    prev.isTop === next.isTop,
);

export default SwipeCard;

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pressable: {
    flex: 1,
  },
  stamp: {
    position: 'absolute',
    top: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 3,
    borderRadius: 0,
  },
  stampLike: {
    left: 22,
    borderColor: INK,
    backgroundColor: PAPER,
    transform: [{ rotate: '12deg' }],
  },
  stampPass: {
    right: 22,
    borderColor: PAPER,
    transform: [{ rotate: '-12deg' }],
  },
  stampTextLike: {
    fontSize: 26,
    fontWeight: '900',
    color: INK,
    letterSpacing: 2,
  },
  stampTextPass: {
    fontSize: 26,
    fontWeight: '900',
    color: PAPER,
    letterSpacing: 2,
  },
});
