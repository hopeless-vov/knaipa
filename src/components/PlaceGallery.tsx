import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { SCREEN_PADDING } from '../utils/theme';
import Button from '../ui/Button';
import PhotoViewer from './PhotoViewer';
import { useTranslation } from '../hooks/useTranslation';

const THUMB_SIZE = 160;
const GALLERY_PREVIEW = 2; // photos shown before "show all"

interface PlaceGalleryProps {
  photos: string[];
  /**
   * Defer loading gallery photos until the user taps to reveal them. Use in the
   * Discover deck preview so passed-over cards never fire photo requests.
   */
  lazyGallery?: boolean;
}

export default function PlaceGallery({ photos, lazyGallery = false }: PlaceGalleryProps) {
  const { t, tCount } = useTranslation();
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  // When lazy, images (and their photo requests) are held back until revealed
  const [galleryRevealed, setGalleryRevealed] = useState(!lazyGallery);

  const visiblePhotos = galleryExpanded ? photos : photos.slice(0, GALLERY_PREVIEW);
  const hasMore = photos.length > GALLERY_PREVIEW && !galleryExpanded;

  const openPhoto = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  if (!galleryRevealed) {
    return (
      <Button
        label={tCount('place.showPhotos', photos.length)}
        onPress={() => setGalleryRevealed(true)}
        variant="outline"
        size="sm"
        full
      />
    );
  }

  return (
    <>
      <PhotoViewer
        photos={photos}
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
        <Button
          label={t('place.showAll', { count: photos.length })}
          onPress={() => setGalleryExpanded(true)}
          variant="outline"
          size="sm"
          full
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
});
