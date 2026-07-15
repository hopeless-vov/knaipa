# Google Places API (New) — Field SKU Reference

> Source: https://developers.google.com/maps/documentation/places/web-service/data-fields
> **Rule:** The highest-tier field in your FieldMask determines the SKU for the entire request.
> Example: one Enterprise field = entire request billed at Enterprise rate.

---

## SKU Tiers (cheapest → most expensive)

| Tier | Text Search | Nearby Search | Place Details | Free cap/mo |
|---|---|---|---|---|
| Essentials (IDs Only) | $0 | — | $0 | Unlimited |
| Essentials | $0 | — | $5/1k | 10,000 |
| Pro | $32/1k | $32/1k | $17/1k | 5,000 |
| Enterprise | $35/1k | $35/1k | $20/1k | 1,000 |
| Enterprise + Atmosphere | $40/1k | $40/1k | $25/1k | 1,000 |
| Place Details Photos | — | — | $7/1k | 1,000 |

---

## Fields by SKU Tier

### Essentials (IDs Only) — Free / Unlimited
| Field | Note |
|---|---|
| `id` | Place ID |
| `name` | Resource name (not display name) |
| `attributions` | Required attribution data |
| `nextPageToken` | Pagination (Text Search only) |
| `photos` | Photo references only (not the actual photo fetch) |

### Essentials
| Field |
|---|
| `addressComponents` |
| `addressDescriptor` |
| `adrFormatAddress` |
| `formattedAddress` |
| `location` |
| `plusCode` |
| `postalAddress` |
| `shortFormattedAddress` |
| `types` |
| `viewport` |

### Pro
| Field |
|---|
| `accessibilityOptions` |
| `businessStatus` |
| `containingPlaces` |
| `displayName` |
| `googleMapsLinks` |
| `googleMapsUri` |
| `iconBackgroundColor` |
| `iconMaskBaseUri` |
| `openingDate` |
| `primaryType` |
| `primaryTypeDisplayName` |
| `pureServiceAreaBusiness` |
| `subDestinations` |
| `timeZone` |
| `utcOffsetMinutes` |

### Enterprise
| Field |
|---|
| `currentOpeningHours` |
| `currentSecondaryOpeningHours` |
| `internationalPhoneNumber` |
| `nationalPhoneNumber` |
| `priceLevel` |
| `priceRange` |
| `rating` |
| `regularOpeningHours` |
| `regularSecondaryOpeningHours` |
| `userRatingCount` |
| `websiteUri` |

### Enterprise + Atmosphere — most expensive, avoid in main search
| Field |
|---|
| `allowsDogs` |
| `curbsidePickup` |
| `delivery` |
| `dineIn` |
| `editorialSummary` | ← **kutok currently uses this — triggers +Atmosphere billing** |
| `evChargeAmenitySummary` |
| `evChargeOptions` |
| `fuelOptions` |
| `generativeSummary` |
| `goodForChildren` |
| `goodForGroups` |
| `goodForWatchingSports` |
| `liveMusic` |
| `menuForChildren` |
| `neighborhoodSummary` |
| `outdoorSeating` |
| `parkingOptions` |
| `paymentOptions` |
| `reservable` |
| `restroom` |
| `reviews` |
| `reviewSummary` |
| `routingSummaries` |
| `servesBeer` |
| `servesBreakfast` |
| `servesBrunch` |
| `servesCocktails` |
| `servesCoffee` |
| `servesDessert` |
| `servesDinner` |
| `servesLunch` |
| `servesVegetarianFood` |
| `servesWine` |
| `takeout` |

---

## kutok Current FIELD_MASK Audit

| Field | SKU | Used for |
|---|---|---|
| `id` | Essentials (IDs Only) | place ID |
| `displayName` | Pro | card title |
| `formattedAddress` | Pro (Text Search) | address display |
| `location` | Pro (Text Search) | coordinates |
| `rating` | **Enterprise** | star rating on card |
| `userRatingCount` | **Enterprise** | review count filter |
| `photos` | Pro | photo references |
| `primaryType` | Pro | category label |
| `types` | Pro | highlights |
| `priceLevel` | **Enterprise** | price display |
| `editorialSummary` | **⚠️ Enterprise + Atmosphere** | `about` text on card |
| `regularOpeningHours` | **Enterprise** | hours fallback |
| `currentOpeningHours` | **Enterprise** | hours display |
| `addressComponents` | Pro (Text Search) | city/neighborhood |
| `nextPageToken` | Essentials (IDs Only) | pagination |

**Result: Enterprise + Atmosphere** — because of `editorialSummary`.  
**Fix:** Remove `editorialSummary` from main search → drops to **Enterprise** ($35 vs $40/1k).  
**Further optimization:** Move `rating`, `userRatingCount`, `priceLevel`, `regularOpeningHours`, `currentOpeningHours` to Place Details only (lazy load on card open) → main search drops to **Pro** ($32/1k).
