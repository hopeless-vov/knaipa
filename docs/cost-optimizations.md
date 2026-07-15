# API Cost Optimizations

> Current billing: **Enterprise + Atmosphere** ($40/1k searches, $7/1k photos)
> After all optimizations below: **Pro** ($32/1k searches) + near-zero photos

---

## Where the money actually goes

Each swipe session triggers:

| Action | Billing event | SKU |
|---|---|---|
| Filter change / app open | 1× searchText request | Enterprise + Atmosphere ($40/1k) |
| Auto-fetch more (3 cards left) | 1× searchText request | same |
| Top card cover renders | 1× photo request | Place Photos ($7/1k) |
| Cards 2 & 3 cover render | 2× photo requests | same |
| PlaceDetails below deck renders | up to 9× gallery photo requests | same |
| User opens card → PlaceDetailScreen | 9× more photo requests | same |

**Swipe 20 cards → ~20 cover photos + ~180 gallery photos = ~200 photo requests per session.**
Gallery photos are the main driver — they load eagerly because `PlaceDetails` renders immediately below the deck even when the user never scrolls there.

---

## 1. 🔴 Remove `editorialSummary` from FIELD_MASK

**File:** `src/config/googlePlaces.ts`
**Saving:** $40 → $35 per 1k searches (−12%)

`editorialSummary` is the only Enterprise + Atmosphere field in use. Removing it drops the entire search request to the Enterprise SKU tier.

```ts
export const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.photos',
  'places.primaryType',
  'places.types',
  'places.priceLevel',
  // 'places.editorialSummary',  ← remove this line
  'places.regularOpeningHours',
  'places.currentOpeningHours',
  'places.addressComponents',
  'nextPageToken',
].join(',');
```

`about` field on `Place` becomes empty string — either remove it from UI or populate later via Place Details.

---

## 2. 🔴 Move Enterprise fields to lazy load (Place Details on card open)

**Files:** `src/config/googlePlaces.ts`, `src/screens/PlaceDetailScreen.tsx`
**Saving:** $35 → $32 per 1k searches (−9%)

`rating`, `userRatingCount`, `priceLevel`, `regularOpeningHours`, `currentOpeningHours` are Enterprise fields fetched for all 20 results upfront — even for cards the user immediately passes.

**Step 1** — remove from main FIELD_MASK:
```ts
export const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  // 'places.rating',              ← move to Place Details
  // 'places.userRatingCount',     ← move to Place Details
  'places.photos',
  'places.primaryType',
  'places.types',
  // 'places.priceLevel',          ← move to Place Details
  // 'places.regularOpeningHours', ← move to Place Details
  // 'places.currentOpeningHours', ← move to Place Details
  'places.addressComponents',
  'nextPageToken',
].join(',');
```

**Step 2** — add a Place Details field mask for card open:
```ts
// src/config/googlePlaces.ts
export const PLACE_DETAILS_URL = `${PLACES_BASE_URL}/places`;

export const DETAILS_FIELD_MASK = [
  'rating',
  'userRatingCount',
  'priceLevel',
  'regularOpeningHours',
  'currentOpeningHours',
  'editorialSummary',
  'websiteUri',
  'internationalPhoneNumber',
].join(',');
```

**Step 3** — fetch on card open in PlaceDetailScreen:
```ts
// src/api/googlePlaces.ts
export async function fetchPlaceDetails(placeId: string): Promise<Partial<GooglePlace>> {
  const url = `${PLACE_DETAILS_URL}/${placeId}`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': DETAILS_FIELD_MASK,
    },
  });
  return res.json();
}
```

Place Details costs $20/1k (Enterprise tier) vs $32/1k for the main search — but you only pay for cards the user actually opens, not all 20 returned.

---

## 3. 🔴 Lazy load gallery photos in PlaceDetails

**File:** `src/components/PlaceDetails.tsx`
**Saving:** up to ~90% of photo billing

PlaceDetails renders immediately below the deck for every top card, loading up to 9 gallery photos at once — even if the user swipes without ever scrolling down.

