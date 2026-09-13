import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/features/auth/constants";
import { getCurrentUser } from "@/features/auth/session";
import { LOCALE_COOKIE_NAME } from "./constants";
import {
  DEFAULT_APP_LOCALE,
  parseAppLocale,
  resolveAppLocale,
  type AppLocale,
} from "./locale";

export type ResolveRequestLocaleInput = {
  cookieLocale: string | undefined;
  hasSessionCookie: boolean;
  recoverUserLocale: () => Promise<AppLocale | null>;
};

export async function resolveRequestLocaleFromInput(
  input: ResolveRequestLocaleInput,
): Promise<AppLocale> {
  const fromCookie = parseAppLocale(input.cookieLocale);
  if (fromCookie) {
    return fromCookie;
  }

  if (input.hasSessionCookie) {
    const recovered = await input.recoverUserLocale();
    if (recovered) {
      return recovered;
    }
  }

  return DEFAULT_APP_LOCALE;
}

export async function resolveRequestLocale(): Promise<AppLocale> {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE_NAME)?.value;
  const fromCookie = parseAppLocale(cookieLocale);
  if (fromCookie) {
    return fromCookie;
  }

  const hasSessionCookie = store.has(SESSION_COOKIE_NAME);
  return resolveRequestLocaleFromInput({
    cookieLocale,
    hasSessionCookie,
    recoverUserLocale: async () => {
      const user = await getCurrentUser();
      if (!user) {
        return null;
      }
      return resolveAppLocale(user.locale);
    },
  });
}
