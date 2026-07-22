import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PAPER, BLACK, OVERLAY } from '../utils/theme';
import { useTranslation } from '../hooks/useTranslation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoViewerProps {
  photos: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

export default function PhotoViewer({ photos, initialIndex, visible, onClose }: PhotoViewerProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const listRef = useRef<FlatList<string>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollX = useRef(new Animated.Value(initialIndex * SCREEN_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      const offset = initialIndex * SCREEN_WIDTH;
      scrollX.setValue(offset);
      setCurrentIndex(initialIndex);
      setTimeout(() => {
        listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 0);
    }
  }, [visible, initialIndex]);

  const renderItem = ({ item }: ListRenderItemInfo<string>) => (
    <View style={styles.page}>
      <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
          renderItem={renderItem}
          keyExtractor={(_, i) => String(i)}
        />

        {/* Counter top-left */}
        <View
          style={[styles.counter, { top: insets.top + 16 }]}
          accessibilityRole="text"
          accessibilityLabel={t('a11y.photoCounter', {
            index: currentIndex + 1,
            total: photos.length,
          })}
        >
          <Text style={styles.counterText}>
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>

        {/* Close button top-right */}
        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.close')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* Dot indicators — driven directly by scrollX, no delay */}
        {photos.length > 1 && (
          <View style={[styles.dots, { bottom: insets.bottom + 24 }]}>
            {photos.map((_, i) => {
              const inputRange = [
                (i - 1) * SCREEN_WIDTH,
                i * SCREEN_WIDTH,
                (i + 1) * SCREEN_WIDTH,
              ];
              const width = scrollX.interpolate({
                inputRange,
                outputRange: [5, 16, 5],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.35, 1, 0.35],
                extrapolate: 'clamp',
              });
              return <Animated.View key={i} style={[styles.dot, { width, opacity }]} />;
            })}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLACK,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  counter: {
    position: 'absolute',
    left: 20,
    backgroundColor: OVERLAY,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: PAPER,
    letterSpacing: 1,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OVERLAY,
  },
  closeBtnText: {
    fontSize: 16,
    color: PAPER,
    fontWeight: '700',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    backgroundColor: PAPER,
  },
});
