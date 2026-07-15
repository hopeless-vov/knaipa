# Project: kutok

Place discovery app — Tinder-like swipe UI for finding restaurants, museums, parks, cafés and other venues nearby. Users swipe right to save, left to pass. Saved places appear in a collection with map view, visited/pending filters, and city grouping.

Stack: React Native, Expo SDK 54, TypeScript, Zustand, React Navigation, Google Places API (New), expo-location, expo-secure-store.

---

## Architecture

```
src/
├── ui/           # Primitive, logic-free components — props in, render out, nothing else
├── components/   # Composite components, may use hooks and local state
├── screens/      # One file per route, composes components
├── hooks/        # All business logic — custom hooks only
├── store/        # Zustand stores (useAppStore.ts)
├── api/          # API calls only — Google Places, Supabase. No React, no hooks, no state
├── types/        # TypeScript interfaces split by domain:
│   ├── place.ts       — Place, SavedPlace, SwipeHistoryEntry
│   ├── filters.ts     — Filters
│   ├── user.ts        — User, UserPreferences
│   ├── navigation.ts  — RootStackParamList, TabParamList
│   └── index.ts       — re-exports all of the above
├── utils/        # Pure helper functions (formatters, haversine, etc.)
└── __tests__/    # All tests live here, never next to source files
    └── fixtures/ # Shared mock data (MOCK_PLACES, etc.)

docs/             # API reference docs, architecture notes
└── google-place-api.md  — Google Places Text Search API reference
```

---

## Rules

### ui/ — zero logic
- No imports from store/, hooks/, api/
- No useEffect with side effects, no API calls
- Every component has a typed props interface
- Generic and fully reusable

### components/ — composite
- May use hooks and local state
- Must not call API functions directly — go through a hook or store
- No direct imports from api/

### screens/ — route containers
- One screen per route
- Compose components, connect to hooks/store
- No inline business logic — extract to a hook

### api/ — API calls only
- googlePlaces.ts — fetchNearbyPlaces, autocompletePlaces, fetchPlaceLocation
- savedPlaces.ts  — Supabase saved places queries
- supabase.ts     — Supabase client
- No React, no hooks, no state
- Filter logic: server-side filters in buildRequestBody(), client-side only in applyPostFetchFilters()

### store/ — Zustand state
- One store: useAppStore.ts
- May import from api/ directly
- Filter persistence uses expo-secure-store (key: @kutok/filters)

### types/ — split by domain
- Never add types to source files — keep them in types/
- Import from specific file: import { Place } from '../types/place'
- Or via barrel: import { Place } from '../types'

### __tests__/ — all tests
- Never place test files next to hooks or components
- Shared mock data goes in __tests__/fixtures/
- Use MOCK_PLACES from __tests__/fixtures/places.ts for store/hook tests

### i18n
- All user-visible text lives in `src/i18n/en.ts` + `src/i18n/uk.ts` (dot-addressed keys)
- Components read strings via `useTranslation()` → `t('namespace.key')` — never hardcode UI copy
- Pure functions/utils return i18n **keys**; the calling hook/component translates them
- Google-derived data (place names, hours) is localized by the API `languageCode`, not the dictionary

### General
- TypeScript everywhere — avoid `any`, use explicit types
- Single responsibility per function and component
- No inline styles — always StyleSheet.create()
- Magic numbers and repeated strings → named constants in utils/theme.ts or the relevant file
- Small focused files over large ones
- Repeated logic → custom hook or util

### Naming
- Components and screens: PascalCase
- Hooks: camelCase with `use` prefix
- API modules and utils: camelCase
- Types and interfaces: PascalCase

### Environment variables vs constants
- `.env` is for **secrets** (API keys, tokens) and **environment-specific values** (prod vs staging base URLs)
- API endpoint URLs (`SEARCH_URL`, `PHOTO_BASE`, autocomplete URL) are public, documented, never change → keep as named constants inside the module that uses them
- Never hardcode API keys in source files — always use `process.env.EXPO_PUBLIC_*`
- Expo reads `EXPO_PUBLIC_*` variables at build time; no extra config needed

### Google Places API
- **Read `docs/google-place-api.md` and `docs/google-place-data-fields.md`  before touching `api/googlePlaces.ts`**
- Use `searchText` endpoint (POST /v1/places:searchText)
- pageSize (not maxResultCount), openNow, minRating, priceLevels are API-side
- minReviews, "Open evening", sort-by-rating are post-fetch client-side filters
- Radius enforcement is post-fetch via haversineDistance (locationBias is a hint only)
- Use fetchPlaceLocation(placeId) for coordinate resolution — never Apple Maps geocodeAsync
- weekdayDescriptions index: (getDay() + 6) % 7  (API: Mon=0, JS: Sun=0)

### README
Always keep README.md up to date when adding packages, scripts, or changing architecture.
