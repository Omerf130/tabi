# Roles and permissions

Two independent axes. Do not collapse them into one role field.

## Platform role

Stored on the User. Controls the Tabi product, not a trip.

| Role | Meaning |
|---|---|
| `user` | Normal account |
| `admin` | Platform administrator (`/admin`) |

Platform admin is **not** automatically a trip owner.

## Trip role

Stored on TripMember. Controls one Trip only.

| Role | Meaning |
|---|---|
| `owner` | Configure the trip (settings, members, destructive actions) |
| `member` | Participate; cannot manage trip configuration |

A user can be owner of Japan 2026 and member of another trip.

## Enforcement

- **Authentication (Phase 2):** `requireUser()` in Server Components. `src/proxy.ts` only checks cookie presence for `/app` UX.
- **Trip access (Phase 3):** `requireTripMember(tripId)` loads TripMember for `(session.userId, tripId)`. Invalid id or non-member → `notFound()`.
- **Trip admin (Phase 4):** `requireTripOwner(tripId)` for invites, role changes, and removals. All owners are equal; `Trip.createdBy` is audit-only.
- Never trust client-provided `userId` / `tripId` / role.
- Public registration cannot create `admin`. Admins are created only by a later manual/server process.

## Phase 4 permission matrix

| Action | Owner | Member |
|---|---|---|
| View member list | Yes | Yes |
| Create/revoke invites | Yes | No |
| Change roles / remove members | Yes | No |
| Accept invite link | After auth | After auth |

Member list visibility is open to all trip members. Administrative controls are owner-only and enforced server-side.
