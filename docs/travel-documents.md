# Travel Documents (Travel Wallet)

Phase 10 introduces trip-scoped travel documents stored as metadata in MongoDB and file bytes in Vercel **Private Blob** storage.

## Product surfaces

| Surface | Path | Access |
|---|---|---|
| Travel Wallet (consumption) | `/app/trips/[tripId]/documents` | `requireTripMember` |
| Document detail | `/app/trips/[tripId]/documents/[documentId]` | `requireTripMember` |
| Secure file proxy | `/app/trips/[tripId]/documents/[documentId]/file` | `requireTripMember` |
| Management | `/app/trips/[tripId]/settings#documents` | `requireTripOwner` |

Documents live on the primary navigation tab. They are **not** duplicated in More / Travel Hub.

## TravelDocument model

Collection: `TravelDocument`

```typescript
{
  tripId: ObjectId,
  category: "flight" | "accommodation" | "train" | "ticket" | "insurance" | "reservation" | "transport" | "other",
  title: string,              // trim, 1–120
  description?: string,       // max 500
  file: {
    pathname: string,         // canonical durable blob key
    contentType: string,
    sizeBytes: number,
    originalFilename?: string
  },
  activityId?: ObjectId,
  accommodationId?: ObjectId,
  createdAt,
  updatedAt
}
```

Rules:

- `tripId` required on every query
- At most **one** contextual link: `activityId` **or** `accommodationId`, never both (enforced in Zod + Mongoose)
- No Blob URL stored in MongoDB
- No file bytes/base64 in MongoDB
- No Google Places display fields copied into the document
- No `relevantDate` field

Index: `{ tripId: 1, category: 1, createdAt: -1 }`

## Private Blob architecture

- Store: existing Vercel Private Blob (`access: "private"`)
- Path pattern: `trips/{tripId}/documents/{documentId}` with random suffix when supported
- MongoDB stores `file.pathname` only
- Browser never receives a permanent Blob URL
- Feature-specific storage helper: `src/features/documents/blob-storage.ts`
- Trip Cover storage is **not** refactored in this phase

## Allowed files

- `application/pdf`
- `image/jpeg`
- `image/png`
- `image/webp`
- Max **15 MB**, min **> 0 bytes**
- Server validates magic bytes / signatures; declared MIME alone is not trusted

## Authorization

All lookups use compound scope `{ _id: documentId, tripId }`.

| Action | Guard |
|---|---|
| List / detail / open file | `requireTripMember` |
| Create / edit metadata / replace / delete | `requireTripOwner` |

Wrong-trip or invalid IDs return normal not-found behavior without leaking existence.

## Lifecycles

### Create (owner)

1. Validate metadata + file + optional link (same trip)
2. Generate document `ObjectId`
3. Upload private blob
4. Create Mongo record
5. On DB failure: best-effort delete uploaded blob
6. Revalidate `/documents` and `/settings`

### Edit metadata (owner)

Metadata only — blob storage is untouched.

### Replace file (owner)

Separate action:

1. Validate replacement file
2. Upload new private blob
3. Update Mongo `file` metadata
4. On DB failure: delete new blob
5. On DB success: best-effort delete old blob (failure does not roll back)

### Delete (owner)

1. Delete Mongo record
2. Best-effort delete blob
3. Revalidate routes

## Contextual linking

- `activityId` → `Activity._id` validated with `{ _id, tripId }`
- `accommodationId` → `Accommodation._id` validated with `{ _id, tripId }`
- Activity / Accommodation schemas and delete flows are **not** modified
- Stale links remain on the document; read models resolve links and treat missing entities as unlinked

Display uses:

- Activity title + date + type (read-time)
- Accommodation identity via `resolveAccommodationIdentity()` (read-time, not persisted)

## Secure file delivery

Route: `/app/trips/[tripId]/documents/[documentId]/file`

Headers:

- `Content-Type`: stored/detected MIME
- `Cache-Control: private, no-store`
- `X-Content-Type-Options: nosniff`
- `Content-Disposition`: `inline` by default; `?download=1` → `attachment`

Missing blob → `notFound()` without storage diagnostics.

## Deferred (Phase 10)

Offline caching, OCR, version history, member upload, search, orphan cleanup jobs, DOCX/XLSX/archives.

## Future offline considerations

When offline document access arrives, files must continue to flow through authenticated same-origin proxy routes with explicit cache policy — not permanent Blob URLs exposed to the client. See [offline-pwa.md](offline-pwa.md).

## Source layout

```
src/models/TravelDocument.ts
src/features/documents/
  constants.ts
  schemas.ts
  validate-travel-document-file.ts
  blob-storage.ts
  document-domain.ts
  queries.ts
  actions.ts
  DocumentsPageContent.tsx
  DocumentDetailContent.tsx
  TripDocumentSettings.tsx
src/app/app/trips/[tripId]/documents/
src/app/app/trips/[tripId]/documents/[documentId]/
src/app/app/trips/[tripId]/documents/[documentId]/file/route.ts
```
