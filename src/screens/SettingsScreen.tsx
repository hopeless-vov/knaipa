import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { INK, MUTED, HAIR, PAPER, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Rule from '../ui/Rule';
import Toggle from '../ui/Toggle';
import SegmentedControl from '../ui/SegmentedControl';
import { useAppStore } from '../store/useAppStore';

const DISTANCE_OPTIONS = [
  { value: 'km', label: 'KM' },
  { value: 'mi', label: 'MI' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'uk', label: 'UK' },
  { value: 'es', label: 'ES' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const user = useAppStore((s) => s.user);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerTop}>
        <Text style={styles.metaText}>Account</Text>
      </View>

      <Wordmark size={56}>Settings</Wordmark>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Rule faint />
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email ?? '—'}</Text>
          </View>
          <Pressable style={styles.rowAction}>
            <Text style={styles.rowActionText}>CHANGE</Text>
          </Pressable>
        </View>
        <Rule faint />
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Password</Text>
            <Text style={styles.rowValue}>••••••••</Text>
          </View>
          <Pressable style={styles.rowAction}>
            <Text style={styles.rowActionText}>UPDATE</Text>
          </Pressable>
        </View>
        <Rule faint />
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>Display name</Text>
            <Text style={styles.rowValue}>{user?.name ?? '—'}</Text>
          </View>
          <Pressable style={styles.rowAction}>
            <Text style={styles.rowActionText}>EDIT</Text>
          </Pressable>
        </View>
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
          <Text style={styles.rowLabel}>Location services</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: PAPER,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: MUTED,
    textTransform: 'uppercase',
  },
  section: {
    gap: 0,
  },
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
  rowInfo: {
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: INK,
  },
  rowValue: {
    fontSize: 13,
    color: MUTED,
  },
  rowAction: {
    padding: 4,
  },
  rowActionText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: INK,
    textDecorationLine: 'underline',
  },
});
