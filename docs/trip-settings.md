# Trip Settings

`/app/trips/[tripId]/settings` is the Trip **management** screen.

## Home vs Settings

| Surface | Role |
|---|---|
| **Trip Home** | Consumption — display useful contextual Trip information |
| **Trip Settings** | Management — configure Trip data the user controls |

Examples:

- Trip cover image: managed in Settings, displayed on Home
- Personal reminders: managed in Settings, relevant reminder displayed on Home

Future features should follow the same split rather than placing CRUD controls directly on Home.

## Current sections

1. **פרטי הטיול** — basic Trip information (read-only for now)
2. **תמונת הטיול** — owner-managed cover image
3. **מקומות לינה** — owner-managed accommodations (hidden from members)
4. **מסמכים** — owner-managed travel documents / Travel Wallet (hidden from members)
5. **תזכורות אישיות** — personal in-app reminders

## Personal reminders (Phase 8E)

Each reminder belongs to `tripId + userId`.

- Owner and Member can manage **only their own** reminders
- Reminder date must fall within the Trip date range
- In-app only — no push, email, SMS, or scheduled jobs in this phase

Home displays today's incomplete reminders during an active trip via `HomeReminderStrip.client.tsx`:

- Always shows the strip (`אין תזכורות חדשות` when empty)
- One reminder visible at a time; rotates every 5s when 2+ exist
- Click opens a view-only panel; management stays in Settings
- Before/after trip: empty strip only

Later Phase 22 still owns system-generated reminders, luggage automation, and push delivery.

## Accommodations (Phase 9)

Trip-scoped shared accommodations. Owner manages CRUD in Settings (`#accommodations`); members do not see the CRUD section.

Travelers access accommodations via **More → מקומות לינה** or directly at `/app/trips/[tripId]/accommodations`.

See [accommodation-model.md](accommodation-model.md) for schema, occupancy semantics, Taxi Mode, and authorization.

## Documents / Travel Wallet (Phase 10)

Trip-scoped documents (PDF + images) with metadata in MongoDB and bytes in private Blob storage.

- Owner manages CRUD in Settings (`#documents`)
- Members consume via the primary **Documents** tab and detail routes
- Files are never exposed as permanent Blob URLs; delivery uses an authenticated proxy with `Cache-Control: private, no-store`

See [travel-documents.md](travel-documents.md).

## Source layout

```
src/features/trips/settings/
  TripDetailsSection.tsx
  TripSettingsSections.module.scss
src/features/trips/reminders/
  actions.ts
  queries.ts
  reminder-domain.ts
  select-today-home-reminders.ts
  TripReminderSettings.tsx
src/features/accommodations/
  TripAccommodationSettings.tsx
src/features/documents/
  TripDocumentSettings.tsx
src/models/TripReminder.ts
src/models/Accommodation.ts
src/models/TravelDocument.ts
```
