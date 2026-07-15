import {
  fetchNearbyPlaces,
  fetchPlaceLocation,
  fetchPlaceDetails,
  autocompletePlaces,
} from '../api/googlePlaces';
import { DEFAULT_FILTERS } from '../store/useAppStore';
import { Filters } from '../types';

const SEARCH_FILTERS: Filters = { ...DEFAULT_FILTERS, mode: 'search' };
const BROWSE_FILTERS: Filters = { ...DEFAULT_FILTERS, mode: 'browse' };

const okJson = (body: unknown) => ({ ok: true, json: async () => body, text: async () => '' });
const errRes = (status = 500) => ({ ok: false, status, json: async () => ({}), text: async () => 'err' });

const fetchMock = jest.fn();
global.fetch = fetchMock as unknown as typeof fetch;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Date.prototype, 'getDay').mockReturnValue(1);
});
afterEach(() => jest.restoreAllMocks());

describe('fetchNearbyPlaces', () => {
  const near = { id: 'near', location: { latitude: 50.45, longitude: 30.52 }, displayName: { text: 'Near' }, types: [] };
  const far = { id: 'far', location: { latitude: 51.5, longitude: -0.1 }, displayName: { text: 'Far' }, types: [] };

  it('SEARCH mode: hits searchText, maps results and keeps the page token', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ places: [near, far], nextPageToken: 'TKN' }));
    const { places, nextPageToken } = await fetchNearbyPlaces(50.45, 30.52, SEARCH_FILTERS);
    expect(fetchMock.mock.calls[0][0]).toContain(':searchText');
    expect(places.map((p) => p.id)).toEqual(['near']); // far one filtered out by radius
    expect(nextPageToken).toBe('TKN');
  });

  it('BROWSE mode: hits searchNearby and never returns a page token', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ places: [near], nextPageToken: 'TKN' }));
    const { places, nextPageToken } = await fetchNearbyPlaces(50.45, 30.52, BROWSE_FILTERS);
    expect(fetchMock.mock.calls[0][0]).toContain(':searchNearby');
    expect(places.map((p) => p.id)).toEqual(['near']);
    expect(nextPageToken).toBeNull(); // searchNearby has no pagination
  });

  it('returns null nextPageToken when absent', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ places: [] }));
    const { nextPageToken } = await fetchNearbyPlaces(50.45, 30.52, SEARCH_FILTERS);
    expect(nextPageToken).toBeNull();
  });

  it('throws on a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(errRes(429));
    await expect(fetchNearbyPlaces(50.45, 30.52, SEARCH_FILTERS)).rejects.toThrow(/429/);
  });
});

describe('fetchPlaceLocation', () => {
  it('returns coordinates on success', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ location: { latitude: 1, longitude: 2 } }));
    expect(await fetchPlaceLocation('pid')).toEqual({ lat: 1, lng: 2 });
  });

  it('includes the session token in the URL when given', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ location: { latitude: 1, longitude: 2 } }));
    await fetchPlaceLocation('pid', 'sess-123');
    expect(fetchMock.mock.calls[0][0]).toContain('sessionToken=sess-123');
  });

  it('returns null on a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(errRes());
    expect(await fetchPlaceLocation('pid')).toBeNull();
  });

  it('returns null when coordinates are missing', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ location: {} }));
    expect(await fetchPlaceLocation('pid')).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'));
    expect(await fetchPlaceLocation('pid')).toBeNull();
  });
});

describe('fetchPlaceDetails', () => {
  it('maps website and phone', async () => {
    fetchMock.mockResolvedValueOnce(okJson({ websiteUri: 'https://x.com', nationalPhoneNumber: '044 123' }));
    expect(await fetchPlaceDetails('pid')).toEqual({
      websiteUri: 'https://x.com',
      nationalPhoneNumber: '044 123',
    });
  });

  it('returns null on a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(errRes());
    expect(await fetchPlaceDetails('pid')).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('boom'));
    expect(await fetchPlaceDetails('pid')).toBeNull();
  });
});

describe('autocompletePlaces', () => {
  it('returns [] for empty input without calling the API', async () => {
    expect(await autocompletePlaces('   ')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps suggestions, preferring structuredFormat, and caps at 5', async () => {
    const suggestions = Array.from({ length: 7 }, (_, i) => ({
      placePrediction: {
        placeId: `id-${i}`,
        text: { text: `Full ${i}` },
        structuredFormat: { mainText: { text: `Main ${i}` }, secondaryText: { text: `Sub ${i}` } },
      },
    }));
    fetchMock.mockResolvedValueOnce(okJson({ suggestions }));
    const result = await autocompletePlaces('caf');
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ placeId: 'id-0', text: 'Full 0', mainText: 'Main 0', secondaryText: 'Sub 0' });
  });

  it('falls back to text when structuredFormat is absent and drops entries without text', async () => {
    fetchMock.mockResolvedValueOnce(
      okJson({
        suggestions: [
          { placePrediction: { placeId: 'a', text: { text: 'Alpha' } } },
          { placePrediction: { placeId: 'b' } }, // no text → dropped
        ],
      })
    );
    const result = await autocompletePlaces('al');
    expect(result).toEqual([{ placeId: 'a', text: 'Alpha', mainText: 'Alpha', secondaryText: '' }]);
  });

  it('returns [] on a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(errRes());
    expect(await autocompletePlaces('x')).toEqual([]);
  });

  it('returns [] when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'));
    expect(await autocompletePlaces('x')).toEqual([]);
  });
});
