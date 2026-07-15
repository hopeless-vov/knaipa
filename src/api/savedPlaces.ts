import { supabase } from './supabase';
import { SavedPlace } from '../types';

export async function fetchSavedPlaces(userId: string): Promise<SavedPlace[]> {
  const { data, error } = await supabase
    .from('saved_places')
    .select(`
      *,
      places (*)
    `)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: { places: Omit<SavedPlace, 'visited' | 'savedAt'>; visited: boolean; saved_at: string }) => ({
    ...row.places,
    visited: row.visited,
    savedAt: row.saved_at,
  }));
}

export async function savePlace(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_places')
    .insert({ user_id: userId, place_id: placeId });

  if (error) throw new Error(error.message);
}

export async function unsavePlace(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_places')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) throw new Error(error.message);
}

export async function toggleVisited(
  userId: string,
  placeId: string,
  visited: boolean
): Promise<void> {
  const { error } = await supabase
    .from('saved_places')
    .update({ visited })
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) throw new Error(error.message);
}
