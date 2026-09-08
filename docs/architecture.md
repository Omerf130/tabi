# Architecture

Tabi V1 is a **mobile-first travel companion for Japan**. A **Trip** is an independent workspace. A **User** is a platform account that may belong to many trips.

```
User A: owner of Japan 2026, member of Japan 2027
User B: owner of Japan 2026
```

The application must never assume there is only one trip. Reusable application code must not hardcode individual travelers, hotels, itinerary dates, activities, or other trip content. That data belongs on a Trip.

V1 **may** assume Japan as the destination for product features (JPY, Suica/IC, Shinkansen, Takkyubin, Kanji addresses, Japan emergency information, and similar). That is intentional.

## Workspace model

- **Platform** owns Users, platform Admin, and Trips as records.
- **Trip** owns members, days, itinerary items, documents, packing, and other trip-scoped data.
- Permissions are **membership-scoped**. A user's role on Trip A is independent of Trip B.

See [permissions.md](permissions.md) and [data-domain.md](data-domain.md).

## Runtime shape

- Next.js App Router, TypeScript (`strict`), SCSS Modules.
- Prefer **Server Components**. Add a Client Component only when the UI needs browser state or event handlers.
- No global client store in Phase 0. Domain logic should live next to its feature when those phases arrive (`src/features/...`), not in a generic `utils` dump.
- Styling uses semantic CSS variables (`--color-primary`, etc.). For V1 those tokens **are** the Tabi Japan visual identity. They are not a destination-switching engine. See [theming.md](theming.md).
- Reusable UI primitives live in `src/components/ui/` (SCSS Modules). Prefer Server Components; client only when a primitive needs event state (BottomNav active routing via TripPrimaryNav, the design-system preview, auth form pending state).
- Trip-scoped pages use **TripShellLayout** + **TripHeader** + **AppPage**. See [app-shell.md](app-shell.md).
- Itinerary days are derived from Trip dates server-side; accordion UX in client island. See [itinerary-foundation.md](itinerary-foundation.md).
- Authentication is first-party (Argon2id + hashed sessions). See [auth.md](auth.md).

## Infrastructure (V1)

Start small. V1 is for a small number of users and trips. Do not design for massive scale up front.

Keep these boundaries correct even while infrastructure stays modest:

- authorization is server-side and membership-scoped
- trip data is always scoped by `tripId`
- sensitive documents stay private
- data models stay clean
- storage and third-party providers stay replaceable where practical

Inexpensive now, without painting the architecture into a dead end.

## Source layout

```
src/
  app/                 # `/` showcase; `/login` `/register` `/app` + trips
  components/ui/       # Phase 1 primitives (BottomNav, AppHeader, …)
  features/app-shell/  # Phase 5 trip + global shell
  features/itinerary/  # Phase 6–7 derived days + accordion + activities
  features/auth/       # Phase 2 authentication
  features/trips/      # Phase 3 trips domain
  lib/db/              # Mongoose connection
  models/              # User, Session, Trip, TripMember, Activity
  styles/
docs/
```

## Root application

- `lang="he"` and `dir="rtl"` on `<html>`.
- `data-color-scheme="light"` is the product default. Dark tokens exist in CSS; the toggle is later.
- There is no `data-destination` attribute and no destination theme switching in V1.

## Out of scope for Phase 3

Invitations, member management, itinerary, admin UI, and PWA. See [phases.md](phases.md).
