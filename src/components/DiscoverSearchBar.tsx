import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { DiscoveryMode } from '../types';
import { BROWSE_CATEGORIES } from '../utils/places';
import { SCREEN_PADDING } from '../utils/theme';
import SegmentedControl from '../ui/SegmentedControl';
import Chip from '../ui/Chip';
import TextInput from '../ui/TextInput';

const MODE_OPTIONS = [
  { value: 'browse', label: 'Browse' },
  { value: 'search', label: 'Search' },
];

interface DiscoverSearchBarProps {
  mode: DiscoveryMode;
  categories: string[];
  query: string;
  onModeChange: (mode: DiscoveryMode) => void;
  onToggleCategory: (category: string) => void;
  onSubmitQuery: (text: string) => void;
}

export default function DiscoverSearchBar({
  mode,
  categories,
  query,
  onModeChange,
  onToggleCategory,
  onSubmitQuery,
}: DiscoverSearchBarProps) {
  const [draft, setDraft] = useState(query);

  return (
    <View style={styles.container}>
      <SegmentedControl
        options={MODE_OPTIONS}
        value={mode}
        onChange={(v) => onModeChange(v as DiscoveryMode)}
      />

      {mode === 'browse' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipRow}
        >
          {BROWSE_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={categories.includes(cat)}
              onPress={() => onToggleCategory(cat)}
              size="sm"
            />
          ))}
        </ScrollView>
      ) : (
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Search places — e.g. rooftop bar"
          returnKeyType="search"
          onSubmitEditing={() => onSubmitQuery(draft.trim())}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  chipRow: {
    marginHorizontal: -SCREEN_PADDING,
  },
  chips: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 8,
  },
});
