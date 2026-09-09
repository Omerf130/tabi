# Currency Converter (Phase 12)

Trip-scoped travel currency converter at `/app/trips/[tripId]/currency`.

## Defaults

- Pair: **JPY → ILS**
- Amount: **1000**
- Preferences: `tabi.currency.v1.from` / `tabi.currency.v1.to` in `localStorage`

## Provider

Frankfurter API v2 via server-only fetch (`src/features/currency/frankfurter.server.ts`).

- No API key
- 24-hour Next.js fetch revalidation
- Client never calls Frankfurter directly

Rate endpoint:

`/app/trips/[tripId]/currency/rate?from=JPY&to=ILS`

Requires trip membership (`requireTripMember`). Owners and members may use the converter.

## UI

Two primary currency panels:

1. **Top** — source currency + editable amount (`inputMode="decimal"`, LTR numeric area)
2. **Swap** — 44px+ control; inverts cached rate when possible
3. **Bottom** — target currency + read-only converted result

Searchable currency picker (mobile bottom sheet) with priority section (JPY, ILS, USD, EUR, GBP, KRW) and full supported fiat list.

Formatting uses `Intl.NumberFormat` / `Intl.DisplayNames("he-IL")` with a small curated override map for priority currencies only.

## Fetch behavior

- Amount typing performs **local** conversion only
- Fetch when currency pair changes and rate is not already cached in session
- Swap inverts loaded rate instead of refetching when safe

## Failure behavior

- If refresh fails but a session rate exists for the current pair: keep showing it with provider date and a subtle refresh-failed notice
- If no usable rate: show `לא ניתן לטעון את שער ההמרה כרגע.` with `נסה שוב`
- Never invent rates

## Travel Hub

The **מטבע** tool in Travel Hub is active and links to the converter. Bottom nav **עוד** remains active on `/currency`.
