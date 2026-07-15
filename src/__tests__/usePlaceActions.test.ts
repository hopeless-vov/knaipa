import { Linking, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { renderHook } from '@testing-library/react-native';
import { usePlaceActions } from '../hooks/usePlaceActions';
import { MOCK_PLACES } from './fixtures/places';

const place = MOCK_PLACES[0];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePlaceActions', () => {
  it('openMaps opens the native maps deep link', () => {
    const { result } = renderHook(() => usePlaceActions(place, null));
    result.current.openMaps();
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('maps://?q='));
  });

  it('copyAddress copies the address', () => {
    const { result } = renderHook(() => usePlaceActions(place, null));
    result.current.copyAddress();
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith(place.address);
  });

  it('openWebsite uses the details website when present', () => {
    const { result } = renderHook(() => usePlaceActions(place, { websiteUri: 'https://w.example' }));
    result.current.openWebsite();
    expect(Linking.openURL).toHaveBeenCalledWith('https://w.example');
  });

  it('share opens the share sheet with a payload', () => {
    const { result } = renderHook(() => usePlaceActions(place, null));
    result.current.share();
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({ title: place.name })
    );
  });
});
