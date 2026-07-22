import React from 'react';
import { View, StyleSheet } from 'react-native';
import SectionLabel from '../ui/SectionLabel';
import ChipGroup from '../ui/ChipGroup';

interface Option {
  value: string;
  label: string;
}

interface FilterSectionProps {
  label: string;
  options: string[] | Option[];
  value: string;
  onChange: (v: string) => void;
  size?: 'sm' | 'md';
}

/** A labelled chip-group row — the repeated Filters section shape. */
export default function FilterSection({ label, options, value, onChange, size = 'sm' }: FilterSectionProps) {
  return (
    <View style={styles.section}>
      <SectionLabel>{label}</SectionLabel>
      <ChipGroup options={options} value={value} onChange={onChange} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
});
