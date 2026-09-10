import "server-only";

import { OAuth2Client } from "google-auth-library";
import { GOOGLE_OAUTH_CALLBACK_PATH, GOOGLE_OAUTH_SCOPES } from "./constants";

function getGoogleOAuthClientId(): string {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID is not configured");
  }
  return clientId;
}

function getGoogleOAuthClientSecret(): string {
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("GOOGLE_OAUTH_CLIENT_SECRET is not configured");
  }
  return clientSecret;
}

export function buildGoogleRedirectUri(origin: string): string {
  return new URL(GOOGLE_OAUTH_CALLBACK_PATH, origin).toString();
}

function createOAuthClient(redirectUri: string): OAuth2Client {
  return new OAuth2Client({
    clientId: getGoogleOAuthClientId(),
    clientSecret: getGoogleOAuthClientSecret(),
    redirectUri,
  });
}

export function buildGoogleAuthorizationUrl(origin: string, state: string): string {
  const client = createOAuthClient(buildGoogleRedirectUri(origin));
  return client.generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: [...GOOGLE_OAUTH_SCOPES],
    state,
  });
}

export async function exchangeGoogleAuthorizationCode(
  origin: string,
  code: string,
): Promise<{ idToken: string }> {
  const client = createOAuthClient(buildGoogleRedirectUri(origin));
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    throw new Error("Missing Google ID token");
  }
  return { idToken: tokens.id_token };
}

export function getGoogleOAuthClientIdForVerification(): string {
  return getGoogleOAuthClientId();
}
