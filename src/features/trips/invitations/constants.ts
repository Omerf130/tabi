export const INVITE_EXPIRY_DAYS = 7;

export const INVITE_ERROR_CODES = {
  generic: "generic",
  invalid: "invalid",
  alreadyMember: "alreadyMember",
  accepted: "accepted",
  revoked: "revoked",
} as const;

export type InviteErrorCode =
  (typeof INVITE_ERROR_CODES)[keyof typeof INVITE_ERROR_CODES];
