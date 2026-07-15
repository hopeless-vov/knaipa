import React from 'react';
import { View, StyleSheet } from 'react-native';
import { INK } from '../utils/theme';

interface MapMarkerProps {
  color?: string;
}

export default function MapMarker({ color }: MapMarkerProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.diamond, { backgroundColor: color ?? INK }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamond: {
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
  },
});
