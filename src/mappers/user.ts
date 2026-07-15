import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types/user';

const FALLBACK_NAME = 'User';

export function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    name: (supabaseUser.user_metadata?.name as string | undefined) ?? FALLBACK_NAME,
    createdAt: supabaseUser.created_at ?? new Date().toISOString(),
  };
}
