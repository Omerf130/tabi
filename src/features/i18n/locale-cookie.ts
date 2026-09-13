import "server-only";

import { cookies } from "next/headers";
import { sessionCookieOptions } from "@/features/auth/cookie-options";
import { LOCALE_COOKIE_NAME } from "./constants";
import type { AppLocale } from "./locale";

export async function getLocaleCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE_NAME)?.value;
}

export async function setLocaleCookie(locale: AppLocale): Promise<void> {
  const store = await cookies();
  store.set(
    LOCALE_COOKIE_NAME,
    locale,
    sessionCookieOptions(process.env.NODE_ENV === "production"),
  );
}

export async function clearLocaleCookie(): Promise<void> {
  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, "", {
    ...sessionCookieOptions(process.env.NODE_ENV === "production"),
    maxAge: 0,
  });
}
