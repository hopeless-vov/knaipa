import { useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { autocompletePlaces, fetchPlaceLocation } from '../api/googlePlaces';
import { AutocompleteSuggestion, Filters } from '../types';
import { useAppStore } from '../store/useAppStore';
import { generateUUID } from '../utils/uuid';
import { useTranslation } from './useTranslation';

export function useLocationInput(updateLocal: (updates: Partial<Filters>) => void) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef(new Map<string, AutocompleteSuggestion[]>());
  // Session token groups all autocomplete keystrokes + final Place Details into one free billing session
  const sessionTokenRef = useRef<string>(generateUUID());
  const setUserLocation = useAppStore((s) => s.setUserLocation);
  const language = useAppStore((s) => s.preferences.language);
  const { t } = useTranslation();

  const resetSessionToken = useCallback(() => {
    sessionTokenRef.current = generateUUID();
  }, []);

  const onLocationChange = useCallback((text: string) => {
    updateLocal({ locText: text });
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setSuggestions([]);
      resetSessionToken(); // input cleared — start fresh session
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const key = text.trim().toLowerCase();

      if (cacheRef.current.has(key)) {
        setSuggestions(cacheRef.current.get(key)!);
        return;
      }

      const results = await autocompletePlaces(text, sessionTokenRef.current, language);
      cacheRef.current.set(key, results);
      if (cacheRef.current.size > 50) cacheRef.current.clear();
      setSuggestions(results);
    }, 350);
  }, [updateLocal, resetSessionToken, language]);

  const onSelectSuggestion = useCallback(async (suggestion: AutocompleteSuggestion) => {
    updateLocal({ locText: suggestion.text });
    setSuggestions([]);
    setError(null);
    // Pass same session token — this closes the billing session (autocomplete becomes free)
    const loc = await fetchPlaceLocation(suggestion.placeId, sessionTokenRef.current);
    if (loc) setUserLocation(loc);
    else setError(t('filters.locationLookupFailed'));
    resetSessionToken(); // session closed — generate new token for next search
  }, [updateLocal, setUserLocation, resetSessionToken, t]);

  const onCurrentLocation = useCallback(async () => {
    setSuggestions([]);
    setError(null);
    resetSessionToken(); // GPS used instead of suggestion — close session
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError(t('filters.locationDenied'));
      return;
    }
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result) {
        const parts = [result.street, result.postalCode, result.city].filter(Boolean);
        updateLocal({ locText: parts.join(', ') });
      } else {
        updateLocal({ locText: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
      }
    } catch {
      setError(t('filters.locationUnavailable'));
    }
  }, [updateLocal, setUserLocation, resetSessionToken, t]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, error, onLocationChange, onSelectSuggestion, onCurrentLocation, clearSuggestions };
}
