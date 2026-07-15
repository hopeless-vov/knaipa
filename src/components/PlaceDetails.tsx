import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking, Share, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Place, PlaceExtraDetails } from '../types';
import { INK, PAPER, MUTED, HAIR, SCREEN_PADDING } from '../utils/theme';
import Tag from '../ui/Tag';
import Rule from '../ui/Rule';
import PhotoViewer from './PhotoViewer';
import { useTranslation } from '../hooks/useTranslation';

const THUMB_SIZE = 160;
const GALLERY_PREVIEW = 2; // photos shown before "show all"

interface PlaceDetailsProps {
  place: Place;
  details?: PlaceExtraDetails | null;
  /**
   * Defer loading gallery photos until the user taps to reveal them. Use in the
   * Discover deck preview so passed-over cards never fire photo requests.
   */
  lazyGallery?: boolean;
}

export default function PlaceDetails({ place, details, lazyGallery = false }: PlaceDetailsProps) {
  const { t, tCount } = useTranslation();
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  // When lazy, images (and their photo requests) are held back until revealed
  const [galleryRevealed, setGalleryRevealed] = useState(!lazyGallery);

  const visiblePhotos = galleryExpanded ? place.gallery : place.gallery.slice(0, GALLERY_PREVIEW);
  const hasMore = place.gallery.length > GALLERY_PREVIEW && !galleryExpanded;

  const openPhoto = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${place.name}, ${place.address}`);
    const url = Platform.select({
      ios: `maps://?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url!);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(place.address);
  };

  const handleWebsite = () => {
    const url = details?.websiteUri ?? `https://www.google.com/search?q=${encodeURIComponent(place.name)}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`;
    await Share.share({
      title: place.name,
      message: `${place.name}\n${place.address}\n${mapsUrl}`,
      url: mapsUrl,
    });
  };

  return (
    <View style={styles.container}>
      {/* Gallery */}
      {place.gallery.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('place.gallery')}</Text>
          <Rule faint />
          {!galleryRevealed ? (
            <Pressable onPress={() => setGalleryRevealed(true)} style={styles.showAllBtn}>
              <Text style={styles.showAllText}>
                {tCount('place.showPhotos', place.gallery.length)}
              </Text>
            </Pressable>
          ) : (
            <>
              <PhotoViewer
                photos={place.gallery}
                initialIndex={viewerIndex}
                visible={viewerVisible}
                onClose={() => setViewerVisible(false)}
              />
              {visiblePhotos.length > 2 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  contentContainerStyle={styles.galleryScroll}
                  style={styles.galleryScrollView}
                >
                  {visiblePhotos.map((uri, i) => (
                    <Pressable key={i} onPress={() => openPhoto(i)}>
                      <Image
                        source={{ uri }}
                        style={styles.galleryThumb}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        recyclingKey={uri}
                        priority="low"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.gallery}>
                  {visiblePhotos.map((uri, i) => (
                    <Pressable key={i} onPress={() => openPhoto(i)} style={styles.galleryItem}>
                      <Image
                        source={{ uri }}
                        style={styles.galleryImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        recyclingKey={uri}
                        priority="low"
                      />
                    </Pressable>
                  ))}
                </View>
              )}
              {hasMore && (
                <Pressable onPress={() => setGalleryExpanded(true)} style={styles.showAllBtn}>
                  <Text style={styles.showAllText}>{t('place.showAll', { count: place.gallery.length })}</Text>
                </Pressable>
              )}
            </>
          )}
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
          {details?.nationalPhoneNumber && (
            <View style={styles.detailCellFull}>
              <Text style={styles.detailLabel}>{t('place.phone')}</Text>
              <Pressable onPress={() => Linking.openURL(`tel:${details.nationalPhoneNumber}`)}>
                <Text style={[styles.detailValue, styles.link]}>{details.nationalPhoneNumber}</Text>
              </Pressable>
            </View>
          )}
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

        {/* Map preview */}
        {place.lat !== 0 && place.lng !== 0 && (
          <Pressable onPress={handleOpenMaps} style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: place.lat,
                longitude: place.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              liteMode
              pointerEvents="none"
            >
              <Marker coordinate={{ latitude: place.lat, longitude: place.lng }} />
            </MapView>
          </Pressable>
        )}

        <Text style={styles.addressText}>{place.address}</Text>
        <View style={styles.locationButtons}>
          <Pressable onPress={handleOpenMaps} style={styles.locationBtn}>
            <Text style={styles.locationBtnText}>{t('place.openMaps')}</Text>
          </Pressable>
          <Pressable onPress={handleCopy} style={styles.locationBtn}>
            <Text style={styles.locationBtnText}>{t('place.copy')}</Text>
          </Pressable>
          <Pressable onPress={handleWebsite} style={styles.locationBtn}>
            <Text style={styles.locationBtnText}>{t('place.website')}</Text>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.locationBtn}>
            <Text style={styles.locationBtnText}>{t('place.share')}</Text>
          </Pressable>
        </View>
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
  gallery: {
    flexDirection: 'row',
    gap: 8,
  },
  galleryItem: {
    flex: 1,
  },
  galleryImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 18,
  },
  galleryScrollView: {
    marginHorizontal: -SCREEN_PADDING,
  },
  galleryScroll: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 8,
  },
  galleryThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 18,
  },
  showAllBtn: {
    borderWidth: 1.5,
    borderColor: INK,
    paddingVertical: 10,
    alignItems: 'center',
  },
  showAllText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: INK,
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
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mapContainer: {
    height: 160,
    overflow: 'hidden',
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: INK,
  },
  map: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    color: INK,
  },
  locationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationBtn: {
    borderWidth: 1.5,
    borderColor: INK,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: INK,
  },
});
