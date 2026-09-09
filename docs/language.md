# Language / Phrasebook (Phase 15)

Trip-scoped Travel Phrasebook at `/app/trips/[tripId]/language`.

## Product note

Phase 15 UI is **functional, not final**. A later Product Polish phase may redesign cards, typography, and show-to-local presentation. The language-neutral pack architecture and favorites model remain stable.

## Product concept

Travel Hub tool: **שפה ותקשורת** (`language`).

V1 content is **Hebrew → Japanese** (`he-ja`). The architecture is language-neutral so future packs (e.g. `he-it`, `he-el`) can register without rebuilding the feature.

This is **not** a translator. V1 excludes AI translation, TTS, audio, OCR, and custom user phrases.

## Content storage

Built-in phrasebook packs live as typed static TypeScript catalogs:

- [`src/features/language/builtin/he-ja.ts`](../src/features/language/builtin/he-ja.ts) — ~58 curated phrases across 8 categories
- [`src/features/language/builtin/registry.ts`](../src/features/language/builtin/registry.ts) — pack lookup

V1 uses `DEFAULT_PHRASEBOOK_PACK_ID = "he-ja"` directly. There is **no** trip-level language resolver and **no** `Trip.targetLanguage` field yet.

Each phrase includes:

- `sourceText` (Hebrew)
- `targetText` (Japanese)
- `pronunciationLatin` (romaji, secondary)
- `pronunciationSource` (Hebrew phonetic guide, primary for travelers)
- optional `searchKeywords`

## Routes

| Surface | Path | Access |
|---|---|---|
| Phrase list | `/app/trips/[tripId]/language` | `requireTripMember` |
| Category filter | `?category=transport` etc. | same |
| Favorites filter | `?favorites=1` | same |
| Show-to-local detail | `/app/trips/[tripId]/language/[phraseId]` | same; 404 for invalid ids |

Detail UX priority: **targetText → pronunciationSource → pronunciationLatin → sourceText**.

## Search

Client-side instant filter on a precomputed `searchBlob` (Hebrew, Japanese, romaji, phonetics, category label, keywords). No server search route in V1.

## Favorites

MongoDB `PhraseFavorite` collection:

- Unique index: `(userId, targetLanguage, phraseId)`
- Personal to the user; shared across trips for the same target language
- `targetLanguage` is derived server-side from the pack (`ja` for `he-ja`)
- Toggle via server action with `requireUser` + `requireTripMember`

## Travel Hub

**שפה ותקשורת** is active under **עוד** and links to `/language`.

## Offline (future)

Static catalog ships with the app bundle. Favorites are small MongoDB records and are online-first in V1. Future offline work can cache the default pack payload per trip snapshot.
