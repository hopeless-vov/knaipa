# kutok

A Tinder-like place discovery app. Users swipe right (like) or left (pass) on places — museums, parks, cafés, and more. Liked places go to a personal "Saved" collection with visited/pending tracking, city grouping, list and map views.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 54, blank TypeScript template) |
| Navigation | React Navigation v7 (native-stack + bottom-tabs) |
| State | Zustand |
| Backend | Supabase (auth + database) |
| Maps | react-native-maps + expo-location |
| Gestures | react-native-gesture-handler |
| Animations | react-native-reanimated v4 |
| Images | expo-image (memory-disk cache) |
| Gradients | expo-linear-gradient |
| Icons | @expo/vector-icons (Feather) |
| Testing | Jest 29 + ts-jest + @testing-library/react-hooks |

---

## Project Structure

```
kutok/
├── App.tsx                  # Root: SafeAreaProvider + NavigationContainer
├── index.ts                 # Expo entry point
├── docs/
│   └── google-place-api.md  # Google Places API reference — read before touching api/googlePlaces.ts
├── src/
│   ├── types/
│   │   ├── index.ts         # Re-exports all domain types
│   │   ├── place.ts         # Place, SavedPlace, SwipeHistoryEntry
│   │   ├── filters.ts       # Filters
│   │   ├── user.ts          # User, UserPreferences
│   │   ├── navigation.ts    # RootStackParamList, TabParamList
│   │   └── googleApi.ts     # Raw Google Places API response shapes, AutocompleteSuggestion
│   ├── utils/
│   │   ├── theme.ts         # INK, PAPER, PAPER2, MUTED, RED, HAIR constants
│   │   ├── formatters.ts    # padIndex(), getSubcategory(), formatHours()
│   │   ├── geo.ts           # haversineDistance(), formatDistance()
│   │   ├── placeFilters.ts  # applyPostFetchFilters() — client-side filters
│   │   ├── places.ts        # category/radius/price maps, isOpenEvening()
│   │   └── validation.ts    # isValidEmail(), validateSignIn(), validateSignUp()
│   ├── config/
│   │   └── googlePlaces.ts  # API key, endpoint URLs, FIELD_MASK constants
│   ├── mappers/
│   │   ├── googlePlaces.ts  # buildRequestBody(), mapGooglePlace()
│   │   └── user.ts          # mapSupabaseUser() — session user → User
│   ├── api/
│   │   ├── googlePlaces.ts  # fetchNearbyPlaces, autocompletePlaces, fetchPlaceLocation
│   │   ├── savedPlaces.ts   # fetchSavedPlaces, savePlace, unsavePlace, toggleVisited
│   │   └── supabase.ts      # Supabase client (SecureStore-persisted session)
│   ├── store/
│   │   └── useAppStore.ts   # Single Zustand store; DEFAULT_FILTERS
│   ├── hooks/
│   │   ├── useDiscover.ts   # Deck logic: like, pass, undo, reset, auto-fetch
│   │   ├── useSaved.ts      # Tab filtering + city grouping
│   │   ├── useAuth.ts       # signIn, signUp, signOut, sendPasswordReset (validate first, return success)
│   │   ├── useAuthSession.ts # Session restore on launch + auth state subscription
│   │   ├── useFilters.ts    # Local filter state + applyFilters()
│   │   ├── useFindPlace.ts  # Look up a place by id from fetched pool
│   │   ├── usePlaceDetails.ts # Lazy Place Details (phone/website), cached
│   │   └── useLocationInput.ts  # Location text input, autocomplete, GPS
│   ├── ui/                  # Logic-free primitives
│   │   ├── Button.tsx
│   │   ├── Chip.tsx
│   │   ├── ChipGroup.tsx
│   │   ├── TextInput.tsx
│   │   ├── Toggle.tsx
│   │   ├── Rule.tsx
│   │   ├── Tag.tsx
│   │   ├── Wordmark.tsx
│   │   └── SegmentedControl.tsx
│   ├── components/          # Composite components (may use hooks)
│   │   ├── PlaceCover.tsx   # Image card with gradient, rating pill, counter
│   │   ├── PlaceDetails.tsx # About, gallery, details grid, highlights, location
│   │   ├── SwipeCard.tsx    # Pan gesture + LIKE/PASS stamps
│   │   ├── BottomNav.tsx    # Custom tab bar
│   │   ├── SavedRow.tsx     # Horizontal row for saved list
│   │   ├── SplashView.tsx   # Branded splash shown while session restores
│   │   ├── LegalScreen.tsx  # Shared layout for Privacy/Terms content
│   │   └── MapMarker.tsx    # Diamond pin for map view
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── ForgotScreen.tsx
│   │   ├── DiscoverScreen.tsx
│   │   ├── PlaceDetailScreen.tsx
│   │   ├── FiltersScreen.tsx
│   │   ├── SavedScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── PrivacyScreen.tsx
│   │   └── TermsScreen.tsx
│   ├── __tests__/           # All test files — never next to source
│   │   ├── fixtures/
│   │   │   └── places.ts    # MOCK_PLACES shared test data
│   │   ├── useDiscover.test.ts
│   │   ├── useSaved.test.ts
│   │   ├── useAuth.test.ts
│   │   ├── useAuthSession.test.ts
│   │   ├── validation.test.ts
│   │   ├── userMapper.test.ts
│   │   └── formatters.test.ts
│   └── navigation/
│       └── RootNavigator.tsx  # Auth-gated stacks: splash → login stack or main tabs
├── __mocks__/               # Jest mocks for native modules
└── jest.config.js
```

