# Routing

`/` remains a temporary design-system showcase.

## Public / authentication

| Path | Purpose | Phase |
|---|---|---|
| `/` | Design-system showcase (not the product homepage) | 1 |
| `/login` | Sign in (supports safe `?next=` return) | 2 |
| `/register` | Create account (supports safe `?next=` return) | 2 |
| `/invite/[token]` | Public invite landing + acceptance | 4 |

## Application

Trip URLs always include `tripId`. There is no implied “current trip” outside that segment.

| Path | Purpose | Phase |
|---|---|---|
| `/app` | Authenticated entry → trip routing | 3 |
| `/app/trips` | Trip list | 3 |
| `/app/trips/new` | Create trip | 3 |
| `/app/trips/[tripId]` | Trip home (stub until Phase 8) | 5 / 8 |
| `/app/trips/[tripId]/itinerary` | Single-open day accordion + activity timeline; `?date=` deep link | 6 / 7 |
| `/app/trips/[tripId]/itinerary/activities/new` | Redirect stub → itinerary `?date=` (compatibility) | 7 |
| `/app/trips/[tripId]/itinerary/activities/[activityId]/edit` | Redirect stub → itinerary `?date=` (compatibility) | 7 |
| `/app/trips/[tripId]/documents` | Files (placeholder until Phase 12) | 5 / 12 |
| `/app/trips/[tripId]/memories` | Journal (placeholder until Phase 21) | 5 / 21 |
| `/app/trips/[tripId]/more` | More menu (members link, trips list, account, logout) | 5 |
| `/app/trips/[tripId]/packing` | Packing lists | 19 |
| `/app/trips/[tripId]/members` | Trip members + owner invite management | 4 |

Additional trip sections (transport, passes, shopping, emergency, etc.) follow the same `/app/trips/[tripId]/...` pattern when those phases start.

## Platform administration

| Path | Purpose | Phase |
|---|---|---|
| `/admin` | Tabi platform admin | 25 |

Admin is platform-scoped, not trip-scoped. It must remain usable on a phone.

## Access notes

- Route existence is not authorization. Server checks must still verify session + trip membership.
- Do not trust `tripId` from the URL or the client body without a membership lookup.
- Trip routes under `/app/trips/[tripId]` share **TripShellLayout** (bottom nav below 1024px, left rail at ≥ 1024px). See [app-shell.md](app-shell.md).
- Itinerary days are derived from Trip dates; each day may be hash-linked as `#day-YYYY-MM-DD`. See [itinerary-foundation.md](itinerary-foundation.md).
