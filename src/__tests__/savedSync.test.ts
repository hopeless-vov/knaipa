import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  queueKey,
  SyncOp,
  loadQueue,
  enqueue,
  clearQueue,
  flushQueue,
  pullAndMerge,
} from '../store/savedSync';
import * as api from '../api/savedPlaces';
import { MOCK_PLACES } from './fixtures/places';
import { buildSavedMap } from './fixtures/saved';

jest.mock('../api/savedPlaces');

const mockedApi = api as jest.Mocked<typeof api>;
const [p1, p2, p3] = MOCK_PLACES;
const U = 'user-1';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  mockedApi.pushSave.mockResolvedValue(undefined);
  mockedApi.pushUnsave.mockResolvedValue(undefined);
  mockedApi.pushVisited.mockResolvedValue(undefined);
  mockedApi.fetchRemoteSaved.mockResolvedValue([]);
});

describe('enqueue / loadQueue', () => {
  it('appends ops and persists them', async () => {
    await enqueue(U, { type: 'unsave', placeId: 'place-1' });
    await enqueue(U, { type: 'visited', placeId: 'place-2', visited: true });
    const queue = await loadQueue(U);
    expect(queue).toHaveLength(2);
    expect(queue[0]).toEqual({ type: 'unsave', placeId: 'place-1' });
  });

  it('returns [] on corrupt queue storage', async () => {
    await AsyncStorage.setItem(queueKey(U), '{bad');
    expect(await loadQueue(U)).toEqual([]);
  });

  it('scopes queues per user', async () => {
    await enqueue('user-A', { type: 'unsave', placeId: 'x' });
    expect(await loadQueue('user-B')).toEqual([]);
    expect(await loadQueue('user-A')).toHaveLength(1);
  });
});

describe('clearQueue', () => {
  it('empties a user queue', async () => {
    await enqueue(U, { type: 'unsave', placeId: 'x' });
    await clearQueue(U);
    expect(await loadQueue(U)).toEqual([]);
  });
});

describe('flushQueue', () => {
  it('runs each op against the API and empties the queue', async () => {
    await enqueue(U, { type: 'save', place: p1, savedAt: '2025-01-01', visited: false });
    await enqueue(U, { type: 'visited', placeId: p1.id, visited: true });

    await flushQueue(U);

    expect(mockedApi.pushSave).toHaveBeenCalledWith(U, p1, '2025-01-01', false);
    expect(mockedApi.pushVisited).toHaveBeenCalledWith(U, p1.id, true);
    expect(await loadQueue(U)).toEqual([]);
  });

  it('stops at the first failure and keeps the failed op + rest', async () => {
    await enqueue(U, { type: 'save', place: p1, savedAt: '2025-01-01', visited: false });
    await enqueue(U, { type: 'unsave', placeId: p2.id });
    mockedApi.pushSave.mockRejectedValueOnce(new Error('offline'));

    await flushQueue(U);

    expect(mockedApi.pushUnsave).not.toHaveBeenCalled();
    const remaining = await loadQueue(U);
    expect(remaining).toHaveLength(2);
  });

  it('does nothing on an empty queue', async () => {
    await flushQueue(U);
    expect(mockedApi.pushSave).not.toHaveBeenCalled();
  });

  it('runs an unsave op against the API', async () => {
    await enqueue(U, { type: 'unsave', placeId: p2.id });
    await flushQueue(U);
    expect(mockedApi.pushUnsave).toHaveBeenCalledWith(U, p2.id);
    expect(await loadQueue(U)).toEqual([]);
  });
});

describe('storage error handling', () => {
  it('enqueue resolves even when persistence fails', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    await expect(enqueue(U, { type: 'unsave', placeId: 'x' })).resolves.toBeDefined();
  });

  it('clearQueue swallows removal errors', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    await expect(clearQueue(U)).resolves.toBeUndefined();
  });
});

describe('pullAndMerge', () => {
  it('adds remote-only places to the merged map', async () => {
    const remote = buildSavedMap([p3]);
    mockedApi.fetchRemoteSaved.mockResolvedValueOnce(Object.values(remote));

    const merged = await pullAndMerge('user-1', {});

    expect(Object.keys(merged)).toEqual([p3.id]);
  });

  it('keeps a local place that has a pending save (local wins)', async () => {
    mockedApi.fetchRemoteSaved.mockResolvedValueOnce([]);
    const local = buildSavedMap([p1], { 'place-1': { visited: true } });
    await enqueue(U, { type: 'save', place: p1, savedAt: '2025-01-01', visited: true });

    const merged = await pullAndMerge(U, local);

    expect(merged[p1.id].visited).toBe(true);
  });

  it('drops a place that has a pending unsave even if remote still has it', async () => {
    mockedApi.fetchRemoteSaved.mockResolvedValueOnce(Object.values(buildSavedMap([p1])));
    await enqueue(U, { type: 'unsave', placeId: p1.id });

    const merged = await pullAndMerge(U, {});

    expect(merged[p1.id]).toBeUndefined();
  });

  it('prefers the local copy for a pending visited op over the remote copy', async () => {
    const remote = buildSavedMap([p1], { 'place-1': { visited: false } });
    mockedApi.fetchRemoteSaved.mockResolvedValueOnce(Object.values(remote));
    const local = buildSavedMap([p1], { 'place-1': { visited: true } });
    await enqueue(U, { type: 'visited', placeId: p1.id, visited: true });

    const merged = await pullAndMerge(U, local);

    expect(merged[p1.id].visited).toBe(true);
  });
});
