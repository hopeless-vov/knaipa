import { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SavedPlace } from '../types';

type Tab = 'all' | 'been' | 'havent';

export function useSaved() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const savedPlacesGetter = useAppStore((s) => s.savedPlaces);
  // Subscribe to reactive slices so the hook re-renders when they change
  useAppStore((s) => s.savedIds);
  useAppStore((s) => s.visitedMap);

  const all = savedPlacesGetter();

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
