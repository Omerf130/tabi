# Trip Home

Phase 8 transforms `/app/trips/[tripId]` into a lifecycle-aware traveler dashboard derived from existing Trip and Activity data.

## Lifecycle

Trip phase uses Japan calendar date (`getJapanCalendarDate`, `Asia/Tokyo`):

| Phase | Condition |
|---|---|
| `upcoming` | `todayJapan < startDate` |
| `active` | `startDate <= todayJapan <= endDate` |
| `completed` | `todayJapan > endDate` |

Implemented via [`getTripPhase`](../src/features/trips/trip-phase.ts).

## Home states

### Before trip

- Integrated hero with countdown
- **Daily Itinerary Summary:** Day 1 preview (`היום הראשון`) from `startDate` activities
- Empty Day 1: `היום הראשון עדיין מחכה לתכנון`
- CTA → `/itinerary?date={startDate}`

### During trip

- Compact hero with current day context
- **Daily Itinerary Summary:** condensed timeline of today (max 4 activities)
- **Now** / **הבא בתור** emphasis integrated into timeline
- Untimed activities shown as `ללא שעה`
- Empty today: `היום עדיין פנוי`
- CTA → `/itinerary?date={todayJapan}`

### After trip

- Status: `הטיול הסתיים`
- Trip date range
- CTA → `/itinerary` (defaults to last day via existing resolver)
- **No daily itinerary preview**
- **No Memories link in Phase 8** — added when Memories feature ships

## Japan time semantics

| Concern | Utility |
|---|---|
| Calendar today | `getJapanCalendarDate()` |
| Wall clock now | `getJapanWallClockTime()` → `HH:mm` in Japan |

Activity times are local Japan clock strings compared lexicographically via `compareWallClockTimes`.

## Now algorithm

An Activity is **Now** only when:

- It has `startTime` **and** `endTime`
- `startTime <= nowJapan < endTime` (end exclusive)

**Never Now:**

- Untimed activities
- Start-only activities (no invented duration)

If multiple match, earliest by start time, then order, then id.

## Next Up algorithm

Among today's **timed** activities:

1. Exclude finished:
   - With `endTime`: `now >= endTime`
   - Start-only: `now > startTime`
2. Exclude current Now activity
3. Sort by `startTime`, then `order`, then `id`
4. First = Next Up

Untimed activities never appear as Next Up.

## Untimed activities

Included in the daily itinerary timeline preview as `ללא שעה`. Never Now or Next Up.

## Query strategy

- **Upcoming trip:** `listActivitiesForTripDay(tripId, startDate)` — one indexed query
- **Active trip:** `listActivitiesForTripDay(tripId, todayJapan)` — one indexed query
- **Completed trip:** no Activity query

## Server/client boundary

Fully server-rendered. Time is a request snapshot; no client timers in Phase 8.

## Phase 8 boundaries

Not included:

- Weather (Phase 15)
- Transport / pass widgets
- Reminders (Phase 22)
- Activity completion status field
- Memories link on post-trip Home
- Fake widgets or placeholder cards

## Phase 8B/8D/8E visual presentation

Home structure:

1. **Trip Hero** — cover, identity, lifecycle; integrated countdown (before trip)
2. **Reminder strip** — always visible; today's personal reminders only during active trip; client rotation when 2+ exist
3. **Daily Itinerary Summary** — primary content below hero
   - **Before trip:** Day 1 preview from `startDate` activities
   - **Active:** today's condensed timeline with Now/Next emphasis
   - **Completed:** no daily preview; restrained closing hero + itinerary link

Trip Settings is the management surface for cover image and personal reminders. See [trip-settings.md](trip-settings.md).

Query: before trip loads `listActivitiesForTripDay(tripId, startDate)`; active loads today only; reminders load per current user.

Preview limit: 4 activities, deterministic selection via `build-itinerary-preview.ts`.

## Source layout

```
src/features/trip-home/
  build-trip-home-view-model.ts
  build-itinerary-preview.ts
  resolve-now-and-next-up.ts
  TripHomeContent.tsx
  TripHomeSections.tsx
  TripHomeContent.module.scss
  types.ts
src/features/trips/
  japan-wall-clock.ts
  calendar-day-diff.ts
src/features/trips/cover/
  actions.ts
  blob-storage.ts
  cover-domain.ts
  TripCoverSettings.tsx
```
