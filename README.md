# knaipa

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
| Haptics | expo-haptics |
| Images | expo-image (memory-disk cache) |
| Gradients | expo-linear-gradient |
| Icons | @expo/vector-icons (Feather) |
| Testing | Jest 29 + ts-jest + @testing-library/react-hooks |

---

## Project Structure

```
knaipa/
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
│   │   ├── geo.ts           # haversineDistance(), formatDistance(m, km|mi)
│   │   ├── profile.ts       # computeProfileStats(), memberSince(), homeCity()
│   │   ├── placeFilters.ts  # applyPostFetchFilters() (cached) + applyClientRefinements() (re-derived)
│   │   ├── filterKey.ts     # serverFilterKey() — deck cache key over server-affecting filters only
│   │   ├── places.ts        # category/radius/price maps, isOpenEvening()
│   │   ├── logger.ts        # logWarn()/logError() — single seam for failures / crash reporting
│   │   ├── haptics.ts       # hapticLike()/hapticPass() — expo-haptics wrapper
│   │   └── validation.ts    # isValidEmail(), validateSignIn(), validateSignUp()
│   ├── i18n/
│   │   ├── en.ts            # English source dictionary
│   │   ├── uk.ts            # Ukrainian dictionary
│   │   └── index.ts         # translate(), translateCount(), translateList()
│   ├── config/
│   │   ├── googlePlaces.ts  # API key, endpoint URLs, FIELD_MASK constants
│   │   └── links.ts         # APP_SCHEME + password-reset deep-link redirect
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
│   │   ├── useDiscover.ts   # Deck logic: like/pass/undo/reset, auto-fetch, browse/search mode + category/query controls
│   │   ├── useDeckLocation.ts # GPS permission/resolution, denied state, requestLocation (composed by useDiscover)
│   │   ├── useCardCrossfade.ts # Fade-swap animation when the deck's top card changes (animation-only)
│   │   ├── useSaved.ts      # Tab filtering + city grouping
│   │   ├── useAuth.ts       # signIn, signUp, signOut, sendPasswordReset (validate first, return success)
│   │   ├── useAuthSession.ts # Session restore on launch + auth state subscription
│   │   ├── useTranslation.ts # Reactive i18n: t(), tCount(), tList() bound to preferences.language
│   │   ├── useAccount.ts    # Update display name / password / email via Supabase
│   │   ├── useSavedBootstrap.ts # Hydrate saved + preferences on launch; sync on login
│   │   ├── useFilters.ts    # Local filter state + applyFilters()
│   │   ├── useFindPlace.ts  # Look up a place by id from fetched pool
│   │   ├── usePlaceDetails.ts # Lazy Place Details (phone/website), cached
│   │   ├── useLocationInput.ts  # Location text input, autocomplete, GPS
│   │   └── useFirstRunHint.ts   # One-time swipe coach hint (persisted flag)
│   ├── ui/                  # Logic-free primitives
│   │   ├── Button.tsx       # variants (outline/filled), sizes, align, loading spinner, a11y
│   │   ├── Chip.tsx
│   │   ├── ChipGroup.tsx
│   │   ├── TextInput.tsx
│   │   ├── Toggle.tsx
│   │   ├── Rule.tsx
│   │   ├── Tag.tsx
│   │   ├── Wordmark.tsx
│   │   ├── SectionLabel.tsx # Small uppercase section heading (shared)
│   │   ├── MetaLabel.tsx    # Uppercase header-meta caption (shared)
│   │   ├── SegmentedControl.tsx
│   │   └── Snackbar.tsx      # Bottom toast with a single action (Undo)
│   ├── components/          # Composite components (may use hooks)
│   │   ├── PlaceCover.tsx   # Image card with gradient, rating pill, counter
│   │   ├── PlaceDetails.tsx # Composer: gallery / details grid / highlights / location
│   │   ├── PlaceGallery.tsx # Lazy-reveal photo gallery + fullscreen viewer
│   │   ├── PlaceLocation.tsx # Map preview + address + maps/copy/website/share actions
│   │   ├── SwipeCard.tsx    # Pan gesture + LIKE/PASS stamps
│   │   ├── BottomNav.tsx    # Custom tab bar
│   │   ├── SavedRow.tsx     # Swipe-to-delete row for saved list
│   │   ├── SplashView.tsx   # Branded splash shown while session restores
│   │   ├── ErrorBoundary.tsx # Catches render errors; shows a recoverable fallback
│   │   ├── ErrorFallback.tsx # Fallback UI rendered by ErrorBoundary
│   │   ├── DiscoverSearchBar.tsx # Browse/Search toggle + category chips / query input
│   │   ├── FilterSection.tsx # Labelled chip-group row (reused across Filters)
│   │   ├── LegalScreen.tsx  # Shared layout for Privacy/Terms content
│   │   └── MapMarker.tsx    # Diamond pin for map view
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── ForgotScreen.tsx
│   │   ├── ResetPasswordScreen.tsx
│   │   ├── DiscoverScreen.tsx
│   │   ├── PlaceDetailScreen.tsx
│   │   ├── FiltersScreen.tsx
│   │   ├── SavedScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── PrivacyScreen.tsx
│   │   └── TermsScreen.tsx
│   ├── __tests__/           # All test files — never next to source (30 suites)
│   │   └── fixtures/        # MOCK_PLACES + buildSavedMap shared test data
│   └── navigation/
│       └── RootNavigator.tsx  # Auth-gated stacks: splash → login stack or main tabs
├── __mocks__/               # Jest mocks for native modules
├── app.config.js            # Expo config — Maps SDK key injected from .env
└── jest.config.js           # ts-jest + mocks + logic-layer coverage thresholds
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
npx jest formatters

# With coverage (enforces logic-layer thresholds)
npx jest --coverage
```

