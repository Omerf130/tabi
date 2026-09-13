import { NextRequest, NextResponse } from "next/server";
import { sessionCookieOptions } from "@/features/auth/cookie-options";
import { getCurrentUser } from "@/features/auth/session";
import { sanitizeReturnTo } from "@/features/auth/return-to";
import { LOCALE_COOKIE_NAME } from "@/features/i18n/constants";
import { resolveAppLocale } from "@/features/i18n/locale";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const locale = resolveAppLocale(user.locale);
  const next =
    sanitizeReturnTo(request.nextUrl.searchParams.get("next")) ?? "/app";
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(
    LOCALE_COOKIE_NAME,
    locale,
    sessionCookieOptions(process.env.NODE_ENV === "production"),
  );

  return response;
}
