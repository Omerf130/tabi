# Security principles

Travel documents may include passports, tickets, and booking confirmations. Treat trip files as sensitive.

## Access

- Authenticated access only for app and document routes (from Phase 2 onward). `/app` uses `requireUser()`, not cookie presence alone.
- Session cookie `tabi_session` is HttpOnly. Tokens are stored hashed. See [auth.md](auth.md).
- Login/register rate limiting is deferred to Phase 27.
- Authorization is **trip membership**, checked on the server for every trip route and future trip-owned read/write.
- Cross-trip access attempts return `notFound()` without revealing whether another user's Trip exists.
- Do not trust `tripId`, `userId`, or role from the client. Resolve identity from the session, then membership.

## Files

- Use **private** object storage (Vercel Blob or equivalent). No public/guessable file URLs for documents.
- Serve files through an authorized endpoint (or short-lived signed URLs), never a world-readable blob path.
- Validate uploads: type, size, and that the caller is a member of the target trip.

## Application rules

- Client UI is not a security boundary.
- Environment secrets stay in server env (`.env*` is gitignored; only `.env.example` is committed).
- Platform admin (`/admin`) is a separate gate from trip owner.

## Invite links (Phase 4)

Invite links are **bearer secrets**. Whoever holds a valid link and authenticates can accept it.

Mitigations:

- 32-byte random token, base64url in URL only
- SHA-256 `tokenHash` stored in MongoDB; raw token never persisted
- 7-day `expiresAt` checked on every validation (TTL index is cleanup only)
- Single-use via `usedAt` / `usedBy`
- Owner revocation via `revokedAt`
- Invited role stored on `TripInvitation`; acceptance never reads role from client input
- Public invite page exposes only trip name and invited role

Auth return paths use `sanitizeReturnTo()` with an allowlist (`/invite/...`, `/app/trips/...`). No open redirects.

## Last-owner invariant

A trip must always have at least one owner. Owner demotion/removal runs in a MongoDB transaction that first writes the Trip document (`serializeTripMutation`) to serialize concurrent membership mutations for the same trip, then checks owner count before demoting/removing an owner. Transient transaction conflicts retry up to 3 times.

Document storage is Phase 12. Hardening is Phase 27. Do not weaken these rules when those phases start.
