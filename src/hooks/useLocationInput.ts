import { useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { autocompletePlaces, fetchPlaceLocation } from '../api/googlePlaces';
import { AutocompleteSuggestion } from '../types';
import { useAppStore } from '../store/useAppStore';
import { Filters } from '../types';

// crypto.randomUUID() is not available in Hermes — use a Math.random UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function useLocationInput(updateLocal: (updates: Partial<Filters>) => void) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef(new Map<string, AutocompleteSuggestion[]>());
  // Session token groups all autocomplete keystrokes + final Place Details into one free billing session
  const sessionTokenRef = useRef<string>(generateUUID());
  const setUserLocation = useAppStore((s) => s.setUserLocation);

  const resetSessionToken = useCallback(() => {
    sessionTokenRef.current = generateUUID();
  }, []);

  const onLocationChange = useCallback((text: string) => {
    updateLocal({ locText: text });
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

      const results = await autocompletePlaces(text, sessionTokenRef.current);
      cacheRef.current.set(key, results);
      if (cacheRef.current.size > 50) cacheRef.current.clear();
      setSuggestions(results);
    }, 350);
  }, [updateLocal, resetSessionToken]);

  const onSelectSuggestion = useCallback(async (suggestion: AutocompleteSuggestion) => {
    updateLocal({ locText: suggestion.text });
    setSuggestions([]);
    // Pass same session token — this closes the billing session (autocomplete becomes free)
    const loc = await fetchPlaceLocation(suggestion.placeId, sessionTokenRef.current);
    if (loc) setUserLocation(loc);
    resetSessionToken(); // session closed — generate new token for next search
  }, [updateLocal, setUserLocation, resetSessionToken]);

  const onCurrentLocation = useCallback(async () => {
    setSuggestions([]);
    resetSessionToken(); // GPS used instead of suggestion — close session
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
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
      // location unavailable
    }
  }, [updateLocal, setUserLocation, resetSessionToken]);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, onLocationChange, onSelectSuggestion, onCurrentLocation, clearSuggestions };
}
