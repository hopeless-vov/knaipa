import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAppStore, DEFAULT_FILTERS, FILTERS_KEY } from '../store/useAppStore';
import { Filters } from '../types';

export function useFilters() {
  const storeFilters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);

  const [localFilters, setLocalFilters] = useState<Filters>({ ...storeFilters });

  const updateLocal = (updates: Partial<Filters>) => {
    setLocalFilters((prev) => ({ ...prev, ...updates }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
    SecureStore.setItemAsync(FILTERS_KEY, JSON.stringify(localFilters)).catch(() => {});
  };

  const resetFilters = () => {
    setLocalFilters({ ...DEFAULT_FILTERS });
    setFilters(DEFAULT_FILTERS);
    SecureStore.deleteItemAsync(FILTERS_KEY).catch(() => {});
  };

  return {
    localFilters,
    updateLocal,
    applyFilters,
    resetFilters,
  };
}
