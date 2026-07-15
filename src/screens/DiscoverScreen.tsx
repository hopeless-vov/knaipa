import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
// Reserve ~230px for header/title/actions/gaps, ~140px for scrollable details
const DECK_HEIGHT = Math.min(420, Math.max(260, WINDOW_HEIGHT * 0.42));
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types';
import { INK, PAPER, MUTED, RED, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import SwipeCard, { SwipeCardRef } from '../components/SwipeCard';
import PlaceDetails from '../components/PlaceDetails';
import DiscoverSearchBar from '../components/DiscoverSearchBar';
import { useDiscover } from '../hooks/useDiscover';
import { useTranslation } from '../hooks/useTranslation';
import { padIndex } from '../utils/formatters';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Discover'>,
  NativeStackScreenProps<RootStackParamList>
>;

const VISIBLE_CARDS = 3;

export default function DiscoverScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    deck, topCard, totalDeck, deckIndex, activeFilterCount, canUndo,
    isLoading, isLoadingMore, hasLocation, deckError, locationDenied,
    requestLocation, retryFetch, like, pass, undo, reset,
    mode, categories, query, setMode, toggleCategory, submitSearch,
  } = useDiscover();
  const { t } = useTranslation();

  const visibleDeck = useMemo(() => deck.slice(0, VISIBLE_CARDS), [deck]);
  const reversedDeck = useMemo(() => [...visibleDeck].reverse(), [visibleDeck]);
  const topCardRef = useRef<SwipeCardRef>(null);

  // Prefetch cover photos for the next 3 cards (expo-image handles disk cache)
  useEffect(() => {
    const urls = deck.slice(1, 4).map(p => p.cover).filter(Boolean);
    if (urls.length) Image.prefetch(urls);
  }, [deck]);

  // Fade content when top card changes
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const [displayedCard, setDisplayedCard] = useState(topCard);

  useEffect(() => {
    if (topCard?.id === displayedCard?.id) return;
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setDisplayedCard(topCard);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }, [topCard?.id]);

  const handleLike = useCallback(() => {
    topCardRef.current?.animateLike();
  }, []);

  const handlePass = useCallback(() => {
    topCardRef.current?.animatePass();
  }, []);

  const handleCardPress = () => {
    if (topCard) {
      navigation.navigate('PlaceDetail', { placeId: topCard.id, fromDiscover: true });
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header meta row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.metaSmall}>{t('discover.meta')}</Text>
            {deck.length > 0 && (
              <Text style={styles.counter}>
                {padIndex(deckIndex + 1)} / {padIndex(totalDeck)}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            {displayedCard && (
              <Animated.Text style={[styles.distance, { opacity: contentOpacity }]}>
                {t('discover.distanceAway', { distance: displayedCard.distance })}
              </Animated.Text>
            )}
            <TouchableOpacity
              style={styles.filtersBtn}
              onPress={() => navigation.navigate('Filters')}
              activeOpacity={0.7}
            >
              <Text style={styles.filtersBtnText}>{t('discover.filters')}</Text>
              {activeFilterCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Wordmark size={68}>{t('discover.title')}</Wordmark>
        </View>

        {/* Browse / Search */}
        <DiscoverSearchBar
          mode={mode}
          categories={categories}
          query={query}
          onModeChange={setMode}
          onToggleCategory={toggleCategory}
          onSubmitQuery={submitSearch}
        />

        {/* Card deck */}
        {isLoading && deck.length === 0 ? (
          <View style={styles.deckWrapper}>
            <View style={styles.loadingCard}>
              <ActivityIndicator color={INK} />
              <Text style={styles.loadingText}>{t('discover.loading')}</Text>
            </View>
          </View>
        ) : deckError && deck.length === 0 ? (
          <View style={styles.emptyDeck}>
            <Text style={styles.emptyTitle}>{t('discover.errorTitle')}</Text>
            <Text style={styles.emptySub}>{t(deckError)}</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => retryFetch()} activeOpacity={0.8}>
              <Text style={styles.resetBtnText}>{t('common.tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : !hasLocation ? (
          <View style={styles.emptyDeck}>
            <Text style={styles.emptyTitle}>
              {locationDenied ? t('discover.locationOffTitle') : t('discover.noLocationTitle')}
            </Text>
            <Text style={styles.emptySub}>
              {locationDenied ? t('discover.locationOffBody') : t('discover.noLocationBody')}
            </Text>
            {locationDenied && (
              <TouchableOpacity style={styles.resetBtn} onPress={() => requestLocation()} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>{t('discover.enableLocation')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => navigation.navigate('Filters')}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>{t('common.openFilters')}</Text>
            </TouchableOpacity>
          </View>
        ) : deck.length > 0 ? (
          <View style={styles.deckWrapper}>
            {reversedDeck.map((place, reversedIdx) => {
              const depth = visibleDeck.length - 1 - reversedIdx;
              const isTop = depth === 0;
              return (
                <SwipeCard
                  key={place.id}
                  ref={isTop ? topCardRef : undefined}
                  place={place}
                  depth={depth}
                  isTop={isTop}
                  index={deckIndex}
                  total={totalDeck}
                  onLike={like}
                  onPass={pass}
                  onPress={handleCardPress}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyDeck}>
            <Text style={styles.emptyTitle}>{t('discover.noResultsTitle')}</Text>
            <Text style={styles.emptySub}>{t('discover.noResultsBody')}</Text>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => navigation.navigate('Filters')}
              activeOpacity={0.8}
            >
              <Text style={styles.resetBtnText}>{t('discover.changeFilters')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator color={MUTED} size="small" />
            <Text style={styles.loadingMoreText}>{t('discover.loadingMore')}</Text>
          </View>
        )}

        {/* Action buttons — Pass | Undo | Like */}
        {hasLocation && deck.length > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionOutline, styles.actionFlex]}
              onPress={handlePass}
              activeOpacity={0.8}
            >
              <Text style={styles.actionOutlineText}>{t('discover.pass')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.undoBtn, !canUndo && styles.undoBtnDisabled]}
              onPress={canUndo ? undo : undefined}
              activeOpacity={0.8}
            >
              <Text style={[styles.undoIcon, !canUndo && { opacity: 0.35 }]}>↶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionFilled, styles.actionFlex]}
              onPress={handleLike}
              activeOpacity={0.8}
            >
              <Text style={styles.actionFilledText}>{t('discover.like')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Place details */}
        {displayedCard && (
          <Animated.View style={[styles.detailsSection, { opacity: contentOpacity }]}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsLabel}>{t('discover.aboutThisPlace')}</Text>
              <Text style={styles.scrollHint}>{t('discover.scrollHint')}</Text>
            </View>
            <PlaceDetails place={displayedCard} lazyGallery />
            <View style={{ height: 24 }} />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAPER,
  },

  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 14,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaSmall: {
    fontFamily: undefined,
    fontSize: 14,
    color: INK,
  },
  counter: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: MUTED,
    fontVariant: ['tabular-nums'],
  },
  distance: {
    fontSize: 13,
    color: MUTED,
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: INK,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 36,
    position: 'relative',
  },
  filtersBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: INK,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: INK,
    borderWidth: 1.5,
    borderColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: PAPER,
  },

  titleRow: {
    marginTop: -4,
  },

  // ── Deck ──
  deckWrapper: {
    height: DECK_HEIGHT,
    position: 'relative',
  },
  loadingCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  loadingText: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptyDeck: {
    height: DECK_HEIGHT,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: INK,
  },
  emptySub: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: INK,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: INK,
  },

  // ── Action buttons: Pass | Undo | Like ──
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginTop: 4,
  },
  actionFlex: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutline: {
    borderWidth: 1.5,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  actionOutlineText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: INK,
  },
  actionFilled: {
    backgroundColor: INK,
    borderWidth: 1.5,
    borderColor: INK,
  },
  actionFilledText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: PAPER,
  },
  undoBtn: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoBtnDisabled: {
    opacity: 0.35,
  },
  undoIcon: {
    fontSize: 24,
    color: INK,
    lineHeight: 28,
  },

  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingMoreText: {
    fontSize: 11,
    letterSpacing: 0.5,
    color: MUTED,
  },

  detailsSection: {
    marginTop: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: INK,
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: INK,
  },
  scrollHint: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: MUTED,
  },
});
