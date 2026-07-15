import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { INK, PAPER, MUTED, RED, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn, loading, error } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // On success the auth-gated navigator swaps to the main stack automatically
    await signIn(email, password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Wordmark size={88} showTm>knaipa</Wordmark>
          <Text style={styles.tagline}>{t('auth.tagline')}</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.email')}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.password')}
            secureTextEntry
          />
          <Button
            label={t('auth.login')}
            onPress={handleLogin}
            variant="filled"
            size="lg"
            full
            disabled={loading}
          />
          <Pressable onPress={() => navigation.navigate('Forgot')} style={styles.centered}>
            <Text style={styles.link}>{t('auth.forgotPassword')}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Signup')} style={styles.centered}>
          <Text style={styles.signupLink}>{t('auth.toSignup')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: PAPER,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  form: {
    gap: 12,
  },
  error: {
    color: RED,
    fontSize: 13,
  },
  centered: {
    alignItems: 'center',
  },
  link: {
    fontSize: 13,
    color: MUTED,
    textDecorationLine: 'underline',
  },
  signupLink: {
    fontSize: 13,
    color: INK,
    textDecorationLine: 'underline',
  },
});
