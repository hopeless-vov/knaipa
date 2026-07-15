# Google Places API (New) — Agent Documentation

## Overview

Places API (New) provides 5 main endpoints:

| Endpoint | Use Case |
|---|---|
| Text Search | Search by text query ("coffee Kyiv") |
| Nearby Search | Find places within geographic area by coordinates |
| Autocomplete | Real-time place predictions as user types |
| Place Details | Full details for a known place_id |
| Place Photos | Access photos by photo_reference |

Base URL: `https://places.googleapis.com/v1`

---

## Authentication

All requests require:
```
X-Goog-Api-Key: YOUR_API_KEY
```

---

## 1. Text Search

### Endpoint
```
POST https://places.googleapis.com/v1/places:searchText
```

### Required Headers
```
Content-Type: application/json
X-Goog-Api-Key: YOUR_KEY
X-Goog-FieldMask: places.displayName,places.formattedAddress
```

### Required Body
```json
{
  "textQuery": "coffee shops Kyiv"
}
```

### Optional Body Parameters
```json
{
  "textQuery": "coffee shops Kyiv",

  "pageSize": 20,
  "pageToken": "TOKEN_FROM_PREVIOUS_RESPONSE",

  "languageCode": "uk",
  "regionCode": "UA",

  "openNow": true,
  "minRating": 4.0,

  "includedType": "cafe",
  "strictTypeFiltering": true,

  "rankPreference": "DISTANCE",

  "priceLevels": ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"],

  "includePureServiceAreaBusinesses": false,

  "locationBias": {
    "circle": {
      "center": { "latitude": 50.45, "longitude": 30.52 },
      "radius": 1000.0
    }
  },

  "locationRestriction": {
    "rectangle": {
      "low":  { "latitude": 50.4, "longitude": 30.5 },
      "high": { "latitude": 50.5, "longitude": 30.6 }
    }
  },

  "evOptions": {
    "minimumChargingRateKw": 10,
    "connectorTypes": ["EV_CONNECTOR_TYPE_J1772", "EV_CONNECTOR_TYPE_TESLA"]
  }
}
```

### FieldMask — Available Fields

**Essentials SKU (cheapest):**
```
places.id
places.name
places.attributions
nextPageToken
```

**Pro SKU:**
```
places.displayName
places.formattedAddress
places.location
places.types
places.primaryType
places.primaryTypeDisplayName
places.photos
places.rating
places.websiteUri
places.googleMapsUri
places.googleMapsLinks
places.viewport
places.addressComponents
places.addressDescriptor
places.plusCode
places.postalAddress
places.timeZone
places.utcOffsetMinutes
places.businessStatus
places.iconBackgroundColor
places.iconMaskBaseUri
places.shortFormattedAddress
places.searchUri
places.pureServiceAreaBusiness
```

**Enterprise SKU (expensive):**
```
places.currentOpeningHours
places.regularOpeningHours
places.currentSecondaryOpeningHours
places.regularSecondaryOpeningHours
places.internationalPhoneNumber
places.nationalPhoneNumber
places.priceLevel
places.priceRange
places.userRatingCount
```

**Enterprise + Atmosphere SKU (most expensive):**
```
places.allowsDogs
```

> Use `*` in development only — returns all fields, billed accordingly.
> Always add `nextPageToken` to FieldMask if pagination is needed.

### Response Structure
```json
{
  "places": [
    {
      "id": "ChIJifIePKtZwokRVZ-UdRGkZzs",
      "displayName": {
        "text": "Place Name",
        "languageCode": "uk"
      },
      "formattedAddress": "вул. Хрещатик 1, Київ",
      "location": {
        "latitude": 50.45,
        "longitude": 30.52
      },
      "rating": 4.5,
      "priceLevel": "PRICE_LEVEL_MODERATE",
      "types": ["cafe", "food", "establishment"],
      "primaryType": "cafe"
    }
  ],
  "nextPageToken": "AeCrKXsZ..."
}
```

### Pagination Rules
- Max **60 results** total (3 pages × 20)
- Default **20 results** per page
- Pass `nextPageToken` value as `pageToken` in next request
- All parameters except `pageToken` must be **identical** across pages
- No `nextPageToken` in response = last page reached

### locationBias vs locationRestriction

| | locationBias | locationRestriction |
|---|---|---|
| Results outside area | ✅ possible | ❌ excluded |
| Shape | circle or rectangle | rectangle only |
| Use when | "search near here" | "search strictly within" |

> If neither is set — API uses device IP for biasing.
> `locationBias` is ignored if `textQuery` contains explicit location (e.g. "cafe in Kyiv").

### rankPreference Values
```
RELEVANCE  — by search relevance (default for categorical queries)
DISTANCE   — by distance from location
```

