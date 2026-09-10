import { NextRequest, NextResponse } from "next/server";
import { GoogleAuthError } from "@/features/auth/google/errors";
import {
  exchangeGoogleAuthorizationCode,
} from "@/features/auth/google/oauth-client";
import { consumeOAuthState } from "@/features/auth/google/oauth-state";
import { resolveGoogleUser } from "@/features/auth/google/resolve-google-user";
import { verifyGoogleIdToken } from "@/features/auth/google/verify-id-token";
import { createSession } from "@/features/auth/session";

function googleFailureRedirect(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/login?error=google", request.url));
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;

  if (searchParams.has("error")) {
    return googleFailureRedirect(request);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return googleFailureRedirect(request);
  }

  try {
    const stored = await consumeOAuthState(state);
    const { idToken } = await exchangeGoogleAuthorizationCode(
      request.nextUrl.origin,
      code,
    );
    const identity = await verifyGoogleIdToken(idToken);
    const user = await resolveGoogleUser(identity);
    await createSession(user._id.toString());

    const redirectPath = stored.next ?? "/app";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    if (!(error instanceof GoogleAuthError)) {
      // Avoid logging OAuth details or tokens.
    }
    return googleFailureRedirect(request);
  }
}
