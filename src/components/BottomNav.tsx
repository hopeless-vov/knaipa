import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { INK, PAPER } from '../utils/theme';

const TABS = ['Discover', 'Saved', 'Profile'] as const;

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      {TABS.map((name, idx) => {
        const focused = state.index === idx;
        return (
          <Pressable
            key={name}
            style={styles.tab}
            onPress={() => navigation.navigate(name)}
          >
            <View style={[styles.dot, focused && styles.dotActive]} />
            <Text style={[styles.label, focused && styles.labelActive]}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1.5,
    borderTopColor: INK,
    backgroundColor: PAPER,
    paddingTop: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: INK,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: INK,
  },
  labelActive: {
    color: INK,
  },
});
