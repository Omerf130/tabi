import "server-only";

import { OAuth2Client } from "google-auth-library";
import { GoogleIdentityInvalidError } from "./errors";
import { getGoogleOAuthClientIdForVerification } from "./oauth-client";

export type VerifiedGoogleIdentity = {
  sub: string;
  email: string;
  name?: string;
  emailVerified: true;
};

export async function verifyGoogleIdToken(
  idToken: string,
): Promise<VerifiedGoogleIdentity> {
  const client = new OAuth2Client(getGoogleOAuthClientIdForVerification());
  const ticket = await client.verifyIdToken({
    idToken,
    audience: getGoogleOAuthClientIdForVerification(),
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new GoogleIdentityInvalidError();
  }

  const sub = payload.sub?.trim();
  const email = payload.email?.trim().toLowerCase();
  const emailVerified = payload.email_verified === true;

  if (!sub || !email || !emailVerified) {
    throw new GoogleIdentityInvalidError();
  }

  return {
    sub,
    email,
    name: payload.name?.trim() || undefined,
    emailVerified: true,
  };
}
