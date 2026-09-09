# Emergency & Assistance (Phase 16)

Trip-scoped emergency hub at `/app/trips/[tripId]/emergency`.

## Product note

Phase 16 UI is **functional, not final**. A later Product Polish phase may redesign cards, layouts, and action presentation. Emergency architecture remains stable.

## Product concept

Travel Hub tool: **חירום ועזרה** (`emergency`).

This is a traveler-facing emergency hub — not a static phone list. It combines:

- Built-in official country emergency resources
- Collaborative trip-specific resources
- Contextual accommodation, documents, and phrasebook links
- User-triggered current location (ephemeral)

V1 uses **`DEFAULT_EMERGENCY_PACK_ID = "JP"`** directly. There is no `Trip.countryCode` field and no fake trip resolver.

## Built-in EmergencyPack

Static typed TS catalog:

- [`src/features/emergency/builtin/jp.ts`](../src/features/emergency/builtin/jp.ts)
- [`src/features/emergency/builtin/registry.ts`](../src/features/emergency/builtin/registry.ts)

Each `EmergencyResource` includes `sourceLabel`, `sourceUrl`, and `verifiedAt` (manual verification date — **not** live-checked at runtime).

Official V1 resources: police `110`, ambulance/fire `119`, JNTO Japan Visitor Hotline, Israeli Embassy Tokyo, Consular Section.

## Custom trip resources

MongoDB `TripEmergencyResource` — shared collaborative trip data.

Any TripMember (owner or member) may create, edit, and delete resources. `createdBy` is audit-only.

Categories: `insurance`, `medical`, `personal_contact`, `financial`, `transport`, `local_contact`, `other`.

CRUD is inline on `/emergency` (no dedicated sub-routes).

## TravelDocument integration

`TravelDocument.showInEmergency` (boolean, default `false`).

Owner toggles **הצג במסך חירום** in existing document create/edit metadata forms. Emergency page lists flagged documents only; file access uses existing authenticated document routes.

## Accommodation integration

Reuses `selectContextualAccommodation`. Shows **current stay only** (`variant === "current"`) with detail, Taxi Mode, and maps links. No accommodation duplication.

## Phrasebook integration

Curated emergency phrase ids link to existing `/language/[phraseId]` show-to-local routes. No duplicated Japanese text.

## Current location

Client-only `navigator.geolocation.getCurrentPosition` after explicit user tap. Coordinates are ephemeral (React state only) — never sent to server or persisted.

No reverse geocoding in Phase 16. Map links use shared [`buildGoogleMapsCoordinatesUrl`](../src/lib/maps/google-maps-url.ts).

## Offline readiness

EmergencyPack and phrase references are bundled static content suitable for Phase 18 trip snapshots. Custom resources and document files remain online-first in Phase 16.

## Maintenance

Update `verifiedAt` and official URLs in `jp.ts` when sources change. Document verification notes in this file.
