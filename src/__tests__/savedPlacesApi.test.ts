import {
  fetchRemoteSaved,
  pushSave,
  pushUnsave,
  pushVisited,
} from '../api/savedPlaces';
import { MOCK_PLACES } from './fixtures/places';

jest.mock('../api/supabase', () => {
  const state = { result: { data: [], error: null } as { data: unknown; error: unknown } };
  const builder: Record<string, unknown> = {};
  ['select', 'upsert', 'delete', 'update', 'eq', 'order'].forEach((m) => {
    builder[m] = jest.fn(() => builder);
  });
  // Thenable so `await <chain>` resolves to the configured result
  builder.then = (resolve: (v: unknown) => void) => resolve(state.result);
  return {
    supabase: { from: jest.fn(() => builder) },
    __state: state,
    __builder: builder,
  };
});

 
const supaMock = require('../api/supabase');
const state = supaMock.__state as { result: { data: unknown; error: unknown } };
const builder = supaMock.__builder as Record<string, jest.Mock>;
const fromMock = supaMock.supabase.from as jest.Mock;

const [p1] = MOCK_PLACES;

beforeEach(() => {
  jest.clearAllMocks();
  state.result = { data: [], error: null };
});

describe('fetchRemoteSaved', () => {
  it('flattens rows into SavedPlace objects', async () => {
    state.result = {
      data: [{ place_id: p1.id, place_data: p1, visited: true, saved_at: '2025-05-01' }],
      error: null,
    };
    const saved = await fetchRemoteSaved('user-1');
    expect(saved).toEqual([{ ...p1, visited: true, savedAt: '2025-05-01' }]);
    expect(fromMock).toHaveBeenCalledWith('saved_places');
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('returns [] when data is null', async () => {
    state.result = { data: null, error: null };
    expect(await fetchRemoteSaved('user-1')).toEqual([]);
  });

  it('throws on error', async () => {
    state.result = { data: null, error: { message: 'boom' } };
    await expect(fetchRemoteSaved('user-1')).rejects.toThrow('boom');
  });
});

describe('pushSave', () => {
  it('upserts the place snapshot with conflict target', async () => {
    await pushSave('user-1', p1, '2025-05-01', false);
    expect(builder.upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', place_id: p1.id, place_data: p1, visited: false, saved_at: '2025-05-01' },
      { onConflict: 'user_id,place_id' }
    );
  });

  it('throws on error', async () => {
    state.result = { data: null, error: { message: 'dup' } };
    await expect(pushSave('user-1', p1, '2025-05-01', false)).rejects.toThrow('dup');
  });
});

describe('pushUnsave', () => {
  it('deletes by user + place', async () => {
    await pushUnsave('user-1', p1.id);
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(builder.eq).toHaveBeenCalledWith('place_id', p1.id);
  });

  it('throws on error', async () => {
    state.result = { data: null, error: { message: 'nope' } };
    await expect(pushUnsave('user-1', p1.id)).rejects.toThrow('nope');
  });
});

describe('pushVisited', () => {
  it('updates the visited flag', async () => {
    await pushVisited('user-1', p1.id, true);
    expect(builder.update).toHaveBeenCalledWith({ visited: true });
  });

  it('throws on error', async () => {
    state.result = { data: null, error: { message: 'fail' } };
    await expect(pushVisited('user-1', p1.id, false)).rejects.toThrow('fail');
  });
});
