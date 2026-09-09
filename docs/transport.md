# Transport

Trip-scoped transport segments (flights, trains, buses, ferries, car/taxi) stored in a dedicated `Transport` collection. Transport is the source of truth — it is **not** duplicated into Activities or TripReminder rows.

## Product surfaces

| Surface | Path | Access |
|---|---|---|
| Transport list | `/app/trips/[tripId]/transport` | `requireTripMember` |
| Create | `/app/trips/[tripId]/transport/new?type=…` | `requireTripOwner` |
| Detail | `/app/trips/[tripId]/transport/[transportId]` | `requireTripMember` |
| Edit | `/app/trips/[tripId]/transport/[transportId]/edit` | `requireTripOwner` |
| Travel Hub tool | `/app/trips/[tripId]/more` → תחבורה | active link |
| Itinerary merge | `/app/trips/[tripId]/itinerary` | departure-day cards only |

CRUD lives in the Transport tool, **not** in Trip Settings.

## Transport model

Types: `flight`, `train`, `bus`, `ferry`, `car`, `taxi`.

Each endpoint (`departure`, `arrival`) stores:

- `locationName`, optional `locationCode`
- local `date` (YYYY-MM-DD), local `time` (HH:mm)
- IANA `timezone` (curated Hebrew-friendly selector; default `Asia/Tokyo`)

Type-specific details live in a flat `details` object (airline/flight fields, train category/service, or operator/service for other modes).

## Timezone & chronology

- Display times in the timezone entered — do **not** convert departure into arrival timezone for display.
- Cross-midnight and cross-timezone ordering uses real UTC instants (`toEndpointInstantUtc`).
- Transport may exist outside the trip date range; itinerary shows transport only when `departure.date` is within inclusive `[startDate, endDate]`.

## Itinerary merge

Activities keep manual `order`. Transport is inserted on the departure day by departure time:

1. Start with activities in manual order.
2. Sort transports by departure time.
3. Insert each transport before the first **timed** activity whose `startTime` is later.
4. Untimed activities never move. Transport is not manually reorderable.

## TravelDocument links

`TravelDocument` may optionally link to exactly one context item: `activityId`, `accommodationId`, or `transportId` (XOR). Stale links are tolerated when the linked transport is deleted.

## Derived context (no Home UI yet)

Selectors in `select-transport-context.ts`:

- `selectTransportsDepartingOnDate`
- `selectNextUpcomingTransport`
- `buildTransportContextLabel`

These are available for future Home / reminder surfaces without creating duplicate records.

## Coexistence with Activity `type: "transport"`

Legacy/manual activity rows with `type: "transport"` remain unchanged. No migration is performed in this phase.
