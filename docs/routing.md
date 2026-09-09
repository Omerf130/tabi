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
| `/app/trips/[tripId]` | Trip Home — lifecycle dashboard (before/during/after) | 8 |
| `/app/trips/[tripId]/itinerary` | Single-open day accordion + activity timeline; `?date=` deep link | 6 / 7 |
| `/app/trips/[tripId]/itinerary/activities/new` | Redirect stub → itinerary `?date=` (compatibility) | 7 |
| `/app/trips/[tripId]/itinerary/activities/[activityId]/edit` | Redirect stub → itinerary `?date=` (compatibility) | 7 |
| `/app/trips/[tripId]/documents` | Travel Wallet — trip documents (PDF/images) | 10 |
| `/app/trips/[tripId]/documents/[documentId]` | Document detail (view/download) | 10 |
| `/app/trips/[tripId]/documents/[documentId]/file` | Authenticated private document file proxy | 10 |
| `/app/trips/[tripId]/memories` | Journal (placeholder until Phase 21) | 5 / 21 |
| `/app/trips/[tripId]/more` | Travel Hub (מרכז הטיול) — hero, contextual accommodation, smart list attention, travel tools | 11.5 |
| `/app/trips/[tripId]/manage` | Management hub — trip settings, members, trips list, account, logout | 11.5 |
| `/app/trips/[tripId]/lists` | Trip Lists landing — four collaborative checklists | 11 |
| `/app/trips/[tripId]/lists/packing` | Packing checklist | 11 |
| `/app/trips/[tripId]/lists/before-trip` | Pre-flight tasks checklist | 11 |
| `/app/trips/[tripId]/lists/during-trip` | During-trip tasks checklist | 11 |
| `/app/trips/[tripId]/lists/pre-trip-shopping` | Pre-trip shopping checklist | 11 |
| `/app/trips/[tripId]/currency` | Travel currency converter (JPY → ILS default) | 12 |
| `/app/trips/[tripId]/currency/rate` | Server-mediated Frankfurter exchange-rate proxy | 12 |
| `/app/trips/[tripId]/weather` | Travel weather — searchable locations, current + 3-day forecast | 13 |
| `/app/trips/[tripId]/weather/search` | Server-mediated WeatherAPI location search proxy | 13 |
| `/app/trips/[tripId]/weather/snapshot` | Server-mediated WeatherAPI forecast proxy (coordinate-based) | 13 |
| `/app/trips/[tripId]/transport` | Transport list grouped by type | 14 |
| `/app/trips/[tripId]/transport/new` | Create transport (`?type=flight|train|…`) | 14 |
| `/app/trips/[tripId]/transport/[transportId]` | Transport detail + linked documents | 14 |
| `/app/trips/[tripId]/transport/[transportId]/edit` | Edit transport | 14 |
| `/app/trips/[tripId]/accommodations` | Accommodation list (read-only for travelers) | 9 |
| `/app/trips/[tripId]/accommodations/[accommodationId]` | Accommodation detail + Maps / Taxi Mode | 9 |
| `/app/trips/[tripId]/accommodations/[accommodationId]/taxi` | Taxi Mode full-screen overlay | 9 |
| `/app/trips/[tripId]/accommodations/[accommodationId]/photo` | Server-mediated Google Places lodging photo proxy | 11.5 |
| `/app/trips/[tripId]/settings` | Trip settings (owner: cover, accommodations, documents CRUD) | 8B / 9 / 10 |
| `/app/trips/[tripId]/cover` | Authenticated Trip cover image delivery | 8B |
| `/app/trips/[tripId]/packing` | Packing lists | 19 |
| `/app/trips/[tripId]/members` | Trip members + owner invite management | 4 |

Additional trip sections (passes, shopping, emergency, etc.) follow the same `/app/trips/[tripId]/...` pattern when those phases start.

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
