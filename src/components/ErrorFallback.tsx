import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PAPER, MUTED, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Button from '../ui/Button';
import { useTranslation } from '../hooks/useTranslation';

interface ErrorFallbackProps {
  onRetry: () => void;
}

/** Shown by ErrorBoundary when a render throws. Lets the user recover in place. */
export default function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Wordmark size={40}>{t('errors.crashTitle')}</Wordmark>
      <Text style={styles.body}>{t('errors.crashBody')}</Text>
      <Button label={t('common.tryAgain')} onPress={onRetry} variant="filled" size="lg" align="center" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: SCREEN_PADDING,
  },
  body: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
});
