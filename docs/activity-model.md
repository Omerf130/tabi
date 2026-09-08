# Activity model

Phase 7 introduces **Activities** — trip-owned itinerary items keyed by calendar date and manual display order. Phase 7B refines presentation into a single-open day accordion with inline owner editing.

## Identity and scope

Every Activity belongs to exactly one Trip:

```
tripId + date (YYYY-MM-DD) + order
```

- `tripId` — MongoDB ObjectId (required, indexed)
- `date` — canonical `YYYY-MM-DD` string within the Trip date range
- `order` — non-negative integer; **display order only** (not derived from `startTime`)

There is no `status` field in Phase 7. Completion / “done” states are deferred to Phase 8.

## Schema fields

| Field | Type | Notes |
|---|---|---|
| `tripId` | ObjectId | Required |
| `date` | string | Valid calendar date within Trip range |
| `title` | string | 1–120 chars, trimmed |
| `type` | enum | See activity types below |
| `order` | number | ≥ 0 |
| `startTime` | string? | `HH:mm` wall clock, optional |
| `endTime` | string? | Requires `startTime`; `endTime >= startTime`; no overnight ranges |
| `locationName` | string? | ≤ 200 chars |
| `address` | string? | ≤ 500 chars |
| `notes` | string? | ≤ 2000 chars |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

## Activity types

`attraction`, `transport`, `restaurant`, `hotel`, `freeTime`, `shopping`, `other`

Hebrew labels and icons live in `src/features/itinerary/activity-types.ts` and `activity-type-icons.ts`.

## Indexes

```
{ tripId: 1, date: 1, order: 1 }
```

## Display sort

Activities are **never** sorted by `startTime`. Display order is:

1. `order` ascending
2. `createdAt` ascending
3. `_id` ascending (stable tie-break)

The itinerary page loads **one query per trip** (`listActivitiesForTrip`) and groups by date in memory.

## Ordering rules

### Create

Appended to the destination day: `order = max(existing orders) + 1` (or `0` if empty).

### Reorder (same day)

Client sends `{ tripId, activityId, direction: "up" | "down" }`. Server finds the neighbor in display order and **transactionally swaps** `order` values. No client-supplied order integers.

### Move between days

Changing `date` on update appends to the new day (`max+1`). Same date preserves `order`. Source day is **not** compacted. UI exposes move via **העברה ליום אחר** secondary action (not ordinary edit form).

### Delete

Hard delete. Remaining activities keep their `order` values (gaps allowed).

## Time rules (Phase 7)

- Stored as `HH:mm` strings only (`09:30`, `23:59`)
- `endTime` requires `startTime`
- If both set: `endTime >= startTime`
- **No cross-midnight** ranges in Phase 7

## Authorization

| Action | Requirement |
|---|---|
| View itinerary + activities | Trip member (`requireTripMember`) |
| Create / edit / delete / reorder / move | Trip owner (`requireTripOwner`) |

Members see the same accordion navigation; owner controls are presentation-only hidden.

## Itinerary UX (Phase 7B)

### Day accordion

- All trip days visible as compact collapsed rows
- At most **one** expanded day at a time; zero expanded is valid
- Activity count on collapsed rows from grouped in-memory data
- Activities render only inside the expanded day

### Default expanded day

On load (server-side):

1. Valid `?date=` within trip → that day
2. Else before trip → `startDate`
3. Else during trip → Japan today (`Asia/Tokyo`)
4. Else after trip → `endDate`

User expand/collapse is **client local state** — no router history entry per toggle.

### Deep linking

```
/app/trips/[tripId]/itinerary?date=2026-10-21
```

`id="day-YYYY-MM-DD"` remains a stable DOM anchor only. Hash fragments are not read server-side.

### Inline owner editing

- **Create:** `+ הוספת פעילות` inside expanded day; date locked to that day
- **Edit:** replaces activity row inline; date not shown
- **Move:** separate compact day picker via **העברה ליום אחר**
- **Reorder/delete:** inline secondary actions row under **פעולות**
- One active editor at a time; dirty forms require confirmation before discard
- Mutations return `{ ok }` + `revalidatePath`; client calls `router.refresh()` — no page navigation

## Routes

| Path | Purpose |
|---|---|
| `/app/trips/[tripId]/itinerary?date=` | Main itinerary accordion |
| `/app/trips/[tripId]/itinerary/activities/new` | Redirect stub → itinerary `?date=` |
| `/app/trips/[tripId]/itinerary/activities/[activityId]/edit` | Redirect stub → itinerary `?date={activity.date}` |

Normal product UX never links to the redirect stubs.

## Trip date shortening (future)

When trip date editing arrives, **block** changes that would orphan Activities outside the new range. Do not silently delete or hide out-of-range rows. Phase 7 validates date on every write but does not implement trip date mutation.

## Source layout

```
src/models/Activity.ts
src/features/itinerary/
  create-activity.ts
  update-activity.ts
  delete-activity.ts
  reorder-activity.ts
  queries.ts
  actions.ts
  ItineraryDayAccordion.tsx
  ActivityForm.tsx
  ActivityRow.tsx
  ActivityRowActions.tsx
  ActivityMovePanel.tsx
  resolve-initial-itinerary-day.ts
```

See also [itinerary-foundation.md](itinerary-foundation.md) for derived days.