### Architecture rules

- `ui/` — presentational only; no stores, no hooks; props in, renders out
- `components/` — composite; may use hooks; wires ui/ with logic
- `screens/` — route-level; composed from components
- `hooks/` — all business logic
- `store/` — Zustand store; may import from api/ directly
- `api/` — API calls only; no React, no hooks, no state; never imported directly by screens/components
- `types/` — all TypeScript types; never define types in source files

---

## Environment Setup

Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

Expo reads variables prefixed with `EXPO_PUBLIC_` automatically at build time.

---

## Running the App

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in browser (limited — no maps/gestures)
npm run web
```

---

## Running Tests

```bash
npm test

# Run a specific file
npx jest src/utils/formatters.test.ts
```

All test files live in `src/__tests__/`. Shared mock data is in `src/__tests__/fixtures/places.ts`.

---

## Production Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in
eas login

# Configure (first time)
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

---

## Supabase Schema

Run these migrations in the Supabase SQL editor:

```sql
-- User profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text not null,
  created_at timestamptz default now()
);

-- Places catalogue
create table places (
  id text primary key,
  name text,
  category text,
  cover text,
  gallery text[],
  distance text,
  about text,
  hours text,
  price text,
  rating text,
  type text,
  highlights text[],
  address text,
  city text,
  neighborhood text,
  lat float8,
  lng float8
);

-- User saved places
create table saved_places (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  place_id text references places(id),
  visited boolean default false,
  saved_at timestamptz default now()
);
```

Enable Row Level Security and add policies so users can only read/write their own rows.

---

## Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps SDK for iOS**, **Maps SDK for Android**, and **Places API (New)**
3. Create an API key and add it to `.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
4. For iOS, add the key to `app.json` under `expo.ios.config.googleMapsApiKey`
5. For Android, add it under `expo.android.config.googleMaps.apiKey`

> **Before making any changes to `src/api/googlePlaces.ts`**, read `docs/google-place-api.md`.
> It covers the `searchText` endpoint, supported parameters, field masks, pagination rules, and known limitations.

---

## Design System

| Token | Value |
|---|---|
| INK | `#0A0A0A` |
| PAPER | `#FFFFFF` |
| PAPER2 | `#FAFAF8` |
| MUTED | `#8A8A88` |
| RED | `#E2342B` |
| HAIR | `rgba(10,10,10,0.12)` |
| SCREEN_PADDING | `24` |

- Sharp corners: `borderRadius: 0` everywhere
- Borders: `1.5px solid #0A0A0A`
- Buttons: uppercase text, `fontWeight: '800'`, `letterSpacing: 1.2`
- No inline styles — always `StyleSheet.create()`
- No arbitrary color values — always use theme constants

## Google Places API
See `docs/google-place-api.md` for endpoint reference, field masks, and known limitations.