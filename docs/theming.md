# Theming

V1 visual identity is **Tabi for Japan**: warm cream, deep burgundy, restrained sakura, charcoal text. Tokens live in `src/styles/tokens.scss`. Components consume `var(--token)` only.

## Color (light)

| Token | Role |
|---|---|
| `--color-background` | Warm washi page (`#F3EEE6`) |
| `--color-surface` | Cards and fields (`#FBF7F1`, not pure white) |
| `--color-surface-subtle` | Quiet wells |
| `--color-primary` | Burgundy actions (`#7A2E38`) |
| `--color-primary-hover` / `--color-primary-pressed` | |
| `--color-on-primary` | Text on primary fill |
| `--color-accent` | Restrained sakura highlight, not CTAs |
| `--color-accent-soft` | Badge wash |
| `--color-text` / `--color-text-muted` | Warm charcoal |
| `--color-border` / `--color-focus` | |
| `--color-success` / `--color-warning` / `--color-danger` | Status |

Dark values sit under `[data-color-scheme="dark"]`. Default is light on `<html>`. Do **not** switch from `prefers-color-scheme`. A product toggle comes later; `/` has a preview-only control.

## Layout

Mobile-first, not mobile-only.

- `--space-page-inline` grows from 1rem (phone) to 1.5rem / 2rem
- `--layout-content-max` (40rem) — readable / compact content
- `--layout-wide-max` (72rem) — future itinerary, documents, planner

Do not lock the whole app to a centered phone column. Do not turn desktop into a generic dashboard.

## Type

Noto Sans Hebrew (`--font-ui`) plus the existing JP/English stack. Roles: `--text-display`, `--text-title`, `--text-section`, `--text-card`, `--text-body`, `--text-secondary`, `--text-label`, `--text-caption`, `--text-numeric`. Mixed strings use `lang` and `dir="auto"`.

## Motion

`--transition-fast` / `--transition-base`. Pressed states only. `prefers-reduced-motion` is respected globally.

## UI layer

`src/components/ui/` — Button, Card, Field, Input, Textarea, Select, Badge, AppHeader, BottomNav, local SVGs. No icon library.

`/` is a **temporary internal design-system showcase**, not the product homepage.

## Not in V1

No destination theme switching, presets, or `data-destination`.
