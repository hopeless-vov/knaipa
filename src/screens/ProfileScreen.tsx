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
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types';
import { INK, PAPER, MUTED, HAIR, RED, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Rule from '../ui/Rule';
import MetaLabel from '../ui/MetaLabel';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import { padIndex } from '../utils/formatters';
import { computeProfileStats, homeCity } from '../utils/profile';
import { useTranslation } from '../hooks/useTranslation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

function MenuRow({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <Text style={[styles.menuRowLabel, danger && styles.menuRowDanger]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={danger ? RED : MUTED} />
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const savedPlacesById = useAppStore((s) => s.savedPlacesById);

  const savedPlaces = Object.values(savedPlacesById);
  const { visited: visitedCount, pending: pendingCount, cities } = computeProfileStats(savedPlaces);
  const year = user?.createdAt ? new Date(user.createdAt).getFullYear() : NaN;
  const since = Number.isNaN(year) ? '' : t('profile.since', { year });
  const city = homeCity(savedPlaces);

  const handleSignOut = async () => {
    // The auth-gated navigator swaps back to the login stack automatically
    await signOut();
  };

  const displayName = user?.name ?? t('profile.fallbackName');

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
        <MetaLabel>{t('profile.meta')}</MetaLabel>
        {!!since && <MetaLabel>{since}</MetaLabel>}
      </View>

      {/* User name */}
      <Wordmark size={56}>{displayName}</Wordmark>

      {/* Location */}
      {!!city && (
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={MUTED} />
          <Text style={styles.locationText}>{city}</Text>
        </View>
      )}

      <Rule faint />

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(visitedCount)}</Text>
          <Text style={styles.statLabel}>{t('profile.visited')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(pendingCount)}</Text>
          <Text style={styles.statLabel}>{t('profile.pending')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(cities)}</Text>
          <Text style={styles.statLabel}>{t('profile.cities')}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(0)}</Text>
          <Text style={styles.statLabel}>{t('profile.guides')}</Text>
        </View>
      </View>

      <Rule faint />

      {/* Menu */}
      <View style={styles.menu}>
        <MenuRow label={t('profile.accountSettings')} onPress={() => navigation.navigate('Settings')} />
        <Rule faint />
        <MenuRow label={t('profile.privacy')} onPress={() => navigation.navigate('Privacy')} />
        <Rule faint />
        <MenuRow label={t('profile.terms')} onPress={() => navigation.navigate('Terms')} />
        <Rule faint />
        <MenuRow label={t('profile.logout')} onPress={handleSignOut} danger />
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
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: MUTED,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: {
    width: '50%',
    paddingVertical: 16,
    gap: 6,
  },
  statNumber: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
    color: INK,
    lineHeight: 44,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: MUTED,
  },
  menu: {
    gap: 0,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuRowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: INK,
  },
  menuRowDanger: {
    color: RED,
  },
});
