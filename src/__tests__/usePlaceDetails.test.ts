import { renderHook, waitFor } from '@testing-library/react-native';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import * as api from '../api/googlePlaces';

jest.mock('../api/googlePlaces');
const fetchMock = api.fetchPlaceDetails as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('usePlaceDetails', () => {
  it('fetches details on a cache miss and exposes them', async () => {
    fetchMock.mockResolvedValueOnce({ websiteUri: 'https://x.example', nationalPhoneNumber: '123' });
    const { result } = renderHook(() => usePlaceDetails('miss-1'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.details?.websiteUri).toBe('https://x.example');
    expect(fetchMock).toHaveBeenCalledWith('miss-1');
  });

  it('serves from the module cache on the second mount (no refetch)', async () => {
    fetchMock.mockResolvedValueOnce({ websiteUri: 'https://cached.example' });
    const first = renderHook(() => usePlaceDetails('cache-1'));
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));
    fetchMock.mockClear();

    const second = renderHook(() => usePlaceDetails('cache-1'));
    expect(second.result.current.isLoading).toBe(false);
    expect(second.result.current.details?.websiteUri).toBe('https://cached.example');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('handles a null result without caching', async () => {
    fetchMock.mockResolvedValueOnce(null);
    const { result } = renderHook(() => usePlaceDetails('null-1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.details).toBeNull();
  });
});
