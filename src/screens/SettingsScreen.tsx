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
import { useTranslation } from '../hooks/useTranslation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

// Non-linguistic mask for the hidden password value (not translatable text).
const PASSWORD_MASK = '••••••••';

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const preferences = useAppStore((s) => s.preferences);
  const setPreference = useAppStore((s) => s.setPreference);
  const { user, loading, error, message, updateName, updatePassword, updateEmail } = useAccount();
  const { t } = useTranslation();

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
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Feather name="arrow-left" size={16} color={INK} />
        </Pressable>
        <Text style={styles.metaText}>{t('settings.meta')}</Text>
      </View>

      <Wordmark size={56}>{t('settings.title')}</Wordmark>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.push')}</Text>
          <Toggle
            value={preferences.notifications.push}
            onValueChange={(v) =>
              setPreference('notifications', { ...preferences.notifications, push: v })
            }
          />
        </View>
        <Rule faint />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('settings.emailUpdates')}</Text>
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
            <Text style={styles.rowLabel}>{t('settings.locationServices')}</Text>
            <Text style={styles.rowValue}>{t('settings.locationServicesSub')}</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
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
        <Text style={styles.sectionTitle}>{t('settings.legal')}</Text>
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
