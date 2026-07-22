import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Place, PlaceExtraDetails } from '../types';
import { INK, MUTED } from '../utils/theme';
import Tag from '../ui/Tag';
import Rule from '../ui/Rule';
import PlaceGallery from './PlaceGallery';
import PlaceLocation from './PlaceLocation';
import { useTranslation } from '../hooks/useTranslation';

interface PlaceDetailsProps {
  place: Place;
  details?: PlaceExtraDetails | null;
  /** True while the extra Place Details request (phone/website) is in flight. */
  detailsLoading?: boolean;
  /**
   * Defer loading gallery photos until the user taps to reveal them. Use in the
   * Discover deck preview so passed-over cards never fire photo requests.
   */
  lazyGallery?: boolean;
}

export default function PlaceDetails({
  place,
  details,
  detailsLoading = false,
  lazyGallery = false,
}: PlaceDetailsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Gallery */}
      {place.gallery.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('place.gallery')}</Text>
          <Rule faint />
          <PlaceGallery photos={place.gallery} lazyGallery={lazyGallery} />
        </View>
      )}

      {/* Details grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('place.details')}</Text>
        <Rule faint />
        <View style={styles.detailsGrid}>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t('place.hours')}</Text>
            <Text style={styles.detailValue}>{place.hours}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t('place.price')}</Text>
            <Text style={styles.detailValue}>{place.price}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t('place.rating')}</Text>
            <Text style={styles.detailValue}>★ {place.rating}</Text>
          </View>
          <View style={styles.detailCell}>
            <Text style={styles.detailLabel}>{t('place.type')}</Text>
            <Text style={styles.detailValue}>{place.type}</Text>
          </View>
          {details?.nationalPhoneNumber ? (
            <View style={styles.detailCellFull}>
              <Text style={styles.detailLabel}>{t('place.phone')}</Text>
              <Pressable onPress={() => Linking.openURL(`tel:${details.nationalPhoneNumber}`)}>
                <Text style={[styles.detailValue, styles.link]}>{details.nationalPhoneNumber}</Text>
              </Pressable>
            </View>
          ) : detailsLoading ? (
            <View style={styles.detailCellFull}>
              <Text style={styles.detailLabel}>{t('place.phone')}</Text>
              <ActivityIndicator size="small" color={MUTED} style={styles.detailLoader} />
            </View>
          ) : null}
        </View>
      </View>

      {/* Highlights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('place.highlights')}</Text>
        <Rule faint />
        <View style={styles.highlights}>
          {place.highlights.map((h) => (
            <Tag key={h} label={h} />
          ))}
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('place.location')}</Text>
        <Rule faint />
        <PlaceLocation place={place} details={details} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: MUTED,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  detailCell: {
    width: '50%',
    paddingVertical: 12,
    paddingRight: 8,
  },
  detailCellFull: {
    width: '100%',
    paddingVertical: 12,
    paddingRight: 8,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: MUTED,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: INK,
  },
  link: {
    textDecorationLine: 'underline',
  },
  detailLoader: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
