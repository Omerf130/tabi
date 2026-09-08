# Itinerary foundation

Phase 6 establishes how Tabi derives, identifies, and displays the calendar days of a Trip. Phase 7 adds Activities; Phase 7B presents them in a single-open day accordion with inline owner editing. See [activity-model.md](activity-model.md).

## Canonical trip dates

`Trip.startDate` and `Trip.endDate` are the **only** authority for which calendar days belong to a Trip.

- Stored as canonical `YYYY-MM-DD` strings
- Compared lexicographically for ordering
- Never parsed through local timezone for domain logic

## Derived days (no TripDay collection)

Tabi does **not** persist one MongoDB document per calendar day.

Days are **derived in memory** from the Trip date range:

```
startDate → startDate+1 → … → endDate  (inclusive)
```

Benefits:

- Empty days require no stored rows
- Extending trip dates automatically exposes new days
- No sync problem between Trip dates and a day table

## Day identity

Within a trip, a day is identified by its canonical date string:

```
2026-10-25
```

- Day number is 1-based from `startDate`
- DOM anchor: `id="day-2026-10-25"` (stable; not used for server routing)
- Deep link: `/app/trips/[tripId]/itinerary?date=2026-10-25`

## Future Activity relationship

Phase 7 Activities reference:

```
tripId + date (YYYY-MM-DD) + order
```

Index:

```
{ tripId: 1, date: 1, order: 1 }
```

Activities are validated to fall within the Trip date range at write time. Full rules: [activity-model.md](activity-model.md).

## Optional sparse day metadata (later)

If day-level title/city/notes become necessary, use **sparse documents** keyed by `(tripId, date)` with a unique compound index — not one document per calendar day by default.

Phase 6 persists no day metadata.

## Maximum trip duration

V1 limit: **180 inclusive days**.

Enforced on trip creation (Zod) and defensively in `getInclusiveDateRange()`.

## Timezone rules

Two distinct concepts:

| Concern | Approach |
|---|---|
| Calendar-date arithmetic | UTC-probed string math (`addCalendarDays`, range generation) |
| “Today” while traveling | `getJapanCalendarDate()` using `Asia/Tokyo` (`TRIP_CALENDAR_TIMEZONE`) |

Hebrew display uses `Intl` with `timeZone: "UTC"` from parsed date parts so the stored day never shifts.

## Temporal day state

Each day may be classified relative to Japan today:

- `past`
- `today`
- `future`

Pure utility: `getTripDayTemporalState(date, todayJapan)` — injectable for tests.

## Date-change policy (future)

When trip date editing is implemented:

- **Extend:** new days appear automatically (derived)
- **Shorten or shift:** **block** the change if Activities or sparse day metadata exist outside the new range; never silently delete orphaned data

## Itinerary presentation (Phase 7B)

- All trip days visible as compact collapsed rows
- At most one expanded day; activities shown only when expanded
- Default expanded day: first / Japan today / last (by trip phase), overridable by valid `?date=`
- User accordion toggles are client-local (no history entry per toggle)
- Owner inline create/edit inside expanded day; members read-only

## Phase 6 scope

Implemented:

- Derived day list on `/app/trips/[tripId]/itinerary`
- Hash-addressable day section ids
- Today badge via temporal state

Phase 7/7B adds Activities and accordion UX — see [activity-model.md](activity-model.md).

Not implemented (Phase 8+):

- Activity status / completion
- Day metadata persistence/editing
- Programmatic scroll-to-day
- Trip date editing

## Source layout

```
src/features/trips/trip-days.ts       # domain utilities
src/features/trips/calendar-date.ts   # low-level date primitives
src/features/itinerary/               # view model + server UI
```
