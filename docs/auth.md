# Authentication

Phase 2 uses first-party email/password auth. No Clerk, Auth.js, or OAuth.

## Models

**User:** `name`, `email` (unique, normalized), `passwordHash` (never returned to clients), `role` (`user` | `admin`, default `user`), timestamps. No trip IDs.

**Session:** `userId`, `tokenHash` (SHA-256 of the cookie token), `expiresAt` (TTL index, 7 days), `createdAt`. Multiple sessions per user are allowed. Logout deletes only the current session.

Public registration always inserts `role: "user"`. The register schema rejects `role`. Admins are created only by a later deliberate server-side/manual process, not a public form.

## Password hashing

Argon2id via the `argon2` package (Node.js runtime only, not Edge):

- `memoryCost: 19456` (19 MiB)
- `timeCost: 2`
- `parallelism: 1`

Passwords: 8–256 characters. No composition rules.

## Cookie

`tabi_session`: HttpOnly, SameSite=Lax, `Secure` in production, path `/`, maxAge 7 days. Raw token only in the cookie.

## Helpers

`createSession`, `getCurrentUser` (React `cache`), `requireUser`, `deleteCurrentSession`.

`/app/layout.tsx` calls `requireUser()`. `/app/page.tsx` calls it again; `cache` reuses the same lookup.

## Protection

- **Security boundary:** server helpers in Server Components and Server Actions.
- **`src/proxy.ts`:** cookie-presence redirect for `/app` UX only. It does not validate the session.

## CSRF

POST Server Actions + SameSite=Lax + Next.js Origin/Host checks. No extra CSRF library.

## Rate limiting

Deferred to Phase 27 (Security & Production Hardening). V1 does not add Redis. Credential stuffing remains an accepted deferred risk.

## Environment

`MONGODB_URI` in `.env.local` only. Never log the value. `.env.example` lists the name without credentials.
