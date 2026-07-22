import React from 'react';
import { Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { MUTED } from '../utils/theme';

interface SectionLabelProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

/** Small uppercase label heading a form/detail section. */
export default function SectionLabel({ children, style }: SectionLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: MUTED,
  },
});
