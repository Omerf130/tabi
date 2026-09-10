import "server-only";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { GOOGLE_OAUTH_STATE_COOKIE } from "./constants";
import { googleOAuthStateCookieOptions } from "./cookie-options";
import { GoogleOAuthStateError } from "./errors";

export type StoredOAuthState = {
  state: string;
  next: string | null;
};

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function generateOAuthState(): string {
  return crypto.randomUUID();
}

export async function setOAuthStateCookie(payload: StoredOAuthState): Promise<void> {
  const store = await cookies();
  store.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    JSON.stringify(payload),
    googleOAuthStateCookieOptions(isProduction()),
  );
}

export async function clearOAuthStateCookie(): Promise<void> {
  const store = await cookies();
  store.set(GOOGLE_OAUTH_STATE_COOKIE, "", {
    ...googleOAuthStateCookieOptions(isProduction()),
    maxAge: 0,
  });
}

function parseStoredOAuthState(raw: string | undefined): StoredOAuthState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredOAuthState>;
    if (typeof parsed.state !== "string" || !parsed.state) {
      return null;
    }
    const next =
      parsed.next === null || typeof parsed.next === "string" ? parsed.next : null;
    return { state: parsed.state, next };
  } catch {
    return null;
  }
}

function statesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function consumeOAuthState(receivedState: string): Promise<StoredOAuthState> {
  const store = await cookies();
  const stored = parseStoredOAuthState(store.get(GOOGLE_OAUTH_STATE_COOKIE)?.value);
  await clearOAuthStateCookie();

  if (!stored || !statesMatch(stored.state, receivedState)) {
    throw new GoogleOAuthStateError();
  }

  return stored;
}
