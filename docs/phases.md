# Development phases

Guidance only. Completing Phase 0 is not permission to implement later phases.

V1 is **Tabi for Japan**. Japan-specific product features are in scope; a destination theme engine is not.

| Phase | Name |
|---|---|
| 0 | Architecture & Foundation |
| 1 | Tabi Japan V1 Design System |
| 2 | Authentication |
| 3 | Trips & Onboarding |
| 4 | Members & Permissions |
| 5 | Mobile App Shell |
| 6 | Trip Days & Planner Foundation |
| 7 | Itinerary UX |
| 8 | Trip Home |
| 9 | Accommodation & Taxi Mode |
| 10 | Transportation |
| 11 | Collaborative Trip Lists (רשימות) |
| 12 | Currency Converter |
| 13 | Offline Foundation |
| 14 | Offline Documents |
| 15 | Weather |
| 16 | Documents |
| 17 | Dictionary |
| 18 | Emergency |
| 19 | Packing |
| 20 | Shopping |
| 21 | Memories |
| 22 | Reminders & Luggage Forwarding |
| 23 | PWA |
| 24 | Push Notifications (optional) |
| 25 | Platform Admin |
| 27 | Security & Production Hardening |
| 28 | Japan 2026 Content |
| 29 | QA / Field Simulation |
| 30 | Launch |

There is no V1 Phase 26. Destination theme management is not on the V1 roadmap. It may be considered only as a possible post-V1 expansion.

Japan 2026 itinerary, hotels, and traveler content are loaded as **Trip-owned data** in Phase 28. They must not be hardcoded into reusable application code.

## Phase 1

Visual identity for Tabi Japan V1: tokens, primitives in `src/components/ui/`, and a temporary showcase at `/`.

Phase 1 does not implement authentication or product screens. `/` is not the product homepage.

Primitives: color, type, spacing, Card, Button, Field/Input/Textarea/Select, Badge, AppHeader, BottomNav, light mode, dark-token foundation, restrained motion, Japan-inspired language without decoration.

## Phase 2

First-party authentication: Argon2id, MongoDB User/Session, hashed cookies, `/login`, `/register`, protected `/app`. See [auth.md](auth.md).

## Phase 3

Trip + TripMember workspace model, date-only trip dates, transactional trip creation, `/app/trips/*`, server-side membership authorization. See [trips.md](trips.md).

## Phase 4

Trip invitations (link-based, no email provider), member list, owner-only invite/member management, safe auth returnTo for invite flow, last-owner invariant with Trip-document transaction serialization. See [trips.md](trips.md), [permissions.md](permissions.md), [security.md](security.md).

## Phase 5

Mobile app shell: **TripShellLayout** with bottom navigation (&lt; 1024px) and left rail (≥ 1024px), Hebrew nav labels (בית, מסלול, מסמכים, זיכרונות, עוד), **TripHeader** with trip switch, **GlobalAppShell** for trip list/create, placeholder routes for itinerary/documents/memories, and **More** page (members link, trips list, account, logout). See [app-shell.md](app-shell.md).

## Phase 6

Trip days & planner foundation: days derived from `Trip.startDate`/`endDate`, read-only vertical itinerary at `/app/trips/[tripId]/itinerary`, 180-day max duration, hash-addressable day ids, temporal past/today/future state. No Activity model or mutations yet. See [itinerary-foundation.md](itinerary-foundation.md).

## Phase 7

Itinerary UX + core activity planning: `Activity` model, single-open day accordion, inline owner create/edit, `?date=` deep link, restrained secondary actions. Members read-only. See [activity-model.md](activity-model.md), [itinerary-foundation.md](itinerary-foundation.md).

## Phase 8

Trip Home: lifecycle-aware dashboard at `/app/trips/[tripId]` with before/during/after states, countdown, Now/Next Up from today's Activities, and itinerary deep links. Server-rendered; Japan calendar/time semantics. See [trip-home.md](trip-home.md).

## Phase 11

Collaborative Trip Lists: four checklist types (`packing`, `before_trip`, `during_trip`, `pre_trip_shopping`), lazy one-time seeding, landing at `/lists` and detail routes per slug. See [routing.md](routing.md).

## Phase 11.5

Travel Hub redesign: `/more` becomes **מרכז הטיול** with hero placeholder, contextual accommodation card, phase-aware smart list attention, colored travel tools grid (working + future disabled tools), and a single management entry to `/manage`. Future tools (transport, dictionary, weather, emergency) remain visible but disabled until their phases. Google Places lodging photos may display via server-mediated proxy when available.

## Phase 12

Currency Converter: trip-scoped travel reference converter at `/currency` with Frankfurter API v2 (server-only), default **JPY → ILS** at amount **1000**, two-panel UI, searchable picker, session rate cache, and `localStorage` pair preferences. See [currency-converter.md](currency-converter.md).
