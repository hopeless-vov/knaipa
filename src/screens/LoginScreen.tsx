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
import Rule from '../ui/Rule';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await signIn(email, password);
    navigation.replace('Main');
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
          <Wordmark size={88} showTm>kutok</Wordmark>
          <Text style={styles.tagline}>Discover places worth a detour</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <Button
            label="Log in"
            onPress={handleLogin}
            variant="filled"
            size="lg"
            full
            disabled={loading}
          />
          <Pressable onPress={() => navigation.navigate('Forgot')} style={styles.centered}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <Rule faint />
          <Text style={styles.orText}>OR</Text>
          <Rule faint />
        </View>

        <View style={styles.socialButtons}>
          <Button label="Continue with Google" onPress={() => {}} variant="outline" size="lg" full />
          <Button label="Continue with Apple" onPress={() => {}} variant="outline" size="lg" full />
        </View>

        <Pressable onPress={() => navigation.navigate('Signup')} style={styles.centered}>
          <Text style={styles.signupLink}>New to Kutok? Create an account</Text>
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orText: {
    fontSize: 11,
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 1.5,
  },
  socialButtons: {
    gap: 10,
  },
  signupLink: {
    fontSize: 13,
    color: INK,
    textDecorationLine: 'underline',
  },
});
