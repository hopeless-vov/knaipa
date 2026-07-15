import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { INK, MUTED, PAPER, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Rule from '../ui/Rule';
import { useTranslation } from '../hooks/useTranslation';

export interface LegalSection {
  title: string;
  body: string;
}

interface LegalScreenProps {
  title: string;
  subtitle: string;
  sections: LegalSection[];
  onBack: () => void;
}

export default function LegalScreen({ title, subtitle, sections, onBack }: LegalScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <View style={styles.headerTop}>
        <Pressable onPress={onBack} style={styles.back}>
          <Feather name="arrow-left" size={16} color={INK} />
        </Pressable>
        <Text style={styles.metaText}>{t('legal.label')}</Text>
      </View>

      <Wordmark size={48}>{title}</Wordmark>
      <Text style={styles.updated}>{subtitle}</Text>

      <Rule faint />

      {sections.map((section, idx) => (
        <View key={idx} style={styles.section}>
          <Text style={styles.sectionTitle}>{idx + 1}. {section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}
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
    alignItems: 'center',
    gap: 12,
  },
  back: {
    padding: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: MUTED,
    textTransform: 'uppercase',
  },
  updated: {
    fontSize: 12,
    color: MUTED,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
    letterSpacing: -0.3,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: INK,
  },
});