### priceLevels Values
```
PRICE_LEVEL_INEXPENSIVE
PRICE_LEVEL_MODERATE
PRICE_LEVEL_EXPENSIVE
PRICE_LEVEL_VERY_EXPENSIVE
```
> `PRICE_LEVEL_FREE` — response only, cannot use in request.

### What NOT to Search
- Multiple places in one query: `"McDonalds KFC Kyiv"`
- Coordinates: `"50.45, 30.52"`
- Ambiguous queries: `"Charger drop-off"`
- Postal box addresses: `"P.O. Box 13 Kyiv"`
- Non-existent locations on Google Maps

---

## 2. Nearby Search

### Endpoint
```
POST https://places.googleapis.com/v1/places:searchNearby
```

### Key Difference from Text Search
No `textQuery` — searches purely by location + type.
Best for "what's near me right now" use cases.

### Body
```json
{
  "locationRestriction": {
    "circle": {
      "center": { "latitude": 50.45, "longitude": 30.52 },
      "radius": 1000.0
    }
  },
  "includedTypes": ["restaurant", "cafe"],
  "excludedTypes": ["fast_food_restaurant"],
  "includedPrimaryTypes": ["cafe"],
  "excludedPrimaryTypes": [],
  "maxResultCount": 20,
  "rankPreference": "DISTANCE",
  "languageCode": "uk"
}
```

### Parameters
| Parameter | Type | Description |
|---|---|---|
| `locationRestriction` | object | **Required.** Circle with center + radius (max 50000m) |
| `includedTypes` | string[] | Place types to include (Table A) |
| `excludedTypes` | string[] | Place types to exclude (Table A) |
| `includedPrimaryTypes` | string[] | Filter by primary type only |
| `excludedPrimaryTypes` | string[] | Exclude by primary type |
| `maxResultCount` | number | Max results 1–20 |
| `rankPreference` | string | `POPULARITY` or `DISTANCE` |
| `languageCode` | string | Response language |

---

## 3. Autocomplete

### Endpoint
```
POST https://places.googleapis.com/v1/places:autocomplete
```

### Use Case
Real-time search field predictions as user types.

### Body
```json
{
  "input": "Sicilian piz",

  "locationBias": {
    "circle": {
      "center": { "latitude": 50.45, "longitude": 30.52 },
      "radius": 5000.0
    }
  },

  "locationRestriction": {
    "circle": {
      "center": { "latitude": 50.45, "longitude": 30.52 },
      "radius": 5000.0
    }
  },

  "includedPrimaryTypes": ["restaurant"],
  "includedRegionCodes": ["UA"],

  "languageCode": "uk",
  "regionCode": "UA",

  "sessionToken": "USER_GENERATED_SESSION_TOKEN",

  "includeQueryPredictions": false
}
```

### Response Structure
```json
{
  "suggestions": [
    {
      "placePrediction": {
        "place": "places/ChIJifIePKtZ...",
        "placeId": "ChIJifIePKtZ...",
        "text": {
          "text": "Sicilian Pizza Kitchen, Pitt Street, Sydney NSW, Australia",
          "matches": [{ "startOffset": 0, "endOffset": 8 }]
        },
        "structuredFormat": {
          "mainText": { "text": "Sicilian Pizza Kitchen" },
          "secondaryText": { "text": "Pitt Street, Sydney NSW, Australia" }
        },
        "types": ["restaurant", "food", "establishment"]
      }
    },
    {
      "queryPrediction": {
        "text": { "text": "Sicilian pizza near Sydney" }
      }
    }
  ]
}
```

### Session Tokens
Session tokens group query + selection into one billing session.
Generate a unique string per search session, reuse across autocomplete calls, discard after Place Details call.
```typescript
const sessionToken = crypto.randomUUID()
```

---

## 4. Place Details

### Endpoint
```
GET https://places.googleapis.com/v1/places/{place_id}
```

### Headers
```
X-Goog-Api-Key: YOUR_KEY
X-Goog-FieldMask: displayName,formattedAddress,location,rating
```

### When to Use
- You already have a `place_id` (from search results or autocomplete)
- Cheaper than running a new search for a known place

### Example
```
GET https://places.googleapis.com/v1/places/ChIJifIePKtZwokRVZ-UdRGkZzs
```

### Response
```json
{
  "id": "ChIJifIePKtZwokRVZ-UdRGkZzs",
  "displayName": { "text": "Place Name", "languageCode": "en" },
  "formattedAddress": "123 Main St, Kyiv",
  "location": { "latitude": 50.45, "longitude": 30.52 },
  "rating": 4.5,
  "userRatingCount": 320,
  "currentOpeningHours": {
    "openNow": true,
    "periods": [...]
  },
  "internationalPhoneNumber": "+380 44 123 4567",
  "websiteUri": "https://example.com"
}
```

