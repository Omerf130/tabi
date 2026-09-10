# Authentication

Tabi supports first-party email/password auth and Google Sign-In. Both methods authenticate into the same MongoDB-backed Tabi session (`tabi_session` cookie). No Clerk, Auth.js, Passport, or JWT application sessions are used.

## Models

**User:** `name`, `email` (unique, normalized), optional `passwordHash` (never returned to clients), optional `googleSubject` (unique partial index when present), `role` (`user` | `admin`, default `user`), timestamps. No trip IDs.

- Password users store `passwordHash` and omit `googleSubject`.
- Google-only users store `googleSubject` and omit `passwordHash`.
- Existing password users can link Google later when Google returns the same verified email.

**Session:** `userId`, `tokenHash` (SHA-256 of the cookie token), `expiresAt` (TTL index, 7 days), `createdAt`. Multiple sessions per user are allowed. Logout deletes only the current session.

Public registration always inserts `role: "user"`. The register schema rejects `role`. Admins are created only by a later deliberate server-side/manual process, not a public form.

## Password hashing

Argon2id via the `argon2` package (Node.js runtime only, not Edge):

- `memoryCost: 19456` (19 MiB)
- `timeCost: 2`
- `parallelism: 1`

Passwords: 8–256 characters. No composition rules.

Google-only users have no password hash. Password login fails safely for those accounts without revealing whether the account exists.

## Google Sign-In

Google is identity proof only. Tabi does **not** store Google access tokens, refresh tokens, or ID tokens.

**Dependency:** `google-auth-library` (`OAuth2Client` for authorization URL, code exchange, and ID token verification).

**Scopes:** `openid`, `email`, `profile`

**Routes:**

- `GET /auth/google` — generates OAuth state, stores it in a short-lived HttpOnly cookie, redirects to Google
- `GET /auth/google/callback` — validates state, exchanges the code, verifies the ID token, resolves/links/creates the Tabi user, creates a Tabi session, redirects to `/app` or a sanitized `next` path

**Account linking:**

1. Find user by `googleSubject === sub`
2. Else find user by normalized verified email
   - if no `googleSubject`, link Google to the same user
   - if a different `googleSubject` exists, reject
3. Else create a new Google-only user

**Local development redirect URI:** `http://localhost:3000/auth/google/callback`

Production redirect URI must be configured manually in Google Cloud when the production domain is ready.

## Cookie

`tabi_session`: HttpOnly, SameSite=Lax, `Secure` in production, path `/`, maxAge 7 days. Raw token only in the cookie.

Google OAuth state uses a separate short-lived HttpOnly cookie scoped to `/auth/google`.

## Helpers

`createSession`, `getCurrentUser` (React `cache`), `requireUser`, `deleteCurrentSession`.

`/app/layout.tsx` calls `requireUser()`. `/app/page.tsx` calls it again; `cache` reuses the same lookup.

## Protection

- **Security boundary:** server helpers in Server Components and Server Actions.
- **`src/proxy.ts`:** cookie-presence redirect for `/app` UX only. It does not validate the session.

## CSRF

POST Server Actions + SameSite=Lax + Next.js Origin/Host checks. Google OAuth uses one-time server-stored state compared on callback.

## Rate limiting

Deferred to Phase 27 (Security & Production Hardening). V1 does not add Redis. Credential stuffing remains an accepted deferred risk.

## Environment

`MONGODB_URI` in `.env.local` only. Never log the value.

Google OAuth credentials are server-only:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`

`.env.example` lists variable names without credentials.
