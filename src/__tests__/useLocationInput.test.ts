import { act, renderHook, waitFor } from '@testing-library/react-native';

import * as Location from 'expo-location';
import { useLocationInput } from '../hooks/useLocationInput';
import * as api from '../api/googlePlaces';
import { useAppStore } from '../store/useAppStore';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 50.4, longitude: 30.5 } })),
  reverseGeocodeAsync: jest.fn(async () => [{ street: 'Main St', postalCode: '01001', city: 'Kyiv' }]),
}));

jest.mock('../api/googlePlaces', () => ({
  autocompletePlaces: jest.fn(async () => [
    { placeId: 'p1', text: 'Kyiv', mainText: 'Kyiv', secondaryText: 'Ukraine' },
  ]),
  fetchPlaceLocation: jest.fn(async () => ({ lat: 50.45, lng: 30.52 })),
}));

const autocompleteMock = api.autocompletePlaces as jest.Mock;
const fetchLocMock = api.fetchPlaceLocation as jest.Mock;

let updateLocal: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  updateLocal = jest.fn();
  useAppStore.setState({ userLocation: null });
});
afterEach(() => jest.useRealTimers());

describe('useLocationInput', () => {
  it('clears suggestions when the input is emptied', () => {
    const { result } = renderHook(() => useLocationInput(updateLocal));
    act(() => result.current.onLocationChange(''));
    expect(updateLocal).toHaveBeenCalledWith({ locText: '' });
    expect(result.current.suggestions).toEqual([]);
  });

  it('debounces then fetches autocomplete suggestions, caching by query', async () => {
    const { result } = renderHook(() => useLocationInput(updateLocal));
    act(() => result.current.onLocationChange('Kyi'));
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    await waitFor(() => expect(result.current.suggestions.length).toBe(1));
    expect(autocompleteMock).toHaveBeenCalledTimes(1);

    // Same query again → served from cache, no second API call
    act(() => result.current.onLocationChange('Kyi'));
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    expect(autocompleteMock).toHaveBeenCalledTimes(1);
  });

  it('onSelectSuggestion resolves the location into the store', async () => {
    const { result } = renderHook(() => useLocationInput(updateLocal));
    await act(async () => {
      await result.current.onSelectSuggestion({ placeId: 'p1', text: 'Kyiv', mainText: 'Kyiv', secondaryText: '' });
    });
    expect(fetchLocMock).toHaveBeenCalledWith('p1', expect.any(String));
    expect(useAppStore.getState().userLocation).toEqual({ lat: 50.45, lng: 30.52 });
  });

  it('onCurrentLocation uses GPS + reverse geocode', async () => {
    const { result } = renderHook(() => useLocationInput(updateLocal));
    await act(async () => {
      await result.current.onCurrentLocation();
    });
    expect(useAppStore.getState().userLocation).toEqual({ lat: 50.4, lng: 30.5 });
    expect(updateLocal).toHaveBeenCalledWith({ locText: 'Main St, 01001, Kyiv' });
  });

  it('onCurrentLocation falls back to raw coords when reverse geocode is empty', async () => {
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValueOnce([]);
    const { result } = renderHook(() => useLocationInput(updateLocal));
    await act(async () => {
      await result.current.onCurrentLocation();
    });
    expect(updateLocal).toHaveBeenCalledWith({ locText: '50.4000, 30.5000' });
  });

  it('onCurrentLocation bails out when permission is denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const { result } = renderHook(() => useLocationInput(updateLocal));
    await act(async () => {
      await result.current.onCurrentLocation();
    });
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Location permission denied — enter a place instead.');
  });

  it('onCurrentLocation surfaces an error when GPS is unavailable', async () => {
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(new Error('no gps'));
    const { result } = renderHook(() => useLocationInput(updateLocal));
    await act(async () => {
      await result.current.onCurrentLocation();
    });
    expect(result.current.error).toBe('Could not get your location. Try again.');
  });

  it('onSelectSuggestion surfaces an error when location lookup fails', async () => {
    fetchLocMock.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useLocationInput(updateLocal));
    await act(async () => {
      await result.current.onSelectSuggestion({ placeId: 'p1', text: 'Kyiv', mainText: 'Kyiv', secondaryText: '' });
    });
    expect(result.current.error).toBe('Could not set that place. Try another.');
  });

  it('typing again clears a previous error', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const { result } = renderHook(() => useLocationInput(updateLocal));
    await act(async () => {
      await result.current.onCurrentLocation();
    });
    expect(result.current.error).not.toBeNull();
    act(() => result.current.onLocationChange('Lv'));
    expect(result.current.error).toBeNull();
  });

  it('clearSuggestions empties the list', () => {
    const { result } = renderHook(() => useLocationInput(updateLocal));
    act(() => result.current.clearSuggestions());
    expect(result.current.suggestions).toEqual([]);
  });
});
