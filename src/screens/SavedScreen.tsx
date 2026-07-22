import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Pressable,
} from 'react-native';
import type { SavedPlace } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types';
import { INK, PAPER, MUTED, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Rule from '../ui/Rule';
import MetaLabel from '../ui/MetaLabel';
import Snackbar from '../ui/Snackbar';
import SavedRow from '../components/SavedRow';
import MapMarker from '../components/MapMarker';
import { useSaved } from '../hooks/useSaved';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../hooks/useTranslation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Saved'>,
  NativeStackScreenProps<RootStackParamList>
>;

const TABS = [
  { value: 'all', labelKey: 'saved.tabAll' },
  { value: 'been', labelKey: 'saved.tabBeen' },
  { value: 'havent', labelKey: 'saved.tabHavent' },
] as const;

type Tab = typeof TABS[number]['value'];

export default function SavedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { activeTab, setActiveTab, filteredPlaces, validPlaces, byCity } = useSaved();
  const { t, tCount } = useTranslation();
  const removeSaved = useAppStore((s) => s.removeSaved);
  const restoreSaved = useAppStore((s) => s.restoreSaved);
  const toggleVisited = useAppStore((s) => s.toggleVisited);
  const syncSaved = useAppStore((s) => s.syncSaved);
  const userId = useAppStore((s) => s.user?.id ?? null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await syncSaved(userId);
    } finally {
      setRefreshing(false);
    }
  }, [userId, syncSaved]);
  const [showMap, setShowMap] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const handleSwipeStart = useCallback(() => setScrollEnabled(false), []);
  const handleSwipeEnd = useCallback(() => setScrollEnabled(true), []);

  // Undo affordance for swipe-to-delete: keep the removed place around briefly.
  const [undoItem, setUndoItem] = useState<SavedPlace | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  const handleRemove = useCallback((id: string) => {
    const place = useAppStore.getState().savedPlacesById[id];
    removeSaved(id);
    if (!place) return;
    setUndoItem(place);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoItem(null), 4000);
  }, [removeSaved]);

  const handleUndo = useCallback(() => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoItem((item) => {
      if (item) restoreSaved(item);
      return null;
    });
  }, [restoreSaved]);

  // Stable callbacks so memoized SavedRows don't re-render across list updates.
  const handlePlacePress = useCallback(
    (placeId: string) => navigation.navigate('PlaceDetail', { placeId }),
    [navigation]
  );

  const sections = useMemo(
    () => Object.entries(byCity).map(([title, data]) => ({ title, data })),
    [byCity]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerTop}>
        <MetaLabel>{t('saved.meta')}</MetaLabel>
        <Text style={styles.countText}>
          {tCount('saved.count', filteredPlaces.length)}
        </Text>
      </View>

      <View style={styles.wordmarkRow}>
        <Wordmark size={56}>{t('saved.title')}</Wordmark>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.value}
            onPress={() => setActiveTab(tab.value as Tab)}
            accessibilityRole="tab"
            accessibilityLabel={t('a11y.tab', { name: t(tab.labelKey) })}
            accessibilityState={{ selected: activeTab === tab.value }}
            style={styles.tab}
          >
            <Text style={[styles.tabLabel, activeTab === tab.value && styles.tabLabelActive]}>
              {t(tab.labelKey).toUpperCase()}
            </Text>
            {activeTab === tab.value && <View style={styles.tabUnderline} />}
          </Pressable>
        ))}

        <Pressable
          onPress={() => setShowMap((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={showMap ? t('a11y.showList') : t('a11y.showMap')}
          style={styles.mapToggle}
        >
          <Feather name={showMap ? 'list' : 'map'} size={18} color={INK} />
        </Pressable>
      </View>

      <Rule thick />

      {/* Content */}
      {filteredPlaces.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('saved.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'all'
              ? t('saved.emptyAll')
              : activeTab === 'been'
              ? t('saved.emptyBeen')
              : t('saved.emptyHavent')}
          </Text>
        </View>
      ) : showMap ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: validPlaces[0]?.lat ?? 51.505,
            longitude: validPlaces[0]?.lng ?? -0.09,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          {validPlaces.map((place) => (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              title={place.name}
              onPress={() => handlePlacePress(place.id)}
              // Custom marker view is static → don't re-render the native marker
              // on every frame (major jank source with many pins).
              tracksViewChanges={false}
            >
              <MapMarker />
            </Marker>
          ))}
        </MapView>
      ) : (
        <SectionList
          style={styles.list}
          sections={sections}
          keyExtractor={(item) => item.id}
          scrollEnabled={scrollEnabled}
          refreshing={refreshing}
          onRefresh={userId ? onRefresh : undefined}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          renderSectionHeader={({ section }) => (
            <Text style={styles.cityLabel}>{section.title.toUpperCase()}</Text>
          )}
          renderItem={({ item, index }: { item: SavedPlace; index: number }) => (
            <SavedRow
              place={item}
              index={index}
              onPress={handlePlacePress}
              onToggleVisited={toggleVisited}
              onRemove={handleRemove}
              onSwipeStart={handleSwipeStart}
              onSwipeEnd={handleSwipeEnd}
            />
          )}
        />
      )}

      {undoItem && (
        <View style={[styles.snackbarWrap, { paddingBottom: insets.bottom }]}>
          <Snackbar
            message={t('saved.removed')}
            actionLabel={t('common.undo')}
            onAction={handleUndo}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAPER,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 16,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: MUTED,
  },
  wordmarkRow: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    gap: 16,
    marginBottom: 0,
  },
  tab: {
    paddingBottom: 10,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: MUTED,
  },
  tabLabelActive: {
    color: INK,
    fontWeight: '800',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: INK,
  },
  mapToggle: {
    marginLeft: 'auto',
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_PADDING,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: INK,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  map: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  snackbarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
  },
  cityLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: MUTED,
    paddingTop: 24,
    paddingBottom: 10,
    backgroundColor: PAPER,
  },
});
