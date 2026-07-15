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
import Rule from '../ui/Rule';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signUp, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSignup = async () => {
    await signUp(name, email, password);
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
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.back}>
          <Feather name="arrow-left" size={16} color={INK} />
          <Text style={styles.backText}>BACK TO LOGIN</Text>
        </Pressable>

        <View style={styles.header}>
          <Wordmark size={56}>{'create /\naccount'}</Wordmark>
        </View>

        <View style={styles.form}>
          {error && <Text style={styles.error}>{error}</Text>}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
          />
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

          <Pressable onPress={() => setAgreed((v) => !v)} style={styles.termsRow}>
            <Feather
              name={agreed ? 'check-square' : 'square'}
              size={18}
              color={INK}
            />
            <Text style={styles.termsText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </Pressable>

          <Button
            label="Create account"
            onPress={handleSignup}
            variant="filled"
            size="lg"
            full
            disabled={loading || !agreed}
          />
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

        <Pressable onPress={() => navigation.navigate('Login')} style={styles.centered}>
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
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
  centered: {
    alignItems: 'center',
  },
  loginLink: {
    fontSize: 13,
    color: INK,
    textDecorationLine: 'underline',
  },
});
