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

## Phase 4 — Discovery Browse / Search
- [ ] Add `searchNearby` to `api/` + `config/` (FIELD_MASK, `includedTypes`, `POPULARITY`, `locationRestriction.circle`)
- [ ] Store mode `'browse' | 'search'`
- [ ] Browse: multi-category chips → top-20, auto-fetch-more disabled
- [ ] Search: free-text input → `searchText` + pagination
- [ ] UI: segmented Browse/Search in Discover header; multi-select chips; search input (reuse `SegmentedControl`, `Chip`, `TextInput`)
- [ ] Tests: `buildRequestBody` both engines, mode switching, multi-category mapping, `searchNearby` api
- [ ] `commit + push`: `feat: dual-mode discovery (browse / search)`

## Phase 5 — Settings, Legal, Profile, units, error states
- [ ] Register `Settings`/`Privacy`/`Terms` routes + `RootStackParamList`
- [ ] Fix Profile menu: Account settings → Settings; Privacy/Terms → legal; keep Log out
- [ ] Settings back button; add Privacy/Terms/Log out rows (reuse)
- [ ] Account edit flows: email change, password change, display-name edit (Supabase) — small modal/inline components, logic in `useAccount` hook
- [ ] Persist `preferences`; "Location services" toggle gates GPS usage
- [ ] Apply distance units (km/mi) in `formatDistance`
- [ ] Profile real data (member-since, city); Guides placeholder
- [ ] Error/empty/retry: deck-fetch error + retry; location-denied distinct state + re-request; load-more indicator
- [ ] Tests: `useAccount`, profile stats util, prefs logic, geo units, `useFilters`, error-state logic
- [ ] `commit + push`: `feat: wire settings/legal, account editing, real profile, error states`

## Phase 6 — i18n (en, uk)
- [ ] i18n layer + en/uk locale files; drop `es`
- [ ] Extract all hardcoded strings (incl. legal content) to keys
- [ ] `preferences.language` switches locale + persists; pass `languageCode` to Google API
- [ ] Tests: locale resolution, formatters w/ locale, key coverage
- [ ] `commit + push`: `feat: i18n layer (en, uk)`

## Phase 7 — Refactor & cleanup
- [ ] Extract place actions → `usePlaceActions` + `utils/placeLinks.ts`
- [ ] Extract swipe decision → `utils/swipe.ts`
- [ ] Decompose `DiscoverScreen` + `PlaceDetails` into small components
- [ ] Dedup `FILTERS_KEY`; derive filter options from maps; use `ui/Toggle` in Filters; `generateUUID` → utils
- [ ] Theme overlay tokens; remove hardcoded rgba/white; fix `App.tsx` inline style
- [ ] Remove unused imports/vars/styles; unify `expo-image`/`Image`, `Pressable`/`TouchableOpacity`; inline type → `types/`
- [ ] Tests for extracted units
- [ ] `commit + push`: `refactor: extract logic, decompose screens, cleanup`

## Phase 8 — 100% coverage + docs
- [ ] Fill remaining: `ui/` render, components, screens branches, remaining hooks
- [ ] `istanbul ignore` on animation-only closures
- [ ] Ratchet `coverageThreshold` to 100
- [ ] Update README + CLAUDE.md to reality; update `docs/todo.md`
- [ ] `commit + push`: `test: 100% logic coverage; docs: sync`
