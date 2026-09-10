export const GOOGLE_OAUTH_STATE_COOKIE = "tabi_google_oauth_state";
export const GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

export const GOOGLE_OAUTH_SCOPES = ["openid", "email", "profile"] as const;

export const GOOGLE_OAUTH_CALLBACK_PATH = "/auth/google/callback";
