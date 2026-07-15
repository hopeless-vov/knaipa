import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Place } from '../types';
import { INK, MUTED } from '../utils/theme';
import { padIndex } from '../utils/formatters';

interface PlaceCoverProps {
  place: Place;
  size: 'lg' | 'md';
  showQuickInfo?: boolean;
  index?: number;
  total?: number;
  onPress?: () => void;
  priority?: 'high' | 'normal' | 'low';
}

export default function PlaceCover({
  place,
  size,
  showQuickInfo = true,
  index,
  total,
  onPress,
  priority = 'normal',
}: PlaceCoverProps) {
  const aspectRatio = size === 'lg' ? undefined : 1.2;

  return (
    <Pressable onPress={onPress} style={[styles.container, size === 'lg' ? styles.containerFill : { aspectRatio }]}>
      <Image
        source={{ uri: place.cover }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={place.id}
        priority={priority}
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Counter top-left */}
      {typeof index === 'number' && typeof total === 'number' && (
        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {padIndex(index + 1)} / {padIndex(total)}
          </Text>
        </View>
      )}

      {/* Info pill top-right */}
      {showQuickInfo && (
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            ★ {place.rating} · {place.price} · {place.distance}
          </Text>
        </View>
      )}

      {/* Bottom labels */}
      <View style={styles.bottomInfo}>
        <Text style={styles.categoryText}>{place.category.toUpperCase()}</Text>
        <Text style={styles.nameText}>{place.name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  containerFill: {
    flex: 1,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  counter: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.5,
  },
  pill: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: 'white',
  },
});
