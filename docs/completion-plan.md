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
- [ ] Fix `.gitignore` to ignore `.env` (secret-leak guard); keep `.env.example`
- [ ] Baseline commit of current untracked state (so rename/feature diffs are visible)

## Phase 0 — Rename + test infrastructure
- [ ] Rename `kutok → knaipa`: `package.json`, `app.json` (name/slug), README, CLAUDE.md, storage keys (`@kutok/*` → `@knaipa/*`), legal text (`Kutok`/`kutok.app`), Wordmark/brand strings
- [ ] Add Jest mocks: `expo-secure-store`, `async-storage`, `expo-clipboard`, `expo-image`, `expo-linear-gradient`
- [ ] Wire mocks into `jest.config.js` `moduleNameMapper`
- [ ] Add `collectCoverageFrom` + `coverageThreshold` (start realistic, ratchet later)
- [ ] Green the 2 broken suites; confirm component-render env works
- [ ] `commit + push`: `chore: rename to knaipa, fix test infra & coverage config`

## Phase 1 — Auth & session correctness
- [ ] Supabase client: SecureStore storage adapter + `persistSession` + `autoRefreshToken`
- [ ] Session restore on launch (`getSession`/`onAuthStateChange`); RootNavigator gates auth vs main (splash)
- [ ] Fix `handleLogin`/`handleSignup`: navigate only on success; surface errors (logic in hook)
- [ ] `utils/validation.ts` (email/password) — pure + tested
- [ ] Remove Google/Apple social buttons
- [ ] Tests: `useAuth`, `validation`, nav gating, session restore
- [ ] `commit + push`: `feat: persist auth session, gate navigation, fix login flow`

## Phase 2 — Saved persistence (hybrid)
- [ ] Persist `savedIds`, `visitedMap`, place snapshots to AsyncStorage
- [ ] Decouple `savedPlaces()` from `allFetchedPlaces` (dedicated `savedPlacesById`)
- [ ] Real `savedAt` timestamps
- [ ] Wire `api/savedPlaces.ts`: save→upsert `places` + insert `saved_places`; unsave→delete; visited→update; login→fetch+merge
- [ ] Simple sync queue (flush when online/authed)
- [ ] Fix `activeFilterCount` (include sort/minReviews/hideSeen)
- [ ] Tests: store saved actions, `savedPlaces.ts`, merge/sync, `useSaved.validPlaces`
- [ ] `commit + push`: `feat: hybrid local+Supabase persistence for saved places`

## Phase 3 — useDiscover bug + cost/caching
- [ ] Stop `PlaceDetailScreen` using full `useDiscover`; thin `swipeLike/swipePass` selector; act on viewed place
- [ ] Gate `fetchDeck` background revalidation on cache age
- [ ] Lazy gallery render (onLayout/scroll guard) in in-deck `PlaceDetails`
- [ ] 400px covers (separate higher-res for fullscreen), smaller thumbs
- [ ] Fix dead gallery cap / SHOW ALL branch
- [ ] Don't bake API key into persisted cached URLs
- [ ] Tests: cache-age logic, `fetchMoreDeck` dedupe, mapper, `googlePlaces` api, `placeFilters`, `geo`, `formatHours`, `isOpenEvening`
- [ ] `commit + push`: `perf: fix redundant fetches, gate cache, lazy photos`

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
