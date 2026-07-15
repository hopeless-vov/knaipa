import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { toSavedList } from '../store/savedStorage';
import { SavedPlace } from '../types';

type Tab = 'all' | 'been' | 'havent';

export function useSaved() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  // Subscribe to the snapshot map so the hook re-renders on any saved change
  const savedPlacesById = useAppStore((s) => s.savedPlacesById);

  const all = useMemo<SavedPlace[]>(() => toSavedList(savedPlacesById), [savedPlacesById]);

  const filteredPlaces = useMemo<SavedPlace[]>(() => {
    switch (activeTab) {
      case 'been':
        return all.filter((p) => p.visited);
      case 'havent':
        return all.filter((p) => !p.visited);
      default:
        return all;
    }
  }, [all, activeTab]);

  const byCity = useMemo<Record<string, SavedPlace[]>>(() => {
    return filteredPlaces.reduce<Record<string, SavedPlace[]>>((acc, place) => {
      const city = place.city;
      if (!acc[city]) acc[city] = [];
      acc[city].push(place);
      return acc;
    }, {});
  }, [filteredPlaces]);

  const validPlaces = useMemo(
    () => filteredPlaces.filter((p) => p.lat && p.lng),
    [filteredPlaces]
  );

  return {
    activeTab,
    setActiveTab,
    filteredPlaces,
    validPlaces,
    byCity,
  };
}
