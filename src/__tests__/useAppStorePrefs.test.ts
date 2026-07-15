import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/useAppStore';
import { MOCK_PLACES } from './fixtures/places';

const PREFS_KEY = '@knaipa/preferences';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  useAppStore.setState({
    preferences: {
      distanceUnit: 'km',
      language: 'en',
      notifications: { push: true, email: false, location: true },
    },
    deck: [...MOCK_PLACES],
    allFetchedPlaces: [...MOCK_PLACES],
  });
});

describe('setPreference', () => {
  it('persists preferences to storage', async () => {
    useAppStore.getState().setPreference('language', 'uk');
    await Promise.resolve();
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    expect(raw && JSON.parse(raw).language).toBe('uk');
  });

  it('reformats loaded deck distances when the unit changes', () => {
    // place-1 = 500 m
    expect(useAppStore.getState().deck[0].distance).toBe('0.5 km');
    useAppStore.getState().setPreference('distanceUnit', 'mi');
    const d = useAppStore.getState().deck[0].distance;
    expect(d).toMatch(/ft|mi/);
    expect(d).not.toContain('km');
    // raw meters are untouched
    expect(useAppStore.getState().deck[0].distanceMeters).toBe(500);
  });

  it('updates nested notification preferences', () => {
    useAppStore.getState().setPreference('notifications', {
      push: false,
      email: true,
      location: false,
    });
    expect(useAppStore.getState().preferences.notifications.location).toBe(false);
  });
});

describe('hydratePreferences', () => {
  it('merges persisted preferences over defaults', async () => {
    await AsyncStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ distanceUnit: 'mi', language: 'uk' })
    );
    await useAppStore.getState().hydratePreferences();
    const prefs = useAppStore.getState().preferences;
    expect(prefs.distanceUnit).toBe('mi');
    expect(prefs.language).toBe('uk');
    // untouched keys keep their defaults
    expect(prefs.notifications).toBeDefined();
  });

  it('leaves defaults when nothing is stored', async () => {
    await useAppStore.getState().hydratePreferences();
    expect(useAppStore.getState().preferences.distanceUnit).toBe('km');
  });
});
