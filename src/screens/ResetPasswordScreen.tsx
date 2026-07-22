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
import { PAPER, MUTED, RED, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import { useAccount } from '../hooks/useAccount';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Shown when the app is opened from a password-reset email (PASSWORD_RECOVERY
 * session). Lets the user set a new password, then returns to the app by
 * clearing the recovery flag.
 */
export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { updatePassword, loading, error } = useAccount();
  const setPasswordRecovery = useAppStore((s) => s.setPasswordRecovery);
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    const ok = await updatePassword(password);
    if (ok) setPasswordRecovery(false);
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
        <Wordmark size={56}>{t('auth.newPasswordTitle')}</Wordmark>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('settings.newPassword')}
            secureTextEntry
          />
          <Button
            label={t('auth.newPasswordCta')}
            onPress={handleSave}
            variant="filled"
            size="lg"
            full
            loading={loading}
            disabled={!password}
          />
        </View>

        <Pressable onPress={() => setPasswordRecovery(false)} style={styles.centered}>
          <Text style={styles.link}>{t('auth.newPasswordLater')}</Text>
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
});
