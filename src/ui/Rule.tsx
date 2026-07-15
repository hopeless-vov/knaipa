import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HAIR, INK } from '../utils/theme';

interface RuleProps {
  thick?: boolean;
  faint?: boolean;
  color?: string;
}

export default function Rule({ thick, faint, color }: RuleProps) {
  const borderColor = color ?? (faint ? HAIR : INK);
  const borderWidth = thick ? 1.5 : 1;

  return <View style={[styles.base, { borderBottomWidth: borderWidth, borderBottomColor: borderColor }]} />;
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
});
