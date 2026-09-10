import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthorizationUrl } from "@/features/auth/google/oauth-client";
import {
  generateOAuthState,
  setOAuthStateCookie,
} from "@/features/auth/google/oauth-state";
import { sanitizeReturnTo } from "@/features/auth/return-to";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const next = sanitizeReturnTo(request.nextUrl.searchParams.get("next"));
  const state = generateOAuthState();

  await setOAuthStateCookie({ state, next });

  const authorizationUrl = buildGoogleAuthorizationUrl(request.nextUrl.origin, state);
  return NextResponse.redirect(authorizationUrl);
}
