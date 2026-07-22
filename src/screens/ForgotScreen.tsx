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
import { PAPER, MUTED, RED, GREEN, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

type Props = NativeStackScreenProps<RootStackParamList, 'Forgot'>;

export default function ForgotScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { sendPasswordReset, loading, error } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    await sendPasswordReset(email);
    setSent(true);
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
          <Wordmark size={72} showTm>knaipa</Wordmark>
          <Text style={styles.subtitle}>{t('auth.resetTitle')}</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          {sent && <Text style={styles.success}>{t('auth.resetSent')}</Text>}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.email')}
          />
          <Button
            label={t('auth.sendReset')}
            onPress={handleSend}
            variant="filled"
            size="lg"
            full
            loading={loading}
            disabled={!email}
          />
        </View>

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.centered}>
          <Feather name="arrow-left" size={14} color={MUTED} />
          <Text style={styles.backLink}>{t('auth.backToLoginPlain')}</Text>
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
    alignItems: 'stretch',
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    fontSize: 16,
    color: MUTED,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  error: {
    color: RED,
    fontSize: 13,
  },
  success: {
    color: GREEN,
    fontSize: 13,
  },
  centered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backLink: {
    fontSize: 13,
    color: MUTED,
    textDecorationLine: 'underline',
  },
});
