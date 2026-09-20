# Empty States (shared UI foundation)

Tabi uses a small shared presentation layer for “no content yet”, “no matches”, missing configuration, and provider failures. Feature code owns **when** to show something; these components own **how** it looks and behaves.

## Components

### `EmptyState`

Single family with four variants:

| Variant | Use when | Do not use when |
|---------|----------|-----------------|
| **`full`** | The page’s main purpose has no content (e.g. no trips). | A subsection is empty but the page still has other content. |
| **`section`** | A major list or feature block has zero records (documents, transport, finance section, empty day timeline). | Small hints on Home or Hub rows. |
| **`inline`** | Compact absence inside an otherwise useful surface (Hub secondary line, recap hint). | First-use onboarding for a whole feature. |
| **`search`** | Search or filter returned no matches while data may exist elsewhere. | The user has never added any records (use `section` or `full`). |

**Section surface:** `surface="default"` (plain) or `surface="subtle-bordered"` (light border + subtle fill). Dashed borders are not the global default.

**Important:** Absence of data does **not** automatically mean “render an Empty State”. Dashboard and Home sections should often **hide** when empty if there is no useful action or context (see Trip Home audit). Callers decide SHOW vs HIDE.

Import:

```tsx
import { EmptyState } from "@/components/ui/EmptyState";
```

Example:

```tsx
<EmptyState
  variant="section"
  surface="subtle-bordered"
  icon={<IconDocuments />}
  title={t("emptyAll")}
  description={t("emptyAllHintOwner")}
  primaryAction={{ label: t("addCta"), href: manageHref }}
/>
```

### `ConfigNotice`

Use when a feature **cannot work** until the user completes configuration (missing destination, unresolved travel language, weather location not chosen). This is **informational**, not an error.

```tsx
import { ConfigNotice } from "@/components/ui/ConfigNotice";
```

Uses `role="status"`. Do not style as danger/error by default.

### `ProviderAlert`

Use when a feature normally works but an **external or runtime operation failed** (weather load failure, currency rate fetch, translation provider). Distinct from zero-data and from configuration gaps.

```tsx
import { ProviderAlert } from "@/components/ui/ProviderAlert";
```

Uses `role="alert"`. Optional `retryAction` with `onClick`.

## Actions

At most one **primary** and one **secondary** action:

```tsx
primaryAction={{ label: "Add", href: "/path" }}
secondaryAction={{ label: "Cancel", onClick: () => {}, variant: "secondary" }}
```

- `href` renders as a link styled like primary/secondary actions.
- `onClick` uses the shared `Button` component.

Callers pass localized `label` strings from `next-intl`; shared components do not embed copy.

## Icons and visual treatment

Pass a **`visual`** config (preferred) or legacy `icon` / `accentIcon`:

```tsx
visual={{
  motif: "documents",
  icon: <IconDocuments />,
  accentIcon: <IconMapPin />,
}}
```

**Motifs** (presentation only, not domain logic): `travel` | `documents` | `transport` | `weather` | `search` | `generic`.

`EmptyStateVisual` composes motif-specific mini-illustrations:

- soft gradient blobs (semantic CSS)
- inline SVG scenery (map fold, tickets, suitcase, clouds, compass, route lines)
- caller icon + optional accent chip

**Full** and **section** use the richest layering; **search** and **inline** stay minimal (no atmospheric blobs). **ConfigNotice** reuses the section-scale visual. **ProviderAlert** uses a separate semantic icon shell — not the empty-state hero treatment.

Icons are decorative (`aria-hidden` on the visual wrapper).

## CTA emphasis

Variant defaults (override with `EmptyStateAction.variant` when needed):

- **Full** — strong primary + optional secondary text link
- **Section / ConfigNotice** — normal compact primary
- **Search** — subtle (secondary-style) primary action
- **Inline** — text link action

## Tokens and themes

Shared empty-state SCSS uses **global semantic tokens** only (`--color-text`, `--color-primary-soft`, `--color-border`, etc.). Trip themes (default, ocean, sakura, forest, sunset) override those tokens under the trip shell—no theme-specific empty-state CSS.

Do not use feature palettes (`--wallet-*`, `--transport-*`, `--my-trips-*`) in these modules.

## Accessibility

- **Full / section / search:** title renders as `h2` or `h3` (override with `titleAs` when nesting under an existing page heading).
- **Inline:** title uses `p` by default.
- **ConfigNotice:** `role="status"`.
- **ProviderAlert:** `role="alert"`.

## Migration status

ES1 adds the foundation only. Existing feature empty states (My Trips, Documents, Finance, Home, Emergency, Weather `errorBlock`, etc.) are migrated in later ES batches.
