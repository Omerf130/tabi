export const PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH = 2048;
export const PUSH_SUBSCRIPTION_KEY_MAX_LENGTH = 512;

export const PUSH_SUBSCRIPTION_ERROR_CODES = {
  generic: "generic",
  invalidInput: "invalidInput",
  vapidNotConfigured: "vapidNotConfigured",
  forbidden: "forbidden",
} as const;

export type PushSubscriptionErrorCode =
  (typeof PUSH_SUBSCRIPTION_ERROR_CODES)[keyof typeof PUSH_SUBSCRIPTION_ERROR_CODES];

export const PUSH_SW_SCOPE = "/";
