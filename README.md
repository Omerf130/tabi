# Tabi

Tabi is a **mobile-first global travel planning and companion** application.

A **Trip** is an independent workspace with a canonical destination (`Trip.destination.countryCode`). Destination-specific behavior (currency, weather seed, emergency numbers, list overlays, local lodging labels, travel language, and similar) is derived from that destination — not from UI locale and not from a global default country.

Japan is a supported destination with JP-specific overlays when `countryCode === "JP"`. There is no silent Japan fallback for unknown destinations.

Users may belong to multiple trips with different roles. Traveler names, hotels, dates, and itinerary content are **trip data**, not hardcoded into reusable application code.

## Run locally

Copy `.env.example` to `.env.local` and set `MONGODB_URI` (never commit that file).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Stack

- Next.js (App Router) + TypeScript
- SCSS Modules and semantic CSS custom properties
- Hebrew RTL root (`lang="he"`, `dir="rtl"`)
- MongoDB + Mongoose, first-party Argon2id sessions, Trip/TripMember workspaces

See [Authentication](docs/auth.md) and [Trips](docs/trips.md).

## Docs

- [Authentication](docs/auth.md)
- [Trips](docs/trips.md)
- [Architecture](docs/architecture.md)
- [Routing](docs/routing.md)
- [Data / domain](docs/data-domain.md)
- [Roles and permissions](docs/permissions.md)
- [Theming](docs/theming.md)
- [Offline / PWA](docs/offline-pwa.md)
- [Security](docs/security.md)
- [Development phases](docs/phases.md)
