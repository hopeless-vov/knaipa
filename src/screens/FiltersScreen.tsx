import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList, Filters } from '../types';
import { INK, PAPER, MUTED, HAIR, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import ChipGroup from '../ui/ChipGroup';
import Toggle from '../ui/Toggle';
import Rule from '../ui/Rule';
import { useFilters } from '../hooks/useFilters';
import { useLocationInput } from '../hooks/useLocationInput';
import { useTranslation } from '../hooks/useTranslation';
import {
  RADIUS_OPTIONS,
  PRICE_OPTIONS,
  RATING_OPTIONS,
  AVAILABILITY_OPTIONS,
  SORT_OPTIONS,
  MIN_REVIEWS_OPTIONS,
} from '../utils/places';

type Props = NativeStackScreenProps<RootStackParamList, 'Filters'>;

const PRESETS: { labelKey: string; emoji: string; filters: Partial<Filters> }[] = [
  { labelKey: 'filters.presetTonight', emoji: '🌙', filters: { availability: 'Open evening' } },
  { labelKey: 'filters.presetBudget', emoji: '💸', filters: { price: '£' } },
  { labelKey: 'filters.presetTopRated', emoji: '⭐', filters: { rating: '4.8+', sort: 'rating' } },
];

export default function FiltersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { localFilters, updateLocal, applyFilters, resetFilters } = useFilters();
  const { t } = useTranslation();
  const { suggestions, onLocationChange, onSelectSuggestion, onCurrentLocation, clearSuggestions } =
    useLocationInput(updateLocal);

  const handleApply = () => {
    clearSuggestions();
    applyFilters();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Wordmark size={32}>{t('filters.title')}</Wordmark>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={INK} />
        </Pressable>
      </View>

      <Rule thick />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.quick')}</Text>
          <View style={styles.presets}>
            {PRESETS.map((preset) => (
              <Pressable
                key={preset.labelKey}
                style={styles.preset}
                onPress={() => updateLocal(preset.filters)}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <Text style={styles.presetLabel}>{t(preset.labelKey)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.location')}</Text>
          <TextInput
            value={localFilters.locText}
            onChangeText={onLocationChange}
            placeholder={t('filters.locationPlaceholder')}
            rightElement={
              <Pressable onPress={onCurrentLocation}>
                <Text style={styles.currentBtn}>{t('filters.current')}</Text>
              </Pressable>
            }
          />
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map((s, i) => (
                <React.Fragment key={s.placeId || i}>
                  <Pressable
                    style={styles.suggestionRow}
                    onPress={() => onSelectSuggestion(s)}
                  >
                    <Text style={styles.suggestionMain}>{s.mainText}</Text>
                    {!!s.secondaryText && (
                      <Text style={styles.suggestionSub}>{s.secondaryText}</Text>
                    )}
                  </Pressable>
                  {i < suggestions.length - 1 && <View style={styles.suggestionDivider} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Radius */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.radius')}</Text>
          <ChipGroup
            options={RADIUS_OPTIONS}
            value={localFilters.radius}
            onChange={(v) => updateLocal({ radius: v })}
            size="sm"
          />
        </View>

        {/* Sort */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.sortBy')}</Text>
          <ChipGroup
            options={SORT_OPTIONS}
            value={localFilters.sort}
            onChange={(v) => updateLocal({ sort: v as Filters['sort'] })}
            size="sm"
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.price')}</Text>
          <ChipGroup
            options={PRICE_OPTIONS}
            value={localFilters.price}
            onChange={(v) => updateLocal({ price: v })}
            size="sm"
          />
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.rating')}</Text>
          <ChipGroup
            options={RATING_OPTIONS}
            value={localFilters.rating}
            onChange={(v) => updateLocal({ rating: v })}
            size="sm"
          />
        </View>

        {/* Min reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.minReviews')}</Text>
          <ChipGroup
            options={MIN_REVIEWS_OPTIONS}
            value={localFilters.minReviews}
            onChange={(v) => updateLocal({ minReviews: v as Filters['minReviews'] })}
            size="sm"
          />
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('filters.availability')}</Text>
          <ChipGroup
            options={AVAILABILITY_OPTIONS}
            value={localFilters.availability}
            onChange={(v) => updateLocal({ availability: v })}
            size="sm"
          />
        </View>

        {/* Hide seen */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>{t('filters.hideSeen')}</Text>
            <Text style={styles.toggleSub}>{t('filters.hideSeenSub')}</Text>
          </View>
          <Toggle
            value={localFilters.hideSeen}
            onValueChange={(v) => updateLocal({ hideSeen: v })}
          />
        </View>

        <Pressable onPress={resetFilters} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>{t('filters.reset')}</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Rule thick />
        <View style={styles.footerInner}>
          <Button label={t('filters.apply')} onPress={handleApply} variant="filled" size="lg" full />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PAPER,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 20,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: MUTED,
  },
  presets: {
    flexDirection: 'row',
    gap: 10,
  },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: INK,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  presetEmoji: {
    fontSize: 14,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: INK,
    letterSpacing: 0.5,
  },
  currentBtn: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: INK,
  },
  suggestions: {
    borderWidth: 1.5,
    borderColor: INK,
    backgroundColor: PAPER,
  },
  suggestionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  suggestionMain: {
    fontSize: 14,
    fontWeight: '600',
    color: INK,
  },
  suggestionSub: {
    fontSize: 12,
    color: MUTED,
  },
  suggestionDivider: {
    height: 1,
    backgroundColor: HAIR,
    marginHorizontal: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleInfo: {
    gap: 2,
  },
  toggleLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: MUTED,
  },
  toggleSub: {
    fontSize: 12,
    color: MUTED,
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: MUTED,
    textDecorationLine: 'underline',
  },
  footer: {
    gap: 0,
  },
  footerInner: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 16,
  },
});
