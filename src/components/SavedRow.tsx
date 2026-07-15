import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
  PanResponder,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SavedPlace } from '../types';
import { INK, MUTED, RED, HAIR, PAPER } from '../utils/theme';
import { padIndex, getSubcategory } from '../utils/formatters';

const SWIPE_THRESHOLD = 80;
const DELETE_LABEL_WIDTH = 80;

interface SavedRowProps {
  place: SavedPlace;
  index: number;
  editing: boolean;
  onPress: () => void;
  onToggleVisited: () => void;
  onRemove: () => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export default function SavedRow({
  place,
  index,
  editing,
  onPress,
  onToggleVisited,
  onRemove,
  onSwipeStart,
  onSwipeEnd,
}: SavedRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const rowHeight = useRef(0);
  const [collapsing, setCollapsing] = useState(false);

  const onRowLayout = (e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    if (h) rowHeight.current = h;
  };

  const deleteOpacity = translateX.interpolate({
    inputRange: [-DELETE_LABEL_WIDTH, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const snapBack = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 120,
    }).start();
  };

  const collapseAndRemove = (withSlide = false) => {
    animatedHeight.setValue(rowHeight.current);
    setCollapsing(true);
    Animated.parallel([
      ...(withSlide
        ? [Animated.timing(translateX, { toValue: -500, duration: 220, useNativeDriver: true })]
        : []),
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start(() => onRemove());
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > Math.abs(g.dy) && g.dx < -6,
    onMoveShouldSetPanResponderCapture: (_, g) =>
      Math.abs(g.dx) > Math.abs(g.dy) * 1.5 && g.dx < -8,

    onPanResponderGrant: () => onSwipeStart?.(),

    onPanResponderMove: (_, g) => {
      if (g.dx < 0) translateX.setValue(g.dx);
    },

    onPanResponderRelease: (_, g) => {
      onSwipeEnd?.();
      if (g.dx < -SWIPE_THRESHOLD || g.vx < -0.5) {
        collapseAndRemove(true);
      } else {
        snapBack();
      }
    },

    onPanResponderTerminate: () => {
      onSwipeEnd?.();
      snapBack();
    },
  });

  return (
    <Animated.View style={[styles.wrapper, collapsing && { height: animatedHeight }]}>
      {/* Red delete label revealed behind the row */}
      <Animated.View style={[styles.deleteLabel, { opacity: deleteOpacity }]}>
        <Feather name="trash-2" size={18} color={PAPER} />
      </Animated.View>

      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
        onLayout={onRowLayout}
      >
        <Pressable
          onPress={editing ? undefined : onPress}
          style={styles.mainArea}
        >
          <Text style={styles.number}>{padIndex(index + 1)}</Text>
          <Image source={{ uri: place.cover }} style={styles.image} resizeMode="cover" />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
            <Text style={styles.sub}>{getSubcategory(place.category)}</Text>
          </View>
        </Pressable>

        {editing ? (
          <Pressable onPress={() => collapseAndRemove()} style={styles.actionBtn}>
            <Feather name="trash-2" size={18} color={RED} />
          </Pressable>
        ) : (
          <Pressable onPress={onToggleVisited} style={styles.actionBtn}>
            <Feather
              name={place.visited ? 'check-square' : 'square'}
              size={20}
              color={place.visited ? INK : MUTED}
            />
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteLabel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_LABEL_WIDTH,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PAPER,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  number: {
    fontSize: 11,
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 0.5,
    width: 24,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    color: MUTED,
  },
  actionBtn: {
    padding: 8,
  },
});