All test files live in `src/__tests__/`. Shared mock data is in `src/__tests__/fixtures/`.

### Linting & formatting

```bash
npm run lint          # ESLint (eslint-config-expo flat config)
npm run format        # Prettier — write
npm run format:check  # Prettier — check only
```

**Coverage policy:** the logic layers (`hooks/`, `utils/`, `store/`, `api/`, `mappers/`, `i18n/`, `config/`)
are unit-tested with enforced thresholds (~97% statements / ~99% lines actual; race guards, timeouts,
and animation-only closures are `istanbul ignore`d). Presentational components/screens keep their
extractable logic in tested hooks/utils and are verified by running the app — RN rendering is not
unit-tested here (that would require the `jest-expo` preset and native-module render mocks).

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

Run this migration in the Supabase SQL editor:

```sql
-- User saved places.
-- The full place snapshot is stored as JSONB (place_data) so the app never
-- re-fetches (and re-pays Google for) a place the user already saved.
create table saved_places (
  user_id    uuid references auth.users on delete cascade,
  place_id   text not null,
  place_data jsonb not null,
  visited    boolean default false,
  saved_at   timestamptz default now(),
  primary key (user_id, place_id)
);

-- Row Level Security: each user only sees/edits their own rows
alter table saved_places enable row level security;

create policy "own rows - select" on saved_places
  for select using (auth.uid() = user_id);
create policy "own rows - insert" on saved_places
  for insert with check (auth.uid() = user_id);
create policy "own rows - update" on saved_places
  for update using (auth.uid() = user_id);
create policy "own rows - delete" on saved_places
  for delete using (auth.uid() = user_id);
```

User identity/name come from Supabase Auth (`auth.users` + `user_metadata.name`), so no
separate `profiles` table is required. Saved state is **local-first**: it persists to the
device (AsyncStorage) immediately and syncs to Supabase in the background (last-write-wins,
with a persisted op queue so offline changes are not lost). See `src/store/savedSync.ts`.

---

## Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps SDK for iOS**, **Maps SDK for Android**, and **Places API (New)**
3. Create an API key and add it to `.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
   — `app.config.js` injects it into the native Maps SDK config automatically
4. Restrict the key in Google Cloud Console (bundle id / package name + API list)
   and set daily quota limits (Text Search, Place Details, Photos, Autocomplete)
   so a leaked or abused key can't run up billing

> **Required manual hardening** (console-only, can't be done from code): rotate
> the leaked key, restrict it, and cap daily quotas. Step-by-step runbook:
> `docs/google-cloud-hardening.md`.

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