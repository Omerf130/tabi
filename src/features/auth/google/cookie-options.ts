import { GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS } from "./constants";

export function googleOAuthStateCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/auth/google",
    maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
  };
}
