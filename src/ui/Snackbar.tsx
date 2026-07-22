import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { INK, PAPER } from '../utils/theme';

interface SnackbarProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

/** Bottom toast with a single action (e.g. Undo). Presentational only. */
export default function Snackbar({ message, actionLabel, onAction }: SnackbarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: INK,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  message: {
    color: PAPER,
    fontSize: 14,
    fontWeight: '600',
  },
  action: {
    color: PAPER,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
