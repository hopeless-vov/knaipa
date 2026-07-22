# Google Cloud hardening (manual — do this in the Cloud Console)

The app calls the Places/Maps APIs directly from the client, so the API key
ships inside the app bundle (and in photo URLs). This is unavoidable without a
backend proxy — so the **entire cost/abuse model depends on the two console-side
controls below.** They cannot be set from code; someone with Cloud Console
access must do them once.

Everything else (field masks, session tokens, deck caching, keeping client-only
filters out of the cache key) is already handled in the codebase.

## 1. Rotate the leaked key ⚠️ highest priority

The original key was committed in `app.json` and is in git history on GitHub.
Treat it as compromised.

1. **APIs & Services → Credentials → Create credentials → API key.**
2. Delete (or regenerate) the old key so the leaked value stops working.
3. Put the new value in `.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
   (`app.config.js` injects it into the native Maps SDK automatically).

## 2. Restrict the new key

Because the key ships to clients, restriction is the only real defense.

- **Application restrictions**
  - iOS: restrict to bundle id `com.knaipa.app`.
  - Android: restrict to package `com.knaipa.app` + the release SHA-1 fingerprint.
  - Note: the REST Places API (New) and the native Maps SDK authenticate
    differently. If one key must cover both, keep the API restrictions (below)
    tight to limit the blast radius.
- **API restrictions** — allow only what the app uses:
  - Places API (New)
  - Maps SDK for iOS
  - Maps SDK for Android

## 3. Set daily quota caps

**APIs & Services → Places API (New) → Quotas.** Cap each SKU so a leaked or
abused key can't run up an unbounded bill. Suggested starting ceilings (tune to
real usage):

| Request | Suggested daily cap |
|---|---|
| Text Search (searchText) | ~50 |
| Nearby Search (searchNearby) | ~50 |
| Place Details | ~200 |
| Place Photos | ~100 |
| Autocomplete | ~500 |

Also set a **billing budget + alert** (Billing → Budgets & alerts) as a backstop.

## What the app does when the cap is hit

A `429`/quota error surfaces as the deck's generic error state (retryable);
autocomplete/place-details degrade quietly (empty results / no extra details).
No crash, no runaway retries.

> See also `docs/cost-optimizations.md` for the per-SKU cost rationale.
