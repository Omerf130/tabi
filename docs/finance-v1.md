# Finance V1

Trip-scoped finance at `/app/trips/[tripId]/finance`.

## Finance V1 feature set (complete)

- Optional trip budget
- Base currency (defaults to ILS, locks after first expense)
- Manual expenses (CRUD)
- Linked Activity expenses
- Linked Accommodation expenses
- Linked Transport expenses
- Conversion snapshots (Frankfurter on cross-currency save)
- Category breakdown (CSS donut on Finance Home)
- Finance Home (hero, budget card, categories, expense list, settings, sheets)
- Travel Hub Finance summary card
- Source-card cost presentation (Activity / Accommodation / Transport read views)
- After Trip Home finance recap (completed phase only)
- Owner mutation / member read

## Source of truth

- **`TripExpense`** is the only persisted monetary value in the system.
- Activity, Accommodation, and Transport models do **not** store cost fields.
- Entity forms expose optional cost fields that read/write linked `TripExpense` documents.

## Linked expense architecture

Identity:

- `tripId`
- `sourceType`: `activity` | `accommodation` | `transport` | `manual`
- `sourceId`: entity id for linked expenses; `null` for manual

A partial unique index guarantees one linked expense per entity.

Manual expenses:

- `sourceType = manual`
- `sourceId = null`
- `title` required

Linked expenses:

- `title = null` (display resolves dynamically from source entity)
- category/date rules per source type

## Entity date rules

| Source | expenseDate |
|--------|-------------|
| Activity | activity date |
| Accommodation | check-in date |
| Transport | departure date |

## Category rules

| Source | Category |
|--------|----------|
| Activity | owner picks: food, activities, shopping, transport, other |
| Accommodation | automatic: accommodation |
| Transport flight | automatic: flights |
| Transport other | automatic: transport |

## Clear-cost semantics

Clearing the amount in an entity form and saving deletes the linked `TripExpense`. The entity remains. Amount `0` is never persisted.

Removing cost from Finance ("הסרת העלות") deletes the `TripExpense` only; the source entity remains.

## Delete semantics

Deleting Activity / Accommodation / Transport deletes its linked `TripExpense` in the same transaction.

Manual expenses delete independently.

## Conversion behavior

Reuse `buildExpenseConversionSnapshot`:

- same currency: no Frankfurter
- cross currency: Frankfurter on save
- provider failure: reject mutation; no partial persistence
- category/date-only edits avoid unnecessary reconversion

Client preview in sheets is informational only.

## Consistency strategy

Entity create/update/delete and linked expense sync run inside Mongo transactions via `withTransaction`:

1. mutate entity
2. sync linked expense (create / update / delete)

If conversion fails, the transaction rolls back.

## Finance-side linked editing

Owners may edit linked expenses from Finance:

- Activity: amount, currency, category
- Accommodation: amount, currency (category fixed)
- Transport: amount, currency (category derived from transport type)

Entity-owned fields (title, dates, notes) remain on source forms only.

## Dynamic title resolution

Finance preparation batch-loads source entities by `sourceType` and resolves display titles without N+1 queries. Missing sources show "פריט שנמחק" (read-only defensive fallback).

## Authorization

- Finance read: trip members
- Cost mutations (entity forms + Finance): trip owners only
- After Trip finance recap: read-only for members; CTA opens Finance

## After Trip finance recap

Loaded only for completed trip home via `prepareAfterTripFinanceRecap` → `buildAfterTripFinanceRecap`.

Uses real `TripFinanceSettings` + `TripExpense` data through `buildFinanceSummary`. No second calculation system.

Hierarchy on completed home:

1. Hero
2. Memories
3. Finance recap
4. Itinerary revisit

Variants:

- **No expenses:** compact "הכסף בטיול" entry → Finance
- **Expenses, no budget:** total + category bar summary → full Finance
- **Expenses + budget:** total, budget, remaining/over → category bar summary → full Finance

## Navigation

Finance lives under **More** (`עוד`), not bottom nav.

## Intentionally deferred (post V1)

- Planned vs actual tracking
- Payer tracking / expense splitting
- Receipts / receipt scanning
- Per-category budgets
- Recurring expenses
- Bank/card integration
- AI categorization
- Destination currency inference
- Finance notifications
- Chart libraries
- Trip Home Highlights
- Memories backend / photo statistics
