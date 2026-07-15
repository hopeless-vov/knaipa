import React from 'react';
import { View, StyleSheet } from 'react-native';
import Chip from './Chip';

interface Option {
  value: string;
  label: string;
}

interface ChipGroupProps {
  options: string[] | Option[];
  value: string;
  onChange: (v: string) => void;
  size?: 'sm' | 'md';
}

function normalizeOptions(options: string[] | Option[]): Option[] {
  if (options.length === 0) return [];
  if (typeof options[0] === 'string') {
    return (options as string[]).map((o) => ({ value: o, label: o }));
  }
  return options as Option[];
}

export default function ChipGroup({ options, value, onChange, size = 'md' }: ChipGroupProps) {
  const normalized = normalizeOptions(options);

  return (
    <View style={styles.container}>
      {normalized.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
          size={size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
