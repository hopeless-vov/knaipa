import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { INK, MUTED, RED, PAPER, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Rule from '../ui/Rule';
import Toggle from '../ui/Toggle';
import SegmentedControl from '../ui/SegmentedControl';
import AccountEditRow from '../components/AccountEditRow';
import { useAppStore } from '../store/useAppStore';
import { useAccount } from '../hooks/useAccount';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const DISTANCE_OPTIONS = [
  { value: 'km', label: 'KM' },
  { value: 'mi', label: 'MI' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'uk', label: 'UK' },
];

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const { user, loading, error, message, updateName, updatePassword, updateEmail } = useAccount();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerTop}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Feather name="arrow-left" size={16} color={INK} />
        </Pressable>
        <Text style={styles.metaText}>Account</Text>
      </View>

      <Wordmark size={56}>Settings</Wordmark>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Rule faint />
        <AccountEditRow
          label="Email"
          value={user?.email ?? ''}
          initialDraft={user?.email ?? ''}
          actionLabel="CHANGE"
          placeholder="New email address"
          loading={loading}
          onSave={updateEmail}
        />
        <Rule faint />
        <AccountEditRow
          label="Password"
          value="••••••••"
          actionLabel="UPDATE"
          placeholder="New password"
          secureTextEntry
          loading={loading}
          onSave={updatePassword}
        />
        <Rule faint />
        <AccountEditRow
          label="Display name"
          value={user?.name ?? ''}
          initialDraft={user?.name ?? ''}
          actionLabel="EDIT"
          placeholder="Your name"
          loading={loading}
          onSave={updateName}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!message && <Text style={styles.message}>{message}</Text>}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Push notifications</Text>
          <Toggle
            value={preferences.notifications.push}
            onValueChange={(v) =>
              setPreference('notifications', { ...preferences.notifications, push: v })
            }
          />
        </View>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email updates</Text>
          <Toggle
            value={preferences.notifications.email}
            onValueChange={(v) =>
              setPreference('notifications', { ...preferences.notifications, email: v })
            }
          />
        </View>
        <Rule faint />
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Location services</Text>
            <Text style={styles.rowValue}>Use your GPS to find places nearby</Text>
          </View>
          <Toggle
            value={preferences.notifications.location}
            onValueChange={(v) =>
              setPreference('notifications', { ...preferences.notifications, location: v })
            }
          />
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Distance unit</Text>
          <SegmentedControl
            options={DISTANCE_OPTIONS}
            value={preferences.distanceUnit}
            onChange={(v) => setPreference('distanceUnit', v as 'km' | 'mi')}
          />
        </View>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Language</Text>
          <SegmentedControl
            options={LANGUAGE_OPTIONS}
            value={preferences.language}
            onChange={(v) => setPreference('language', v)}
          />
        </View>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <Rule faint />
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Privacy')}>
          <Text style={styles.rowLabel}>Privacy policy</Text>
          <Feather name="chevron-right" size={16} color={MUTED} />
        </Pressable>
        <Rule faint />
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.rowLabel}>Terms of service</Text>
          <Feather name="chevron-right" size={16} color={MUTED} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: PAPER },
  content: { paddingHorizontal: SCREEN_PADDING, gap: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { padding: 4 },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: MUTED,
    textTransform: 'uppercase',
  },
  section: { gap: 0 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: MUTED,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowInfo: { gap: 2, flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: INK },
  rowValue: { fontSize: 13, color: MUTED },
  error: { fontSize: 13, color: RED, paddingTop: 10 },
  message: { fontSize: 13, color: INK, paddingTop: 10 },
});
