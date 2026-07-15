import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SYNC_QUEUE_KEY,
  SyncOp,
  loadQueue,
  enqueue,
  flushQueue,
  pullAndMerge,
} from '../store/savedSync';
import * as api from '../api/savedPlaces';
import { MOCK_PLACES } from './fixtures/places';
import { buildSavedMap } from './fixtures/saved';

jest.mock('../api/savedPlaces');

const mockedApi = api as jest.Mocked<typeof api>;
const [p1, p2, p3] = MOCK_PLACES;

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
    await enqueue({ type: 'unsave', placeId: 'place-1' });
    await enqueue({ type: 'visited', placeId: 'place-2', visited: true });
    const queue = await loadQueue();
    expect(queue).toHaveLength(2);
    expect(queue[0]).toEqual({ type: 'unsave', placeId: 'place-1' });
  });

  it('returns [] on corrupt queue storage', async () => {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, '{bad');
    expect(await loadQueue()).toEqual([]);
  });
});

describe('flushQueue', () => {
  it('runs each op against the API and empties the queue', async () => {
    await enqueue({ type: 'save', place: p1, savedAt: '2025-01-01', visited: false });
    await enqueue({ type: 'visited', placeId: p1.id, visited: true });

    await flushQueue('user-1');

    expect(mockedApi.pushSave).toHaveBeenCalledWith('user-1', p1, '2025-01-01', false);
    expect(mockedApi.pushVisited).toHaveBeenCalledWith('user-1', p1.id, true);
    expect(await loadQueue()).toEqual([]);
  });

  it('stops at the first failure and keeps the failed op + rest', async () => {
    await enqueue({ type: 'save', place: p1, savedAt: '2025-01-01', visited: false });
    await enqueue({ type: 'unsave', placeId: p2.id });
    mockedApi.pushSave.mockRejectedValueOnce(new Error('offline'));

    await flushQueue('user-1');

    expect(mockedApi.pushUnsave).not.toHaveBeenCalled();
    const remaining = await loadQueue();
    expect(remaining).toHaveLength(2);
  });

  it('does nothing on an empty queue', async () => {
    await flushQueue('user-1');
    expect(mockedApi.pushSave).not.toHaveBeenCalled();
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
    await enqueue({ type: 'save', place: p1, savedAt: '2025-01-01', visited: true });

    const merged = await pullAndMerge('user-1', local);

    expect(merged[p1.id].visited).toBe(true);
  });

  it('drops a place that has a pending unsave even if remote still has it', async () => {
    mockedApi.fetchRemoteSaved.mockResolvedValueOnce(Object.values(buildSavedMap([p1])));
    await enqueue({ type: 'unsave', placeId: p1.id });

    const merged = await pullAndMerge('user-1', {});

    expect(merged[p1.id]).toBeUndefined();
  });

  it('prefers the local copy for a pending visited op over the remote copy', async () => {
    const remote = buildSavedMap([p1], { 'place-1': { visited: false } });
    mockedApi.fetchRemoteSaved.mockResolvedValueOnce(Object.values(remote));
    const local = buildSavedMap([p1], { 'place-1': { visited: true } });
    await enqueue({ type: 'visited', placeId: p1.id, visited: true });

    const merged = await pullAndMerge('user-1', local);

    expect(merged[p1.id].visited).toBe(true);
  });
});
