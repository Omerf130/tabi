# Trips

Phase 3 introduces the workspace tenancy model.

```
User → TripMember → Trip
```

- **User.role** is platform-only (`user` | `admin`).
- **TripMember.role** is trip-only (`owner` | `member`).
- **TripMember** is the authorization source for trip access.
- **Trip.createdBy** is audit metadata only.

Never store `tripId`, `tripIds`, or trip roles on User.

## Calendar dates

Trip `startDate` and `endDate` are **date-only** strings in canonical form:

```
YYYY-MM-DD
```

Examples:

```
startDate: "2026-10-25"
endDate: "2026-11-18"
```

Rules:

- strict zero-padded format
- validated to exist as real calendar days
- compared lexicographically for ordering
- never stored via JavaScript `Date` parsing
- DTOs expose the same canonical strings

Display uses UTC-based formatting from the string parts so the calendar day does not shift.

Derived trip phase uses **today in Japan** (`Asia/Tokyo`) as `YYYY-MM-DD`:

- `today < startDate` → upcoming
- `startDate <= today <= endDate` → active
- `today > endDate` → completed

Status is not persisted on Trip.

## Creation

`createTripWithOwnerMembership` uses a MongoDB transaction:

1. insert Trip
2. insert TripMember with `role: "owner"`

Both succeed or neither remains.

## Authorization

Server-only helpers in `src/features/trips/authorization.ts`:

- `getTripMembership(userId, tripId)`
- `requireTripMember(tripId)` → `notFound()` if invalid id or no membership
- `requireTripOwner(tripId)` → ready for Phase 4

Cross-trip isolation: User A visiting `/app/trips/{TripB}` gets the same not-found response as a malformed id. Trip data is never returned without membership.

`src/proxy.ts` only checks cookie presence. Real protection is in Server Components.

## Routing

| Path | Behavior |
|---|---|
| `/app` | 0 trips → `/app/trips/new`; 1 → `/app/trips/[id]`; 2+ → `/app/trips` |
| `/app/trips` | trip list |
| `/app/trips/new` | create trip |
| `/app/trips/[tripId]` | temporary trip proof page |

No active-trip cookie. `[tripId]` in the URL is the workspace context.

## Invitations and members (Phase 4)

- Owners create single-use invite links (`/invite/[token]`) with role `owner` or `member`.
- Invite URL is shown once at creation; only `tokenHash` is stored.
- Acceptance is explicit (button click), transactional, and reads role from the invitation record only.
- All trip members may view `/app/trips/[tripId]/members`; owner-only actions are enforced server-side.
- Owner demotion/removal uses Trip-document serialization inside transactions to prevent write-skew on the last-owner invariant.

## List ordering

Server-side sort after query:

1. active
2. upcoming (nearest first)
3. completed (most recently completed first)

No persisted sort/status fields.
