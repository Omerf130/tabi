# Itinerary foundation

Phase 6 establishes how Tabi derives, identifies, and displays the calendar days of a Trip. Phase 7 adds Activities. The day-centric UX separates **trip overview**, **day workspace**, and **trip-wide management**.

See also [activity-model.md](activity-model.md).

## Three surfaces

| Surface | Route | Responsibility |
|---|---|---|
| Trip overview | `/app/trips/[tripId]/itinerary` | Read-only scan of all trip days |
| Day workspace | `/app/trips/[tripId]/itinerary/[date]` | Planning workspace for one day |
| Trip-wide management | `/manage/*`, `/transport`, `/accommodations`, `/documents`, … | Inventory and settings |

## One source of truth

Tabi does **not** duplicate entities per day.

- Activities, Accommodations, Transport, TravelDocuments, and TripReminders remain single persisted records.
- Day pages **compose** existing entities; they do not create shadow copies.
- No `TripDay` collection.

## Canonical trip dates

`Trip.startDate` and `Trip.endDate` are the **only** authority for which calendar days belong to a Trip.

- Stored as canonical `YYYY-MM-DD` strings
- Compared lexicographically for ordering
- Never parsed through local timezone for domain logic

## Derived days (no TripDay collection)

Days are **derived in memory** from the Trip date range:

```
startDate → startDate+1 → … → endDate  (inclusive)
```

## Day identity

Within a trip, a day is identified by its canonical date string:

```
2026-10-25
```

- Day number is 1-based from `startDate`
- Overview links and day routes use `/app/trips/[tripId]/itinerary/2026-10-25`
- Legacy `/itinerary?date=YYYY-MM-DD` redirects to `/itinerary/YYYY-MM-DD`

## Activity relationship

Activities reference:

```
tripId + date (YYYY-MM-DD) + order
```

Index:

```
{ tripId: 1, date: 1, order: 1 }
```

Activities are validated to fall within the Trip date range at write time.

## Accommodation occupancy semantics

An accommodation is visible on calendar day `D` when:

```
checkInDate <= D < checkOutDate
```

Check-in day is included. Check-out day is excluded.

Example: check-in Oct 25, check-out Oct 29 → visible Oct 25–28, not Oct 29.

## TravelDocument day relevance

A document appears on a Day page **only** when linked to a relevant entity:

| Link type | Day relevance rule |
|---|---|
| Activity | `activity.date === D` |
| Transport | `transport.departure.date === D` |
| Accommodation | occupancy rule above |

**Standalone documents** (no link) do **not** appear on Day pages. Upload date / `createdAt` is never used for day relevance.

Maximum one link target: `activityId` XOR `accommodationId` XOR `transportId`.

## Personal reminders

Trip reminders are scoped to:

```
tripId + userId + date + time + text
```

Both owners and members manage **only their own** reminders.

## Trip overview data model

`/itinerary` uses `DaySummaryViewModel` built from trip-level datasets:

- activities grouped by date
- transports grouped by departure date
- accommodations filtered in memory by occupancy
- linked documents counted by day relevance rules
- incomplete reminder indicator for the current user

Long trips (up to 180 days) use a fixed number of queries, not one query per day.

## Day workspace data model

`/itinerary/[date]` validates:

- `YYYY-MM-DD` format
- date within Trip inclusive range

Otherwise `notFound()`.

The day workspace loads only what that day needs:

- activities for the date
- transports departing on the date
- accommodations occupied on the date
- day-relevant linked documents
- current user's reminders for the date

Timeline order uses `mergeItineraryDayItems()` (manual activity order + transport insertion by departure time).

## Maximum trip duration

V1 limit: **180 inclusive days**.

## Timezone rules

| Concern | Approach |
|---|---|
| Calendar-date arithmetic | UTC-probed string math |
| “Today” while traveling | `getJapanCalendarDate()` using `Asia/Tokyo` |

## Temporal day state

Each day may be classified relative to Japan today: `past`, `today`, `future`.

## Source layout

```
src/features/trips/trip-days.ts
src/features/trips/calendar-date.ts
src/features/itinerary/
  routes.ts
  build-itinerary-overview.ts
  build-day-workspace.ts
  day-document-relevance.ts
  load-itinerary-trip-data.ts
  DayPageContent.tsx
  ItineraryPageContent.tsx
```
