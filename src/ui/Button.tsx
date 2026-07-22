import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { INK, PAPER } from '../utils/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'outline' | 'filled';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  full?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const HEIGHT: Record<string, number> = {
  sm: 36,
  md: 44,
  lg: 52,
  xl: 60,
};

const FONT_SIZE: Record<string, number> = {
  sm: 11,
  md: 12,
  lg: 13,
  xl: 14,
};

const PADDING_H: Record<string, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export default function Button({
  label,
  onPress,
  variant = 'filled',
  size = 'md',
  full = false,
  disabled = false,
  loading = false,
  leftIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: PADDING_H[size],
          alignSelf: full ? 'stretch' : 'flex-start',
          opacity: isDisabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        variant === 'filled' ? styles.filled : styles.outline,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' ? PAPER : INK}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.label,
              { fontSize: FONT_SIZE[size] },
              variant === 'filled' ? styles.labelFilled : styles.labelOutline,
            ]}
          >
            {label.toUpperCase()}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    gap: 8,
  },
  filled: {
    backgroundColor: INK,
    borderWidth: 1.5,
    borderColor: INK,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: INK,
  },
  label: {
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  labelFilled: {
    color: PAPER,
  },
  labelOutline: {
    color: INK,
  },
});
