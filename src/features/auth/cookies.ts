import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";
import { sessionCookieOptions } from "./cookie-options";

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(process.env.NODE_ENV === "production"),
  );
}

export async function getSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value;
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(process.env.NODE_ENV === "production"),
    maxAge: 0,
  });
}
