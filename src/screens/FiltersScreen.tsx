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
import Rule from '../ui/Rule';
import { useFilters } from '../hooks/useFilters';
import { useLocationInput } from '../hooks/useLocationInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Filters'>;

const RADIUS_OPTIONS = ['near', '5km', '10km', '25km', '50km'];
const CATEGORY_OPTIONS = ['All', 'Culture', 'Café', 'Museum', 'Nature', 'Food', 'Market', 'Bar'];
const PRICE_OPTIONS = ['any', 'Free', '£', '££', '£££'];
const RATING_OPTIONS = ['any', '4.0+', '4.5+', '4.8+'];
const AVAILABILITY_OPTIONS = ['any', 'Open now', 'Open evening'];
const SORT_OPTIONS = ['relevance', 'distance', 'rating'];
const MIN_REVIEWS_OPTIONS = ['any', '50+', '200+', '500+'];

const PRESETS: { label: string; emoji: string; filters: Partial<Filters> }[] = [
  { label: 'Tonight', emoji: '🌙', filters: { availability: 'Open evening' } },
  { label: 'Budget', emoji: '💸', filters: { price: '£' } },
  { label: 'Top Rated', emoji: '⭐', filters: { rating: '4.8+', sort: 'rating' } },
];

export default function FiltersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { localFilters, updateLocal, applyFilters, resetFilters } = useFilters();
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
        <Wordmark size={32}>Filters</Wordmark>
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
          <Text style={styles.sectionLabel}>QUICK FILTERS</Text>
          <View style={styles.presets}>
            {PRESETS.map((preset) => (
              <Pressable
                key={preset.label}
                style={styles.preset}
                onPress={() => updateLocal(preset.filters)}
              >
                <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                <Text style={styles.presetLabel}>{preset.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LOCATION</Text>
          <TextInput
            value={localFilters.locText}
            onChangeText={onLocationChange}
            placeholder="City, area or address"
            rightElement={
              <Pressable onPress={onCurrentLocation}>
                <Text style={styles.currentBtn}>CURRENT</Text>
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
          <Text style={styles.sectionLabel}>RADIUS</Text>
          <ChipGroup
            options={RADIUS_OPTIONS}
            value={localFilters.radius}
            onChange={(v) => updateLocal({ radius: v })}
            size="sm"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CATEGORY</Text>
          <ChipGroup
            options={CATEGORY_OPTIONS}
            value={localFilters.category}
            onChange={(v) => updateLocal({ category: v })}
            size="sm"
          />
        </View>

        {/* Sort */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SORT BY</Text>
          <ChipGroup
            options={SORT_OPTIONS}
            value={localFilters.sort}
            onChange={(v) => updateLocal({ sort: v as Filters['sort'] })}
            size="sm"
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRICE</Text>
          <ChipGroup
            options={PRICE_OPTIONS}
            value={localFilters.price}
            onChange={(v) => updateLocal({ price: v })}
            size="sm"
          />
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RATING</Text>
          <ChipGroup
            options={RATING_OPTIONS}
            value={localFilters.rating}
            onChange={(v) => updateLocal({ rating: v })}
            size="sm"
          />
        </View>

        {/* Min reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MIN REVIEWS</Text>
          <ChipGroup
            options={MIN_REVIEWS_OPTIONS}
            value={localFilters.minReviews}
            onChange={(v) => updateLocal({ minReviews: v as Filters['minReviews'] })}
            size="sm"
          />
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AVAILABILITY</Text>
          <ChipGroup
            options={AVAILABILITY_OPTIONS}
            value={localFilters.availability}
            onChange={(v) => updateLocal({ availability: v })}
            size="sm"
          />
        </View>

        {/* Hide seen */}
        <Pressable
          style={styles.toggleRow}
          onPress={() => updateLocal({ hideSeen: !localFilters.hideSeen })}
        >
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>HIDE SEEN PLACES</Text>
            <Text style={styles.toggleSub}>Skip places you've already swiped</Text>
          </View>
          <View style={[styles.toggleTrack, localFilters.hideSeen && styles.toggleTrackOn]}>
            <View style={[styles.toggleThumb, localFilters.hideSeen && styles.toggleThumbOn]} />
          </View>
        </Pressable>

        <Pressable onPress={resetFilters} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>RESET ALL FILTERS</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Rule thick />
        <View style={styles.footerInner}>
          <Button label="Apply filters" onPress={handleApply} variant="filled" size="lg" full />
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
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: HAIR,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackOn: {
    backgroundColor: INK,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PAPER,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
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
