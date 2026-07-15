import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getLastKnownPositionAsync: jest.fn(async () => ({ coords: { latitude: 50.4, longitude: 30.5 } })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 50.4, longitude: 30.5 } })),
  Accuracy: { Balanced: 3 },
}));

jest.mock('../api/googlePlaces', () => ({
  fetchNearbyPlaces: jest.fn(async () => ({ places: [], nextPageToken: null })),
}));

import * as Location from 'expo-location';
import * as api from '../api/googlePlaces';
import { useDiscover } from '../hooks/useDiscover';
import { useAppStore, DEFAULT_FILTERS } from '../store/useAppStore';
import { MOCK_PLACES } from './fixtures/places';

const fetchMock = api.fetchNearbyPlaces as jest.Mock;

function reset(locationEnabled: boolean) {
  useAppStore.setState({
    userLocation: null,
    deck: [],
    filters: { ...DEFAULT_FILTERS },
    preferences: {
      distanceUnit: 'km',
      language: 'en',
      notifications: { push: true, email: false, location: locationEnabled },
    },
  });
}

beforeEach(() => jest.clearAllMocks());

describe('useDiscover GPS bootstrap', () => {
  it('resolves GPS on mount when location services are enabled', async () => {
    reset(true);
    renderHook(() => useDiscover());
    await waitFor(() => expect(useAppStore.getState().userLocation).toEqual({ lat: 50.4, lng: 30.5 }));
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('falls back to getCurrentPositionAsync when no last-known position', async () => {
    reset(true);
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValueOnce(null);
    renderHook(() => useDiscover());
    await waitFor(() => expect(useAppStore.getState().userLocation).toEqual({ lat: 50.4, lng: 30.5 }));
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
  });

  it('skips GPS entirely when location services are disabled', async () => {
    reset(false);
    renderHook(() => useDiscover());
    await waitFor(() => {}); // let the mount effect settle
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(useAppStore.getState().userLocation).toBeNull();
  });

  it('marks location denied when permission is refused', async () => {
    reset(true);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const { result } = renderHook(() => useDiscover());
    await waitFor(() => expect(result.current.locationDenied).toBe(true));
    expect(result.current.hasLocation).toBe(false);
  });

  it('requestLocation re-resolves GPS on demand', async () => {
    reset(true);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const { result } = renderHook(() => useDiscover());
    await waitFor(() => expect(result.current.locationDenied).toBe(true));

    await act(async () => {
      await result.current.requestLocation();
    });
    expect(result.current.locationDenied).toBe(false);
    expect(useAppStore.getState().userLocation).toEqual({ lat: 50.4, lng: 30.5 });
  });

  it('requestLocation keeps denied when permission stays refused', async () => {
    reset(true);
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { result } = renderHook(() => useDiscover());
    await waitFor(() => expect(result.current.locationDenied).toBe(true));
    await act(async () => {
      await result.current.requestLocation();
    });
    expect(result.current.locationDenied).toBe(true);
  });

  it('auto-fetches the next page when few cards remain after mount', async () => {
    reset(false); // location off → mount settles fast, isMounted becomes true
    renderHook(() => useDiscover());
    await waitFor(() => {});
    fetchMock.mockClear();
    fetchMock.mockResolvedValue({ places: [], nextPageToken: null });

    await act(async () => {
      useAppStore.setState({
        deck: [MOCK_PLACES[0], MOCK_PLACES[1]],
        nextPageToken: 'TKN',
        userLocation: { lat: 1, lng: 1 },
        isLoading: false,
        isLoadingMore: false,
      });
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });
});
