import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MUTED } from '../utils/theme';

interface MetaLabelProps {
  children: string;
}

/** Uppercase caption used in screen header meta rows. */
export default function MetaLabel({ children }: MetaLabelProps) {
  return <Text style={styles.meta}>{children}</Text>;
}

const styles = StyleSheet.create({
  meta: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: MUTED,
    textTransform: 'uppercase',
  },
});
