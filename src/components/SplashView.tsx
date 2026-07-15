import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PAPER } from '../utils/theme';
import Wordmark from '../ui/Wordmark';

export default function SplashView() {
  return (
    <View style={styles.container}>
      <Wordmark size={64} showTm>kutok</Wordmark>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PAPER,
  },
});
