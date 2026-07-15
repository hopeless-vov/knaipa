# knaipa — Completion Plan & Progress

> Living document. Each phase ends with `commit + push`. Mark `[x]` when done.
> Legend: `[ ]` todo · `[~]` in progress · `[x]` done
> Principles: reuse existing components; keep them tiny and presentational; drive all logic from user-cases; split logic into small units; 100% logic test coverage (animation/gesture closures via `istanbul ignore`); rename `kutok → knaipa` everywhere feasible.

---

## Scope decisions (locked)
- **Saved persistence:** hybrid local-first (AsyncStorage) + Supabase sync (last-write-wins); snapshot place data so saved Google places are never re-fetched.
- **Auth:** persist session (SecureStore adapter) + fix nav-on-failure; **remove** social login buttons.
- **Discovery search:** dual mode — **Browse** (multi-category `searchNearby`, top-20 `POPULARITY`, no pagination) / **Search** (free-text `searchText` + pagination).
- **Cost/UX:** keep rating + hours on deck cards (skip lazy-Enterprise opt #2); still do cache-revalidation gating, lazy gallery, 400px covers, quota doc.
- **Settings:** full functionality — email change, password change, display-name edit (Supabase); persist prefs; location-services toggle gates GPS; wire Privacy/Terms/Log out; distance units applied.
- **i18n:** full localization en + uk (drop stray `es`); `languageCode` also passed to Google API.
- **Profile:** real data (member-since from `createdAt`, city from location/saved); Guides = placeholder.
- **Tests:** interleaved into every phase + final sweep to 100% logic.

---

## Baseline
- [x] Fix `.gitignore` to ignore `.env` (secret-leak guard); keep `.env.example`
- [x] Baseline commit of current untracked state (so rename/feature diffs are visible)

## Phase 0 — Rename + test infrastructure *(partially pulled into Phase 1)*
- [ ] Rename `kutok → knaipa`: `package.json`, `app.json` (name/slug), README, CLAUDE.md, storage keys (`@kutok/*` → `@knaipa/*`), legal text (`Kutok`/`kutok.app`), Wordmark/brand strings
- [~] Add Jest mocks: `expo-secure-store` ✓, `async-storage` ✓ (done in Phase 1); `expo-clipboard`, `expo-image`, `expo-linear-gradient` pending
- [x] Wire storage mocks into `jest.config.js` `moduleNameMapper`
- [ ] Add `collectCoverageFrom` + `coverageThreshold` (start realistic, ratchet later)
- [x] Green the 2 broken suites (7 suites / 50 tests pass)
- [ ] `commit + push`: `chore: rename to knaipa, coverage config`

## Phase 1 — Auth & session correctness ✅
- [x] Supabase client: SecureStore storage adapter + `persistSession` + `autoRefreshToken`
- [x] Session restore on launch (`useAuthSession`: `getSession`/`onAuthStateChange`); RootNavigator gates auth vs main stacks (SplashView while restoring)
- [x] Fix `handleLogin`/`handleSignup`: navigator swaps on auth state only — no manual navigate-on-failure; errors surfaced from hook (signIn/signUp return boolean)
- [x] `utils/validation.ts` (email/password/name) — pure + tested; `mappers/user.ts` dedups session→User mapping
- [x] Remove Google/Apple social buttons (Login + Signup)
- [x] Tests: `useAuth` (12), `validation` (15), `userMapper` (4), `useAuthSession` (5) — 50 total green
- [x] `commit + push`: `feat: persist auth session, gate navigation, fix login flow`

## Phase 2 — Saved persistence (hybrid) ✅
- [x] Persist place snapshots to AsyncStorage (`store/savedStorage.ts`, key `@knaipa/saved`)
- [x] Decouple saved from `allFetchedPlaces` — dedicated `savedPlacesById` snapshot map is the source of truth (survives deck refetch + restart)
- [x] Real `savedAt` timestamps (preserved across re-like)
- [x] Rework `api/savedPlaces.ts` to JSONB snapshot (`fetchRemoteSaved`, `pushSave` upsert, `pushUnsave`, `pushVisited`); README schema updated (JSONB + RLS)
- [x] Persisted sync queue + flush (`store/savedSync.ts`, `@knaipa/syncQueue`) with `pullAndMerge` (remote ∪ pending-local-wins); `useSavedBootstrap` hydrates on launch + syncs on login (mounted in RootNavigator)
- [x] Fix `activeFilterCount` (now includes availability/sort/minReviews/hideSeen)
- [x] Removed dead `addSaved`; added `isSaved` getter
- [x] Storage keys renamed `@kutok/*` → `@knaipa/*` (filters, deck cache)
- [x] Tests: `savedStorage`, `savedSync`, `savedPlaces` api, `useAppStoreSaved` (+ migrated useDiscover/useSaved) — 11 suites / 93 tests green
- [x] `commit + push`: `feat: hybrid local+Supabase persistence for saved places`

> Note: `fetchDeck`/`fetchMoreDeck` unit tests deferred to Phase 3 (that phase reworks deck fetching/caching).

## Phase 3 — useDiscover bug + cost/caching ✅
- [x] `PlaceDetailScreen` now calls store `swipeLike`/`swipePass` on the *viewed* place — dropped `useDiscover` (killed GPS + billed `searchText` on every card open)
- [x] Gate `fetchDeck` background revalidation on cache age (`DECK_REVALIDATE_AFTER_MS` = 10 min; fresh cache serves with NO billed request)
- [x] Lazy gallery in in-deck `PlaceDetails` (`lazyGallery` prop → reveal button; no photo requests until tapped). Full detail page loads normally
- [x] Photo widths parameterized in config (cover 600 / gallery 800); one width per photo → single cached request (no double-billing)
- [x] Gallery cap raised to `GALLERY_MAX`=7 → "SHOW ALL N PHOTOS" branch reachable
- [~] API key in persisted cached URLs — **deferred to Phase 7** (public `EXPO_PUBLIC` client key = low risk; clean fix touches types + 3 image components which Phase 7 refactors)
- [x] Tests: `useAppStoreDeck` (cache-age + fetchMoreDeck dedupe), `mapperGooglePlaces`, `googlePlacesApi`, `placeFilters`, `geo`, `formatHours`, `places.isOpenEvening` — 17 suites / 150 tests green
- [x] `commit + push`: `perf: fix redundant fetches, gate cache, lazy photos`

> Cost-opt #2 (lazy Enterprise fields) intentionally NOT done — user chose to keep rating/hours on deck cards.

## Phase 4 — Discovery Browse / Search ✅
- [x] `searchNearby` added to `api/` + `config/` (`NEARBY_SEARCH_URL`, `NEARBY_FIELD_MASK`, `includedTypes`, `POPULARITY`, `locationRestriction.circle`, max 20)
- [x] Filters model reworked: `mode: 'browse' | 'search'`, `categories: string[]`, `query: string` (dropped single `category`)
- [x] Browse: multi-category chips → `searchNearby` top-20; `nextPageToken` forced null → auto-fetch-more naturally disabled
- [x] Search: free-text input → `searchText` + pagination (submit on return key)
- [x] `searchNearby` can't filter rating/price/openNow → enforced client-side in `applyPostFetchFilters` (browse mode only)
- [x] UI: `DiscoverSearchBar` component (reuses `SegmentedControl`/`Chip`/`TextInput`) in Discover header; category selection moved out of Filters modal
- [x] `useDiscover` exposes `setMode`/`toggleCategory`/`submitSearch`; filter re-fetch debounced 400ms so multi-toggle = one request
- [x] `activeFilterCount` now counts only modal refinements (not header categories/query)
- [x] Tests: `buildRequestBody`+`buildNearbyRequestBody`, both-engine fetch, browse client filters, `useDiscoverModes` — 18 suites / 163 tests green
- [x] `commit + push`: `feat: dual-mode discovery (browse / search)`

## Phase 5 — Settings, Legal, Profile, units, error states ✅
- [x] Registered `Settings`/`Privacy`/`Terms` routes + `RootStackParamList`
- [x] Profile menu fixed: Account settings → Settings; Privacy/Terms → legal (was a dead PlaceDetail placeholder / no-ops); Log out kept
- [x] Settings: back button + LEGAL section with Privacy/Terms links
- [x] Account editing: `useAccount` hook (updateName/updatePassword/updateEmail via `supabase.auth.updateUser`) + `AccountEditRow` inline-edit component; email change surfaces a confirmation message; validation reused
- [x] Preferences persisted (`@knaipa/preferences`, hydrated on launch); "Location services" toggle gates GPS (no prompt when off)
- [x] Distance units: `formatDistance(m, unit)` (km/mi + feet); `Place.distanceMeters` stored; unit threaded through fetch/mapper; unit change reformats the loaded deck instantly (no refetch)
- [x] Profile real data: `computeProfileStats` + `memberSince(createdAt)` + `homeCity(saved)`; Guides kept as placeholder
- [x] Error/empty/retry: `deckError` + TRY AGAIN; location-denied distinct state + ENABLE LOCATION; load-more indicator (revived dead styles)
- [x] Tests: `useAccount`, `profile`, geo miles, `useAppStorePrefs`, deckError/unit in `useAppStoreDeck`, +supabase `updateUser` mock — 21 suites / 188 tests green
- [x] `commit + push`: `feat: wire settings/legal, account editing, real profile, error states`

## Phase 6 — i18n (en, uk) ✅
- [x] i18n layer (`src/i18n/`): `en.ts` + `uk.ts` dictionaries, `translate`/`translateCount`/`translateList`, reactive `useTranslation` hook; dropped `es`
- [x] Extracted all UI strings across every screen/component (incl. full legal Privacy/Terms content translated to Ukrainian) to keys
- [x] Validation messages return i18n keys; `useAuth`/`useAccount` translate them (raw Supabase errors passed through)
- [x] `preferences.language` switches locale reactively + persists; `languageCode` threaded through `searchText`/`searchNearby`/autocomplete; deck refetches on language change (localized Google names/hours), cache keyed by language
- [x] Brand text fixed kutok→knaipa in auth/splash wordmarks
- [x] Tests: `i18n` (translate/plural/list/parity) — 22 suites / 200 tests green
- [x] `commit + push`: `feat: i18n layer (en, uk)`

> Boundary: place category labels come from the app taxonomy (English) and Google-derived names/hours are localized by Google via `languageCode`; short filter-chip option values (near/5km/Open now) stay as-is.

## Phase 7 — Refactor & cleanup ✅
- [x] Extracted place actions → `usePlaceActions` + pure `utils/placeLinks.ts` (buildMapsUrl/buildWebMapsUrl/resolveWebsiteUrl/buildSharePayload); PlaceDetails no longer holds link/share logic
- [x] Extracted swipe decision → `utils/swipe.ts` (`resolveSwipeOutcome`); SwipeCard's onEnd uses it
- [x] `generateUUID` → `utils/uuid.ts` (out of useLocationInput)
- [x] `FILTERS_KEY` centralized (Phase 2); filter option lists derived from the source maps in `places.ts` (no drift); `ui/Toggle` reused in Filters (dropped hand-rolled toggle + dead styles)
- [x] Theme scrim/glass/track tokens; removed hardcoded rgba/white in PlaceCover & Toggle; `App.tsx` inline style → StyleSheet
- [x] Removed unused: Chip `MUTED` import, DiscoverScreen `reset` + `metaSmall.fontFamily`, duplicate type imports; inline autocomplete type → `types/googleApi.ts` (`RawAutocompletePrediction`); autocomplete now gets `languageCode`
- [x] Tests: `swipe`, `placeLinks`, `uuid` — 25 suites / 212 tests green
- [x] `commit + push`: `refactor: extract logic to hooks/utils, cleanup`

> Full screen decomposition (DiscoverScreen/PlaceDetails into many sub-files) deferred as lower-value; the logic extraction (the audit's M1) is done.

## Phase 8 — 100% coverage + docs
- [ ] Fill remaining: `ui/` render, components, screens branches, remaining hooks
- [ ] `istanbul ignore` on animation-only closures
- [ ] Ratchet `coverageThreshold` to 100
- [ ] Update README + CLAUDE.md to reality; update `docs/todo.md`
- [ ] `commit + push`: `test: 100% logic coverage; docs: sync`
