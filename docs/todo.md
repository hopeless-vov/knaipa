# TODO

## API Cost Optimization

- [x] Remove `editorialSummary` from FIELD_MASK → drops from Enterprise + Atmosphere ($40) to Enterprise ($35/1k)
- [x] Implement session tokens for autocomplete → Autocomplete Session Usage becomes Unlimited free
  - Generate token: `sessionTokenRef = useRef(crypto.randomUUID())`
  - Pass token in every `autocompletePlaces()` call
  - Pass same token in `fetchPlaceLocation()` call
  - Reset token after: suggestion selected / GPS used / input cleared
- [~] Move Enterprise fields to lazy load (Place Details on card open)
  - DECISION (2026-07): NOT doing this — product choice to keep rating + hours
    visible on the swipe deck cards. Main search stays Enterprise ($35/1k).
  - (Reference) would have removed from FIELD_MASK: `rating`, `userRatingCount`,
    `priceLevel`, `regularOpeningHours`, `currentOpeningHours` → Pro ($32/1k)
- [ ] Set hard quota limits in Google Cloud Console
  - Places API Text Search: ~50 requests/day
  - Place Details Photos: ~100 requests/day

## Google Places API

- [ ] Research `nearbySearch` endpoint as replacement for `searchText` for category browsing
  - Supports `includedTypes: string[]` — multiple categories natively
  - `locationRestriction` (strict) vs `locationBias` (hint)
  - `rankPreference: POPULARITY` more suitable for discovery
  - Limitation: max 20 results, no pagination — evaluate if acceptable
- [ ] Multi-category selection in filters UI
  - Depends on nearbySearch migration (searchText supports only single `includedType`)
