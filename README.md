# Tabi

Tabi is a mobile-first travel companion **for traveling in Japan**.

The first real use case is a honeymoon trip in Japan from 25 October 2026 to 18 November 2026. V1 may include Japan-specific tools (addresses/Kanji, taxi cards, JPY, Suica/IC, Shinkansen, Takkyubin, a Japanese phrase dictionary, Japan emergency information).

A **Trip** is still an independent workspace. Users may belong to multiple trips with different roles. Traveler names, hotels, dates, and itinerary content are **data**, not hardcoded into reusable application code.

This repository is currently **Phase 3 — Trips & Onboarding**. `/` is a temporary internal design-system showcase, not the product homepage.

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