---

## 5. Place Photos

### Step 1 — Get photo_reference from search/details
Include `places.photos` in FieldMask of any search request.

```json
"photos": [
  {
    "name": "places/ChIJ.../photos/AXCi2Q...",
    "widthPx": 4032,
    "heightPx": 3024,
    "authorAttributions": [...]
  }
]
```

### Step 2 — Fetch the photo
```
GET https://places.googleapis.com/v1/{photo_name}/media
  ?maxWidthPx=800
  &maxHeightPx=600
  &key=YOUR_KEY
```

### Parameters
| Parameter | Description |
|---|---|
| `maxWidthPx` | Max width in pixels (1–4800) |
| `maxHeightPx` | Max height in pixels (1–4800) |

> At least one of `maxWidthPx` or `maxHeightPx` is required.

---

## Place Types (Table A) — Common Values

Used for filtering in Text Search (`includedType`) and Nearby Search (`includedTypes`):

```
# Food & Drink
restaurant, cafe, bar, bakery, fast_food_restaurant,
coffee_shop, pizza_restaurant, sushi_restaurant,
vegetarian_restaurant, wine_bar, night_club

# Shopping
supermarket, pharmacy, clothing_store, shoe_store,
shopping_mall, convenience_store, book_store, grocery_store

# Services
bank, atm, hospital, doctor, dentist, gym,
gas_station, car_wash, hotel, lodging

# Transport
bus_station, subway_station, train_station, airport, taxi_stand, parking

# Entertainment
movie_theater, museum, park, tourist_attraction, zoo, spa

# Other
church, school, university, library, post_office
```

---

## Minimal Request Examples

### Text Search
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'X-Goog-Api-Key: YOUR_KEY' \
  -H 'X-Goog-FieldMask: places.displayName,places.formattedAddress,places.location,nextPageToken' \
  -d '{"textQuery": "кава Київ", "pageSize": 10, "languageCode": "uk"}' \
  'https://places.googleapis.com/v1/places:searchText'
```

### Nearby Search
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'X-Goog-Api-Key: YOUR_KEY' \
  -H 'X-Goog-FieldMask: places.displayName,places.location,places.rating' \
  -d '{
    "locationRestriction": {
      "circle": { "center": {"latitude": 50.45, "longitude": 30.52}, "radius": 500 }
    },
    "includedTypes": ["cafe"]
  }' \
  'https://places.googleapis.com/v1/places:searchNearby'
```

### Autocomplete
```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -H 'X-Goog-Api-Key: YOUR_KEY' \
  -d '{"input": "Хреща", "languageCode": "uk", "regionCode": "UA"}' \
  'https://places.googleapis.com/v1/places:autocomplete'
```

### Place Details
```bash
curl \
  -H 'X-Goog-Api-Key: YOUR_KEY' \
  -H 'X-Goog-FieldMask: displayName,formattedAddress,rating,currentOpeningHours' \
  'https://places.googleapis.com/v1/places/ChIJifIePKtZwokRVZ-UdRGkZzs'
```

---

## TypeScript Pagination Helper

```typescript
const API_KEY = 'YOUR_KEY'
const BASE_URL = 'https://places.googleapis.com/v1'

interface PlaceResult {
  displayName: { text: string }
  formattedAddress: string
  location: { latitude: number; longitude: number }
}

async function searchAllPlaces(query: string): Promise<PlaceResult[]> {
  const results: PlaceResult[] = []
  let pageToken: string | undefined

  do {
    const body = {
      textQuery: query,
      pageSize: 20,
      languageCode: 'uk',
      ...(pageToken && { pageToken }),
    }

    const response = await fetch(`${BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.location,nextPageToken',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    results.push(...(data.places ?? []))
    pageToken = data.nextPageToken
  } while (pageToken)

  return results
}
```

---

## Billing Summary

| SKU | Approx Cost | Fields |
|---|---|---|
| Essentials | cheapest | id, name |
| Pro | medium | displayName, location, address, photos |
| Enterprise | expensive | hours, phone, rating, priceLevel |
| Enterprise + Atmosphere | most expensive | allowsDogs, etc. |

> Request only fields you actually use — billing is per field group, not per field.
> Use `*` wildcard in development only.

---

## React Native Library

For autocomplete UI in React Native use:
```bash
npm install react-native-google-places-autocomplete
```

```tsx
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'

const SearchInput = () => (
  <GooglePlacesAutocomplete
    placeholder="Search"
    onPress={(data, details) => {
      console.log(data.place_id)
      console.log(details?.geometry.location) // lat/lng
    }}
    query={{
      key: 'YOUR_API_KEY',
      language: 'uk',
    }}
    fetchDetails={true}
  />
)
```