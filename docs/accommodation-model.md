# Accommodation model

Phase 9 introduces trip-scoped accommodations. Phase 9B adds Smart Places.

See also [places-foundation.md](places-foundation.md).

## Data ownership

**Google-backed (`placeSource: "google"`):**

| Field | Stored? |
|---|---|
| `googlePlaceId` | yes (durable) |
| `checkInDate`, `checkOutDate`, `bookingReference`, `notes` | yes (Tabi-owned) |
| Google name/address/Maps URI | **no** — resolved at read time |

**Manual (`placeSource: "manual"`):**

| Field | Stored? |
|---|---|
| `manualName`, `manualCity` | required |
| `manualNameJapanese`, addresses, `manualGoogleMapsUrl` | optional |
| trip fields | yes |

**Legacy records** (Phase 9 before 9B): may have `name`, `city`, etc. without `placeSource`. Treated as manual via fallback — no data loss.

## Occupancy semantics

```
checkInDate <= calendarDate < checkOutDate
```

`checkOutDate > checkInDate` (minimum one night).

## Authorization

| Role | Create / edit / delete | View / Maps / Taxi |
|---|---|---|
| Owner | yes (Settings) | yes |
| Member | no | yes |

## Routes

- Settings CRUD: `/app/trips/[tripId]/settings#accommodations`
- Traveler list/detail/taxi: `/app/trips/[tripId]/accommodations/...`

## Taxi Mode

Uses resolved display identity:

- Google-backed: Japanese name/address from Place Details when available
- Manual: `manualNameJapanese` / manual addresses
- No AI translation

## Source layout

```
src/models/Accommodation.ts
src/features/accommodations/
src/features/places/
```
