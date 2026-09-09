# App shell (Phase 5)

The app shell provides consistent navigation, headers, and layout for authenticated trip routes. It is presentation-only: no new domain models, permissions, or business logic.

## Layout hierarchy

```
/app/layout.tsx              requireUser (unchanged)
/app/trips, /app/trips/new   GlobalAppShell (header + content, no trip nav)
/app/trips/[tripId]/layout   requireTripMember + TripShellLayout
  └── pages                  TripHeader + AppPage / feature content
```

- **GlobalAppShell** — used on trip list and create-trip flows. Simple header and scrollable content.
- **TripShellLayout** — Server Component wrapper for all `/app/trips/[tripId]/*` routes. Renders primary navigation (bottom or rail) around page content.
- **TripHeader** — per-page title bar. Optional secondary row with trip name and a link to `/app/trips` (trip switch).
- **AppPage** — shared content wrapper with page padding and max-width constraints.

## Primary navigation

Labels (Hebrew): **בית, מסלול, מסמכים, זיכרונות, עוד**.

| Section | Route |
|---|---|
| home | `/app/trips/[tripId]` |
| itinerary | `/app/trips/[tripId]/itinerary` |
| documents | `/app/trips/[tripId]/documents` |
| memories | `/app/trips/[tripId]/memories` |
| more | `/app/trips/[tripId]/more` |

Configuration lives in `src/features/app-shell/navigation.ts`:

- `buildTripNavHref()` — href for each section
- `getActiveNavSection()` — derives active tab from pathname; `/more`, `/manage`, `/members`, `/settings`, `/accommodations`, and `/lists` map to **more**
- `isSecondaryTripRoute()` — true for any nested trip route except home

**TripPrimaryNav** (Client Component) reads `usePathname()`, builds Link-based items, and passes them to **BottomNav**.

## Breakpoints

| Viewport | Navigation |
|---|---|
| &lt; 1024px | Fixed bottom tab bar with safe-area padding |
| ≥ 1024px | Sticky left rail (`--size-nav-rail: 5rem`), bottom bar hidden |

RTL: the rail sits on the **inline-start** side (right in Hebrew layout).

## Header behavior

- **Trip home** (`/app/trips/[tripId]`): trip name is the primary header title. No trip-switch row.
- **Other trip pages**: page title is primary; trip name + “הטיולים שלי” chevron link appears below the header.
- Trip switch is always shown on secondary pages (no trip-count gate).

## Travel Hub (More)

`/app/trips/[tripId]/more` is **Travel Hub** (מרכז הטיול). Information architecture:

1. **Hero** — compact placeholder visual; final artwork deferred
2. **Contextual accommodation** — current or next stay when applicable (Asia/Tokyo date semantics)
3. **Smart list attention** — first incomplete list needing attention by trip phase; hidden when nothing needs attention
4. **Travel tools** — working tools (מקומות לינה, רשימות) plus future tools visible but disabled (**בקרוב**): מטבע, תחבורה, מילון יפני, מזג אוויר, חירום
5. **Management entry** — **הגדרות וניהול** → `/manage`

`/app/trips/[tripId]/manage` contains:

- הגדרות הטיול → `/settings`
- חברי הטיול → `/members`
- הטיולים שלי → `/app/trips`
- Signed-in identity (name, email)
- Logout

Future travel tools are UI-visible only in Phase 11.5; their functionality is intentionally deferred.

## Placeholder routes

Itinerary, documents, and memories render minimal placeholder content until their feature phases. They participate in navigation and active-state logic.

## Scroll model

Content scrolls with the document. The shell does **not** set `overflow-y: auto` on `<main>`. Bottom-nav padding is applied via `contentArea` padding so content is not obscured on mobile.

## Source layout

```
src/features/app-shell/
  navigation.ts          # href + active-section helpers
  TripShellLayout.tsx    # Server — grid shell
  TripPrimaryNav.tsx     # Client — pathname-driven nav
  TripHeader.tsx         # Page header + optional trip switch
  AppPage.tsx            # Content wrapper
  GlobalAppShell.tsx     # Non-trip authenticated pages
  PlaceholderPage.tsx    # Stub for future sections
  MorePageContent.tsx    # More menu
```

## Out of scope (Phase 5)

- Trip Home dashboard content (Phase 8)
- Itinerary, documents, memories features
- Admin shell
- PWA / offline shell changes