Current flow: swipe → new topCard → PlaceDetails renders → 9 gallery images fire requests.

**Fix:** don't render gallery images until the user actually scrolls to PlaceDetails. Two options:

**Option A — conditional render (simplest):**
Add a "Show gallery" button that reveals images on tap. No library needed.

**Option B — `onLayout` + scroll detection:**
Track whether PlaceDetails section is in viewport before loading images.

**Option C — `<Image>` with `lazy` flag:**
React Native's `<Image>` doesn't have lazy loading built in, but you can defer source assignment:
```tsx
const [galleryVisible, setGalleryVisible] = useState(false);

// In JSX:
<View onLayout={() => setGalleryVisible(true)}>
  {galleryVisible && place.gallery.map(uri => <Image source={{ uri }} ... />)}
</View>
```

The simplest immediate fix: only render the first gallery image eagerly, rest on tap/scroll.

---

## 4. 🟡 Reduce cover photo size from 800px to 400px

**File:** `src/mappers/googlePlaces.ts` line 50

Photo billing is per request, not per byte — but smaller images reduce bandwidth and load faster on mobile.

```ts
// Current:
return `${PLACES_BASE_URL}/${photoName}/media?maxWidthPx=800&key=${apiKey}`;

// Swipe card covers don't need 800px wide:
return `${PLACES_BASE_URL}/${photoName}/media?maxWidthPx=400&key=${apiKey}`;
```

For gallery in PlaceDetailScreen a separate higher-res URL can be used.

---

## 5. 🟡 Session tokens for autocomplete → free

**File:** `src/hooks/useLocationInput.ts`
**Saving:** Autocomplete Session Usage tier → Unlimited free

Without session tokens, every autocomplete keystroke is billed separately.
With a session token, all keystrokes + the final Place Details call are grouped into one free session.

```ts
// src/hooks/useLocationInput.ts
import { useRef, useCallback } from 'react';

const sessionTokenRef = useRef<string>(crypto.randomUUID());

// Pass token in every autocompletePlaces() call:
const results = await autocompletePlaces(query, coords, sessionTokenRef.current);

// Pass same token in fetchPlaceLocation() call:
const location = await fetchPlaceLocation(placeId, sessionTokenRef.current);

// Reset token after: suggestion selected / GPS used / input cleared
const resetToken = useCallback(() => {
  sessionTokenRef.current = crypto.randomUUID();
}, []);

// Call resetToken() in:
// - onSelectSuggestion (after fetchPlaceLocation)
// - onUseGPS
// - onClearInput
```

```ts
// src/api/googlePlaces.ts — add sessionToken param:
export async function autocompletePlaces(
  query: string,
  coords: { lat: number; lng: number } | null,
  sessionToken: string,
): Promise<AutocompleteSuggestion[]> {
  // ...
  body: JSON.stringify({ input: query, sessionToken, ...locationBias }),
}
```

---

## 6. 🟡 Set hard quota limits in Google Cloud Console

Prevents runaway billing if something goes wrong (bug, bot traffic, viral load).

Go to: **Google Cloud Console → APIs & Services → Places API (New) → Quotas**

| Quota | Recommended limit |
|---|---|
| Text Search requests/day | 50 |
| Place Details requests/day | 200 |
| Place Photos requests/day | 100 |
| Autocomplete requests/day | 500 |

When quota is hit, API returns 429 — app shows "no results" gracefully instead of charging.

---

## Combined savings estimate

| Optimization | Before | After | Saving |
|---|---|---|---|
| Remove editorialSummary | $40/1k | $35/1k | −12% per search |
| Move Enterprise to lazy load | $35/1k | $32/1k | −9% per search |
| Lazy gallery photos | ~200 photos/session | ~3 photos/session | −98% photos |
| Session tokens | billed per keystroke | free | −100% autocomplete |

Main search cost drops from **$40 → $32/1k** (−20%).
Photo cost drops from the main billing driver to near-zero for users who don't open cards.
