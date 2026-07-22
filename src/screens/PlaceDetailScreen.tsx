import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { INK, PAPER, MUTED, RED, HAIR, SCREEN_PADDING } from '../utils/theme';
import Wordmark from '../ui/Wordmark';
import Rule from '../ui/Rule';
import Button from '../ui/Button';
import PlaceCover from '../components/PlaceCover';
import PlaceDetails from '../components/PlaceDetails';
import { useFindPlace } from '../hooks/useFindPlace';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../hooks/useTranslation';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaceDetail'>;

export default function PlaceDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { placeId, fromDiscover } = route.params;
  const place = useFindPlace(placeId);
  const { details, isLoading: detailsLoading } = usePlaceDetails(placeId);
  const { t } = useTranslation();
  // Act on the viewed place directly — avoid useDiscover's GPS/fetch lifecycle
  const swipeLike = useAppStore((s) => s.swipeLike);
  const swipePass = useAppStore((s) => s.swipePass);

  if (!place) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{t('place.notFound')}</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>{t('common.goBack')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel={t('common.goBack')}
        style={styles.back}
      >
        <Feather name="arrow-left" size={16} color={INK} />
        <Text style={styles.backText}>{fromDiscover ? t('place.fromDiscover') : t('place.fromSaved')}</Text>
      </Pressable>

      {/* Place name */}
      <Wordmark size={48}>{place.name}</Wordmark>

      {/* Cover image */}
      <PlaceCover place={place} size="md" showQuickInfo={false} />

      {/* Like/Pass buttons */}
      {fromDiscover && (
        <View style={styles.actionRow}>
          <Button
            label={t('place.pass')}
            onPress={() => {
              swipePass(place);
              navigation.goBack();
            }}
            variant="outline"
            size="lg"
            full
          />
          <Button
            label={t('place.like')}
            onPress={() => {
              swipeLike(place);
              navigation.goBack();
            }}
            variant="filled"
            size="lg"
            full
          />
        </View>
      )}

      <Rule faint />

      {/* Place details */}
      <PlaceDetails place={place} details={details} detailsLoading={detailsLoading} />
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
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: INK,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: MUTED,
  },
  link: {
    fontSize: 14,
    color: INK,
    textDecorationLine: 'underline',
  },
});
