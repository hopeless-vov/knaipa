import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { INK, PAPER } from '../utils/theme';

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}

export default function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((opt, idx) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected }}
            style={[
              styles.segment,
              selected && styles.segmentSelected,
              idx > 0 && styles.segmentBorderLeft,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {opt.label.toUpperCase()}
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
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 0,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  segmentSelected: {
    backgroundColor: INK,
  },
  segmentBorderLeft: {
    borderLeftWidth: 1.5,
    borderLeftColor: INK,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: INK,
  },
  labelSelected: {
    color: PAPER,
  },
});
