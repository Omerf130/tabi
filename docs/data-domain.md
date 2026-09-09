# Data and domain

MongoDB + Mongoose are used from Phase 2. Trip collections are still later.

## Core entities

- **User** — platform account (`name`, `email`, `passwordHash`, `role`). See [auth.md](auth.md).
- **Session** — hashed session token, `userId`, `expiresAt` (TTL).
- **Trip** — workspace: `name`, `startDate`, `endDate` (YYYY-MM-DD strings), `createdBy`. See [trips.md](trips.md).
- **TripMember** — join of User ↔ Trip with trip role (`owner` | `member`). Unique on `(tripId, userId)`.
- **TripInvitation** — link-based invite (`tripId`, `tokenHash`, `role`, `createdBy`, `expiresAt`, `usedAt`, `usedBy`, `revokedAt`). Raw token never stored.

## Trip-owned data (always scoped by trip)

Do not store the whole trip application in one MongoDB document. Each domain below should become its own collection (or small cluster of collections) when its phase arrives, and every record must include `tripId`.

- Days — **derived** from Trip dates in Phase 6; optional sparse `(tripId, date)` metadata later if needed. See [itinerary-foundation.md](itinerary-foundation.md).
- **Activities** — Phase 7; `tripId + date (YYYY-MM-DD) + order`. See [activity-model.md](activity-model.md).
- **Accommodations** — Phase 9; separate collection scoped by `tripId`. See [accommodation-model.md](accommodation-model.md).
- **TravelDocument** — Phase 10; metadata in MongoDB, file bytes in private Blob. See [travel-documents.md](travel-documents.md).
- **TripListItem** — Phase 11; collaborative trip checklists (`listType` + `order` + `isCompleted`), scoped by `tripId`. Default templates seed lazily via `Trip.initializations.listsV1`.
- **Transport** — Phase 14; trip-scoped segments (`flight`, `train`, `bus`, `ferry`, `car`, `taxi`) with local endpoint date/time/timezone. See [transport.md](transport.md).
- **PhraseFavorite** — Phase 15; personal phrase favorites keyed by `(userId, targetLanguage, phraseId)`. Phrasebook content itself is static TS data, not MongoDB. See [language.md](language.md).
- **TripEmergencyResource** — Phase 16; collaborative trip emergency contacts/resources scoped by `tripId`. Built-in official data is static TS `EmergencyPack`. See [emergency.md](emergency.md).
- Restaurants
- Passes
- Reminders
- Packing
- Shopping / gifts
- Memories / journal
- Emergency information
- Trip settings (if not kept on Trip itself)

## Rules

1. Trip-owned queries always filter by `tripId` derived from membership, not from an unchecked client field.
2. Users do not own itinerary rows directly; the Trip does. Access is via TripMember.
3. Exact schemas are deferred. When a phase implements a domain, add indexes for `tripId` (and unique membership on `(tripId, userId)`).
4. Do not hardcode travelers, hotels, itinerary dates, or activities into reusable app code. Japan 2026 content is Trip-owned data (Phase 28). V1 features may still assume Japan (JPY, Suica, trains, and similar).
