import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/features/auth/constants";
import { LOCALE_COOKIE_NAME } from "@/features/i18n/constants";
import { parseAppLocale } from "@/features/i18n/locale";

export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const hasValidLocaleCookie = parseAppLocale(localeCookie) !== null;

  if (request.nextUrl.pathname.startsWith("/app") && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    request.nextUrl.pathname.startsWith("/app") &&
    hasSessionCookie &&
    !hasValidLocaleCookie
  ) {
    const syncUrl = new URL("/auth/sync-locale", request.url);
    syncUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(syncUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
