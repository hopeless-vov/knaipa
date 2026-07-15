import type { User as SupabaseUser } from '@supabase/supabase-js';
import { mapSupabaseUser } from '../mappers/user';

const BASE_USER = {
  id: 'user-1',
  email: 'vova@example.com',
  user_metadata: { name: 'Vova' },
  created_at: '2025-01-01T00:00:00Z',
} as unknown as SupabaseUser;

describe('mapSupabaseUser', () => {
  it('maps all fields', () => {
    expect(mapSupabaseUser(BASE_USER)).toEqual({
      id: 'user-1',
      email: 'vova@example.com',
      name: 'Vova',
      createdAt: '2025-01-01T00:00:00Z',
    });
  });

  it('falls back to empty email', () => {
    const user = { ...BASE_USER, email: undefined } as unknown as SupabaseUser;
    expect(mapSupabaseUser(user).email).toBe('');
  });

  it('falls back to default name when metadata is missing', () => {
    const user = { ...BASE_USER, user_metadata: {} } as unknown as SupabaseUser;
    expect(mapSupabaseUser(user).name).toBe('User');
  });

  it('falls back to an ISO timestamp when created_at is missing', () => {
    const user = { ...BASE_USER, created_at: undefined } as unknown as SupabaseUser;
    const mapped = mapSupabaseUser(user);
    expect(new Date(mapped.createdAt).toString()).not.toBe('Invalid Date');
  });
});
