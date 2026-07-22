import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList , UserPreferences } from '../types';
import { INK, MUTED, RED, PAPER, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Rule from '../ui/Rule';
import Toggle from '../ui/Toggle';
import SegmentedControl from '../ui/SegmentedControl';
import SectionLabel from '../ui/SectionLabel';
import MetaLabel from '../ui/MetaLabel';
import AccountEditRow from '../components/AccountEditRow';
import { useAppStore } from '../store/useAppStore';
import { useAccount } from '../hooks/useAccount';
import { useTranslation } from '../hooks/useTranslation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

// Non-linguistic mask for the hidden password value (not translatable text).
const PASSWORD_MASK = '••••••••';

interface NotificationRowProps {
  label: string;
  sub?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

/** A single notification/preference toggle row (with optional subtitle). */
function NotificationRow({ label, sub, value, onValueChange }: NotificationRowProps) {
  return (
    <View style={styles.row}>
      {sub ? (
        <View style={styles.rowInfo}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowValue}>{sub}</Text>
        </View>
      ) : (
        <Text style={styles.rowLabel}>{label}</Text>
      )}
      <Toggle value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const { user, loading, error, message, updateName, updatePassword, updateEmail } = useAccount();
  const { t } = useTranslation();

  const setNotif = (key: keyof UserPreferences['notifications'], v: boolean) =>
    setPreference('notifications', { ...preferences.notifications, [key]: v });

  const distanceOptions = [
    { value: 'km', label: t('settings.unitKm') },
    { value: 'mi', label: t('settings.unitMi') },
  ];
  const languageOptions = [
    { value: 'en', label: t('settings.langEn') },
    { value: 'uk', label: t('settings.langUk') },
  ];

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
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
          style={styles.back}
        >
          <Feather name="arrow-left" size={16} color={INK} />
        </Pressable>
        <MetaLabel>{t('settings.meta')}</MetaLabel>
      </View>

      <Wordmark size={56}>{t('settings.title')}</Wordmark>

      {/* Account */}
      <View style={styles.section}>
        <SectionLabel style={styles.sectionSpacing}>{t('settings.account')}</SectionLabel>
        <Rule faint />
        <AccountEditRow
          label={t('settings.email')}
          value={user?.email ?? ''}
          initialDraft={user?.email ?? ''}
          actionLabel={t('settings.change')}
          placeholder={t('settings.newEmail')}
          loading={loading}
          onSave={updateEmail}
        />
        <Rule faint />
        <AccountEditRow
          label={t('settings.password')}
          value={PASSWORD_MASK}
          actionLabel={t('settings.update')}
          placeholder={t('settings.newPassword')}
          secureTextEntry
          loading={loading}
          onSave={updatePassword}
        />
        <Rule faint />
        <AccountEditRow
          label={t('settings.displayName')}
          value={user?.name ?? ''}
          initialDraft={user?.name ?? ''}
          actionLabel={t('settings.edit')}
          placeholder={t('settings.yourName')}
          loading={loading}
          onSave={updateName}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!message && <Text style={styles.message}>{message}</Text>}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <SectionLabel style={styles.sectionSpacing}>{t('settings.notifications')}</SectionLabel>
        <Rule faint />
        <NotificationRow
          label={t('settings.push')}
          value={preferences.notifications.push}
          onValueChange={(v) => setNotif('push', v)}
        />
        <Rule faint />
        <NotificationRow
          label={t('settings.emailUpdates')}
          value={preferences.notifications.email}
          onValueChange={(v) => setNotif('email', v)}
        />
        <Rule faint />
        <NotificationRow
          label={t('settings.locationServices')}
          sub={t('settings.locationServicesSub')}
          value={preferences.notifications.location}
          onValueChange={(v) => setNotif('location', v)}
        />
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <SectionLabel style={styles.sectionSpacing}>{t('settings.preferences')}</SectionLabel>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.distanceUnit')}</Text>
          <SegmentedControl
            options={distanceOptions}
            value={preferences.distanceUnit}
            onChange={(v) => setPreference('distanceUnit', v as 'km' | 'mi')}
          />
        </View>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.language')}</Text>
          <SegmentedControl
            options={languageOptions}
            value={preferences.language}
            onChange={(v) => setPreference('language', v)}
          />
        </View>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <SectionLabel style={styles.sectionSpacing}>{t('settings.legal')}</SectionLabel>
        <Rule faint />
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Privacy')}>
          <Text style={styles.rowLabel}>{t('profile.privacy')}</Text>
          <Feather name="chevron-right" size={16} color={MUTED} />
        </Pressable>
        <Rule faint />
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.rowLabel}>{t('profile.terms')}</Text>
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
  section: { gap: 0 },
  sectionSpacing: { marginBottom: 12 },
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
