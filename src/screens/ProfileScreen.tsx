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
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';
import { padIndex } from '../utils/formatters';

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
  const savedPlacesById = useAppStore((s) => s.savedPlacesById);

  const savedPlaces = Object.values(savedPlacesById);
  const visitedCount = savedPlaces.filter((p) => p.visited).length;
  const pendingCount = savedPlaces.length - visitedCount;
  const cities = new Set(savedPlaces.map((p) => p.city)).size;

  const handleSignOut = async () => {
    // The auth-gated navigator swaps back to the login stack automatically
    await signOut();
  };

  const displayName = user?.name ?? 'Explorer';

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
        <Text style={styles.metaText}>User profile</Text>
        <Text style={styles.metaRight}>Since 2024</Text>
      </View>

      {/* User name */}
      <Wordmark size={56}>{displayName}</Wordmark>

      {/* Location */}
      <View style={styles.locationRow}>
        <Feather name="map-pin" size={14} color={MUTED} />
        <Text style={styles.locationText}>London, UK</Text>
      </View>

      <Rule faint />

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(visitedCount)}</Text>
          <Text style={styles.statLabel}>VISITED</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(pendingCount)}</Text>
          <Text style={styles.statLabel}>PENDING</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(cities)}</Text>
          <Text style={styles.statLabel}>CITIES</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statNumber}>{padIndex(0)}</Text>
          <Text style={styles.statLabel}>GUIDES</Text>
        </View>
      </View>

      <Rule faint />

      {/* Menu */}
      <View style={styles.menu}>
        <MenuRow label="Account settings" onPress={() => navigation.navigate('PlaceDetail', { placeId: '' })} />
        <Rule faint />
        <MenuRow label="Privacy policy" onPress={() => {}} />
        <Rule faint />
        <MenuRow label="Terms of service" onPress={() => {}} />
        <Rule faint />
        <MenuRow label="Log out" onPress={handleSignOut} danger />
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
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: MUTED,
    textTransform: 'uppercase',
  },
  metaRight: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: MUTED,
    textTransform: 'uppercase',
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
