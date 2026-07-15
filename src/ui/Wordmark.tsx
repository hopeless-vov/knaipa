import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { INK } from '../utils/theme';

interface WordmarkProps {
  children: string;
  size?: number;
  showTm?: boolean;
  color?: string;
}

export default function Wordmark({ children, size = 48, showTm = false, color }: WordmarkProps) {
  return (
    <Text style={[styles.text, { fontSize: size, color: color ?? INK }]}>
      {children.toUpperCase()}
      {showTm && <Text style={[styles.tm, { fontSize: size * 0.35 }]}>{' ™'}</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '900',
    letterSpacing: -1,
  },
  tm: {
    fontWeight: '700',
    letterSpacing: 0,
  },
});
