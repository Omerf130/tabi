import { SESSION_MAX_AGE_SECONDS } from "./constants";

export function sessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProduction,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
