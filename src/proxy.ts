import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/features/auth/constants";

export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (request.nextUrl.pathname.startsWith("/app") && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
