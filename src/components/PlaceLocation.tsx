import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Place, PlaceExtraDetails } from '../types';
import { INK } from '../utils/theme';
import Button from '../ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { usePlaceActions } from '../hooks/usePlaceActions';

interface PlaceLocationProps {
  place: Place;
  details?: PlaceExtraDetails | null;
}

export default function PlaceLocation({ place, details }: PlaceLocationProps) {
  const { t } = useTranslation();
  const { openMaps, copyAddress, openWebsite, share } = usePlaceActions(place, details);

  return (
    <>
      {/* Map preview */}
      {place.lat !== 0 && place.lng !== 0 && (
        <Pressable onPress={openMaps} style={styles.mapContainer}>
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
        <Button label={t('place.openMaps')} onPress={openMaps} variant="outline" size="sm" />
        <Button label={t('place.copy')} onPress={copyAddress} variant="outline" size="sm" />
        <Button label={t('place.website')} onPress={openWebsite} variant="outline" size="sm" />
        <Button label={t('place.share')} onPress={share} variant="outline" size="sm" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
