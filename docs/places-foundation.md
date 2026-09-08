# Smart Places foundation

Phase 9B introduces a reusable Google Places layer under `src/features/places/`.

## Product principle

**Google knows what the place is; Tabi knows what the traveler is doing there.**

- Google provides place identity and localized presentation data at read/selection time.
- Tabi stores trip-owned context: dates, booking reference, notes.
- For Google-backed accommodations, only `googlePlaceId` is stored durably.

## Architecture

```
src/features/places/
  googlePlaces.server.ts   # server-only fetch + normalization
  placeSession.ts          # UUID session tokens
  PlaceSearchField.tsx     # reusable client search UI
  schemas.ts               # API request validation
```

Server route handlers:

- `POST /app/api/places/autocomplete`
- `POST /app/api/places/resolve`

## Session token lifecycle

1. Client generates one UUID v4 when a search session begins.
2. The same token is reused for debounced autocomplete requests.
3. Selecting a suggestion triggers **one** Place Details request with that token (session terminates).
4. Submit stores only `googlePlaceId` — **no second Place Details on save**.
5. A fresh UUID is generated for the next search.

## Data ownership

| Stored on Accommodation | Source |
|---|---|
| `googlePlaceId` | Google (durable) |
| `checkInDate`, `checkOutDate`, `bookingReference`, `notes` | Tabi |
| `manualName`, `manualCity`, … | Manual fallback only |

Google display fields (name, address, Maps URI) are resolved at selection preview and traveler read time via `getPlaceDisplayForTraveler()`, with a short-lived in-memory cache (1 hour) keyed by `placeId + languageCode`.

Legacy Phase 9 fields (`name`, `city`, …) remain readable for backward compatibility and are treated as manual identity when `placeSource` is absent.

## Japan configuration

- Autocomplete: `includedRegionCodes: ["jp"]`, `includedPrimaryTypes: ["lodging"]` for Accommodation
- Search language: `en` for readable suggestions
- Resolve/read Japanese presentation: `languageCode: "ja"` on Place Details

## Security

- `GOOGLE_PLACES_API_KEY` is server-only
- Never expose the key to the browser or client bundles
- Autocomplete/resolve require authenticated trip **owner**

## Attribution

When Google Places data is shown without an embedded map, display **Powered by Google** in:

- Autocomplete suggestion panel
- Selected place preview in Settings
- Traveler accommodation detail (google-backed)

## Future reuse

Other place-based features (restaurants, attractions, stations) should import `PlaceSearchField` and `googlePlaces.server.ts` with different `includedPrimaryTypes`.

## Expected API usage (one accommodation entry)

- Typing: a small number of autocomplete requests within one session token
- Selecting: **one** terminating Place Details request
- Saving dates/notes: **zero** additional Google requests
- Viewing traveler detail later: up to two cached Place Details reads (`en` + `ja`) per `googlePlaceId`
