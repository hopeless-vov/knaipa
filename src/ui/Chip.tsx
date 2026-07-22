import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { INK, PAPER } from '../utils/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}

export default function Chip({ label, selected, onPress, size = 'md' }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        selected ? styles.selected : styles.unselected,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'sm' ? styles.labelSm : styles.labelMd,
          selected ? styles.labelSelected : styles.labelUnselected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 0,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  md: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: INK,
    borderColor: INK,
  },
  unselected: {
    backgroundColor: 'transparent',
    borderColor: INK,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  labelSm: {
    fontSize: 11,
  },
  labelMd: {
    fontSize: 13,
  },
  labelSelected: {
    color: PAPER,
  },
  labelUnselected: {
    color: INK,
  },
});
