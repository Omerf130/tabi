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
  googlePlaces.server.ts          # server-only fetch + normalization
  placeSession.ts                 # UUID session tokens
  use-place-autocomplete-search.ts # reusable client autocomplete lifecycle
  place-autocomplete-race.ts      # stale-response guard
  PlaceSearchField.tsx            # reusable client search UI
  schemas.ts                      # API request validation
```

Server route handlers:

- `POST /app/api/places/autocomplete` — trip-scoped lodging search (Accommodation)
- `POST /app/api/places/resolve` — trip-scoped lodging resolve (Accommodation)
- `POST /app/api/places/destination/autocomplete` — account-level geographic destination search (Create Trip wizard)
- `POST /app/api/places/destination/resolve` — account-level geographic destination resolve (Create Trip wizard)

Destination routes require authenticated user only (no `tripId`). They reuse `autocompleteGeographicPlaces`, `fetchPlaceGeographyDetails`, and `isGeographicWeatherPlace` from the shared Places layer.

## Autocomplete focus fix

The search input must **never** be disabled while autocomplete requests are loading.

- Root cause: `disabled={disabled || isPending}` removed the input from the tab order and caused focus loss on mobile and desktop.
- Fix: loading is visual-only (`aria-busy`, subtle spinner). The input stays `disabled={disabled}`.
- Request lifecycle lives in `usePlaceAutocompleteSearch` (debounce, min length, abort + request-id race protection).
- `PlaceSearchField` owns UI only: input, listbox, keyboard, selection preview, attribution.

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

- Autocomplete: `includedRegionCodes: ["jp"]`, `includedPrimaryTypes: ["lodging"]` for Accommodation (default when omitted)
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

## Reuse: PlaceSearchField props

| Prop | Purpose |
|---|---|
| `includedPrimaryTypes?` | Override Google primary types (Accommodation default: `["lodging"]`) |
| `placeholder?` | Input placeholder |
| `selectedPreviewLabel?` | Optional label above selected-place preview |

Autocomplete API accepts optional `includedPrimaryTypes`; when omitted, server defaults to lodging types for backward-compatible Accommodation behavior.

## Future Activity integration (not implemented yet)

**Architecture decision:** Google-backed Activities will persist a **minimal selected-place snapshot**, not `googlePlaceId` alone.

Planned durable fields:

```
placeSource: "google" | "manual"
googlePlaceId?
locationName?
address?
city?
country?
latitude?
longitude?
googleMapsUrl?
```

Reason: a Google Place is selected once; Tabi should retain enough location data for navigation, show-to-driver, automatic weather, and future routing/distance features without a new Place Details request every time the Activity is consumed.

Exact Google field mask and schema validation will be implemented in the next Activity phase.

## Expected API usage (one accommodation entry)

- Typing: a small number of autocomplete requests within one session token
- Selecting: **one** terminating Place Details request
- Saving dates/notes: **zero** additional Google requests
- Viewing traveler detail later: up to two cached Place Details reads (`en` + `ja`) per `googlePlaceId`

## Place Images (shared foundation)

`src/features/place-images/` is the **only** Google Place photo pipeline for Tabi.

### Architecture

```
Entity (Activity / Accommodation) with googlePlaceId
  → entity-scoped photo route
  → servePlacePhotoResponse()
  → Place Details (photos only)  [metadata, display time]
  → Place Photos (New) media      [lazy, when browser requests image]
  → proxied bytes to client
```

Shared modules:

- `google-place-photos.server.ts` — metadata + media fetch (server-only)
- `get-place-photo-metadata.ts` — request-scoped metadata dedupe
- `get-place-photo-presentation.ts` — view-model shape for UI (`photoHref`, `hasPhoto`, attributions)
- `serve-place-photo.ts` — shared proxy handler
- `PlaceImage.tsx` / `PlaceImageAttribution.tsx` — client fallback + attribution
- `build-place-photo-href.ts` — entity-scoped href builders

Entity-scoped routes (never open `placeId` proxies):

- `GET /app/trips/[tripId]/activities/[activityId]/photo`
- `GET /app/trips/[tripId]/accommodations/[accommodationId]/photo`

### Billing model (approved V1)

| Step | Google SKU | Free allowance |
|---|---|---|
| Photo metadata (`photos` field mask) | Place Details Essentials (IDs Only) | Unlimited |
| Photo media | Place Details Photos (Place Photos New) | 1,000/month, then $7 / 1,000 |

Photo resolution happens at **display time only**. Activity and Accommodation create/edit Place Details field masks are unchanged (no `photos` at selection time).

### Approved V1 usage limits

Conservative product budget:

- **Trip Home (future phase):** NOW + UP NEXT + Tonight accommodation only (max **3** visible Google place images)
- **Today's Plan:** textual timeline only — do not eagerly load photos for all activities
- Lazy `<img loading="lazy">` — media fetched only when the browser requests the entity photo route
- No SSR media byte prefetch

### Caching and persistence

**Do not persist:**

- photo resource names
- photo URIs
- author attributions
- image binary / base64

**Not allowed:**

- MongoDB photo fields (existing `googlePlaceId` is sufficient)
- Vercel Blob copies of Google photos
- Cross-request / durable application caches of photo names (removed legacy `placePhotoCache`)

**Allowed:**

- Request-scoped dedupe by `googlePlaceId` within one server render/request
- Conservative proxy response headers: `Cache-Control: private, no-store`

### Representative photo rule

Use `photos[0]` only. No galleries, randomization, or rotation.

### Fallback

Google-backed + photo → image. All other cases (manual place, no photo, Google error, 403 quota, 429, expired name) → Tabi product placeholder via `PlaceImage` without breaking the parent page.

### Attribution

If Google returns non-empty `authorAttributions`, the UI must display them wherever the image appears. `PlacePhotoPresentation` carries attribution data alongside `photoHref`. Reuse `GooglePlacesAttribution` for Powered by Google when appropriate.

### Security

- `GOOGLE_PLACES_API_KEY` remains server-only
- Routes require trip membership and validate entity ownership server-side
- Browser never receives API key or keyed Google media URLs
- Rate limiting reuses Places per-user limits on photo routes
