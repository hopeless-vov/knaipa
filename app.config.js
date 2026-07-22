// Dynamic Expo config — replaces app.json so the Google Maps native SDK key
// comes from .env (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) instead of being committed.
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default {
  expo: {
    name: 'knaipa',
    slug: 'knaipa',
    // Deep-link scheme — keep in sync with APP_SCHEME in src/config/links.ts.
    // Enables the password-reset email to return into the app.
    scheme: 'knaipa',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.knaipa.app',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'Knaipa uses your location to find nearby places to visit.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.knaipa.app',
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    plugins: ['expo-font', 'expo-location'],
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
