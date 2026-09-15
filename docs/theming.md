# Theming

Global visual tokens live in [`src/styles/tokens.scss`](../src/styles/tokens.scss). Components should consume `var(--token)` for shared semantics.

## Current global brand (light)

Tabi’s canonical UI is **navy, white, and cool gray**, with **link/action blue** separate from brand primary:

| Token | Role |
|---|---|
| `--color-background` | Page canvas (`#f4f5f8`) |
| `--color-surface` / `--color-surface-elevated` | Cards, fields, opaque sheets (`#ffffff`) |
| `--color-surface-subtle` | Quiet wells (`#f3f6fa`) |
| `--color-primary` | Brand actions, active nav (`#1a2740`) — not link blue |
| `--color-link` | Textual links and secondary actions (`#1d4ed8`) |
| `--color-text` / `--color-text-muted` | Primary and secondary copy |
| `--color-border` / `--color-border-subtle` / `--color-border-strong` | Dividers and outlines |
| `--color-scrim` | Dialog backdrop (fixed; not trip-themed) |
| `--color-success` / `--color-warning` / `--color-danger` | Global semantic status |

Domain palettes (finance categories, weather accent, itinerary activity colors, trip-home phase colors, etc.) stay in feature modules — they do not come from trip theme primary.

## Trip themes (future — S4)

Per-trip visual themes are **not implemented yet**. When added, overrides will apply only inside the **trip workspace** (scoped to `TripShellLayout`), not on `<html>`.

**Stable global/account surfaces** (same global tokens): Welcome, Login/Register, My Trips, Create Trip, `/app/account/*`, Profile.

**Future trip-themed areas**: Trip Home, Itinerary, Travel Hub and tools, trip Settings, trip navigation, Quick Add.

There is no `themeKey` or `data-trip-theme` in the codebase until S4.

## Dark mode

Dark token values exist under `[data-color-scheme="dark"]`. The product default is **light** on `<html>`. Do **not** switch from `prefers-color-scheme`. A manual dark toggle is a separate future axis from trip themes.

## Layout

Mobile-first, not mobile-only.

- `--space-page-inline` grows from 1rem (phone) to 1.5rem / 2rem
- `--layout-content-max` (40rem) — readable / compact content
- `--layout-wide-max` (72rem) — wide trip tools and planners

## Type

Noto Sans Hebrew (`--font-ui`) plus the existing JP/English stack. Roles: `--text-display`, `--text-title`, `--text-section`, `--text-card`, `--text-body`, `--text-secondary`, `--text-label`, `--text-caption`, `--text-numeric`. Mixed strings use `lang` and `dir="auto"`.

## Motion

`--transition-fast` / `--transition-base`. Pressed states only. `prefers-reduced-motion` is respected globally.

## UI layer

`src/components/ui/` — Button, Card, Field, Input, Textarea, Select, Badge, AppHeader, BottomNav, local SVGs.

`/` design-system route is an **internal showcase**, not the product homepage.
