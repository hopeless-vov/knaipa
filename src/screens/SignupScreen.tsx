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
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { INK, PAPER, MUTED, RED, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signUp, loading, error } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSignup = async () => {
    // On success the auth-gated navigator swaps to the main stack automatically
    await signUp(name, email, password);
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
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.back}>
          <Feather name="arrow-left" size={16} color={INK} />
          <Text style={styles.backText}>{t('auth.backToLogin')}</Text>
        </Pressable>

        <View style={styles.header}>
          <Wordmark size={56}>{t('auth.createAccountTitle')}</Wordmark>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('auth.fullName')}
          />
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

          <Pressable onPress={() => setAgreed((v) => !v)} style={styles.termsRow}>
            <Feather
              name={agreed ? 'check-square' : 'square'}
              size={18}
              color={INK}
            />
            <Text style={styles.termsText}>
              {t('auth.agreeTerms')}
            </Text>
          </Pressable>

          <Button
            label={t('auth.createAccount')}
            onPress={handleSignup}
            variant="filled"
            size="lg"
            full
            loading={loading}
            disabled={!agreed}
          />
        </View>

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.centered}>
          <Text style={styles.loginLink}>{t('auth.toLogin')}</Text>
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
    gap: 28,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: INK,
  },
  header: {
    gap: 8,
  },
  form: {
    gap: 12,
  },
  error: {
    color: RED,
    fontSize: 13,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  termsText: {
    fontSize: 13,
    color: MUTED,
    flex: 1,
    lineHeight: 18,
  },
  centered: {
    alignItems: 'center',
  },
  loginLink: {
    fontSize: 13,
    color: INK,
    textDecorationLine: 'underline',
  },
});
