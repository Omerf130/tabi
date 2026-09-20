# Emergency & Assistance

Trip-scoped emergency hub at `/app/trips/[tripId]/emergency`.

## Destination identity

Official emergency numbers are resolved **only** from `Trip.destination.countryCode` (ISO 3166-1 alpha-2, uppercase at runtime).

There is **no** default country, **no** Japan fallback, and **no** inference from UI locale, travel language, timezone, currency, or display name.

If the destination is missing or the country is absent from the pinned dataset, the page shows a functional notice and **no** official `tel:` actions.

## Canonical data source (V1)

V1 uses the **Android Open Source Project Emergency Call Code database**:

- Upstream path: `packages/services/Telephony/ecc/input/eccdata.txt`
- Pinned git commit: recorded in [`scripts/vendor/aosp-ecc/PINNED_SOURCE.json`](../scripts/vendor/aosp-ecc/PINNED_SOURCE.json)
- Vendored snapshot: [`scripts/vendor/aosp-ecc/eccdata.txt`](../scripts/vendor/aosp-ecc/eccdata.txt)
- License note: [`scripts/vendor/aosp-ecc/AOSP_APACHE-2.0.txt`](../scripts/vendor/aosp-ecc/AOSP_APACHE-2.0.txt) (Apache 2.0, from Telephony package metadata)

Generated artifacts (bundled in the app, no network at page load):

- [`src/features/emergency/data/country-emergency-services.json`](../src/features/emergency/data/country-emergency-services.json)
- [`src/features/emergency/data/emergency-dataset-manifest.json`](../src/features/emergency/data/emergency-dataset-manifest.json)

Regenerate after updating the vendored source:

```bash
npm run generate:emergency-country-data
```

## Generation and filtering rules

The generator [`scripts/generate-emergency-country-data.ts`](../scripts/generate-emergency-country-data.ts) is deterministic.

**Supported ECC service types (V1):** `POLICE`, `AMBULANCE`, `FIRE` only.

**Excluded from user-facing output (not parsed into services):** `MARINE_GUARD`, `MOUNTAIN_RESCUE`, `MIEC`, `AIEC`, `TYPE_UNSPECIFIED`.

**Routing:**

- Rows with `routing: NORMAL` are **excluded** (non-emergency routing in AOSP).
- Rows with `routing: EMERGENCY` or **no** `routing` field are **included** (AOSP treats missing routing as emergency-eligible).

**`ecc_fallback`:** stored as source metadata on the country record only. It is **never** turned into a dialable number automatically.

**Phone validation:** short emergency codes (e.g. `112`, `911`, `110`) — not full E.164. Invalid numbers are dropped; only validated numbers produce `tel:` actions.

**Deduplication:** multiple ECC types on the same number collapse to one row:

- police + ambulance + fire → `general`
- ambulance + fire (no police) → `ambulance_and_fire`
- otherwise single-type rows where applicable

## Runtime

[`resolveCountryEmergencyServices`](../src/features/emergency/resolve-country-emergency-services.ts) loads the generated JSON and returns:

- `ready` — services for the destination country
- `missing_destination` — no usable `countryCode`
- `unsupported_country` — unknown code or empty service list

[`buildEmergencyViewModel`](../src/features/emergency/build-emergency-view-model.ts) assembles the page model (verified block, accommodation, documents, custom resources, phrase links).

## UI copy and trust

The verified section title is **“Emergency numbers for this destination”** (not “verified by Tabi”). A single footer note cites the AOSP Emergency Number Database and dataset revision/import metadata.

## Custom trip resources

MongoDB `TripEmergencyResource` — collaborative, trip-scoped contacts. Labeled **“Added by trip members”**; not presented as verified official numbers.

CRUD remains inline on `/emergency`. Any trip member may create, edit, and delete; `createdBy` is audit-only.

## Embassy and tourist hotlines

V1 does **not** include automatic embassy or nationality resolution. Tourist hotlines (e.g. JNTO) are **not** mixed into the AOSP ECC pipeline; a future manually reviewed supplements layer may add them.

## TravelDocument integration

`TravelDocument.showInEmergency` — owner toggles in document forms. Emergency lists flagged documents only.

## Accommodation integration

Reuses `selectContextualAccommodation` for **current stay only** with detail, Taxi Mode, and maps links.

## Phrasebook integration (G8)

Curated emergency phrase IDs use the semantic phrase-intent catalog. Preview labels use the **UI locale** (`Language.phrases.*`). Links go to `/language/[phraseId]` where G8 travel-language runtime applies. No separate emergency translation pipeline.

## Current location

Client-only geolocation after explicit user action. Ephemeral — not persisted on the server.

## Offline / PWA

Emergency dataset JSON is local/in-repo. Opening the emergency page does not call AOSP or other external emergency APIs.

## Maintenance

1. Update vendored `eccdata.txt` and `PINNED_SOURCE.json` with a new AOSP commit when refreshing data.
2. Run `npm run generate:emergency-country-data`.
3. Review generator QA output (country counts, discard reasons, JP/IT/US/GB/IL samples).
4. Run tests and commit generated JSON + manifest together with source changes.
