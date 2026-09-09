# Offline and PWA (future)

Phase 0 does not add a service worker, IndexedDB, caching libraries, or installability.

Decisions now must not make that work harder later.

## Categories (later)

**Offline core** (cache last known trip payload): itinerary, activities, accommodation, addresses, passes, phrasebook (static catalog + favorites), emergency pack + custom resources snapshot, packing, reminders, last known weather, last known currency rates.

**Explicit downloads:** PDFs, tickets, QR images, vouchers — user-initiated, stored privately, not assumed in the core cache.

**Online-first:** live weather, live FX, Google Maps, uploads/sync.

## Architecture constraints

- Trip data should stay **fetchable as trip-scoped records** (JSON-shaped documents keyed by `tripId`), not only as live RPC that cannot be snapshotted.
- Simple mutations (complete activity, check packing item) should be modelable as small commands so they can be queued locally and replayed when online.
- Do not rely on public CDN URLs for documents; offline copies must come from authorized downloads.
- Travel documents (Phase 10) already use a same-origin authenticated proxy (`/documents/[documentId]/file`) with `private, no-store` caching — future explicit downloads should extend that pattern, not expose Vercel Blob URLs to the client.
- App Router URLs under `/app/trips/[tripId]/...` are cache-friendly later; keep trip identity in the path.
- Do not introduce a PWA plugin now that would fight a later, deliberate offline design.

PWA installability is Phase 23. Offline foundation is Phase 13.
