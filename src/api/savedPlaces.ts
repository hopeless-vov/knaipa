import { supabase } from './supabase';
import { Place, SavedPlace } from '../types';

const TABLE = 'saved_places';

interface SavedRow {
  place_id: string;
  place_data: Place;
  visited: boolean;
  saved_at: string;
}

/** Fetches a user's saved places from Supabase (place snapshot stored as JSONB). */
export async function fetchRemoteSaved(userId: string): Promise<SavedPlace[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('place_id, place_data, visited, saved_at')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: SavedRow) => ({
    ...row.place_data,
    visited: row.visited,
    savedAt: row.saved_at,
  }));
}

/** Upserts a saved place (snapshot + visited + savedAt) for a user. */
export async function pushSave(
  userId: string,
  place: Place,
  savedAt: string,
  visited: boolean
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      place_id: place.id,
      place_data: place,
      visited,
      saved_at: savedAt,
    },
    { onConflict: 'user_id,place_id' }
  );

  if (error) throw new Error(error.message);
}

/** Removes a saved place for a user. */
export async function pushUnsave(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) throw new Error(error.message);
}

/** Updates the visited flag of a saved place for a user. */
export async function pushVisited(
  userId: string,
  placeId: string,
  visited: boolean
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ visited })
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) throw new Error(error.message);
}
