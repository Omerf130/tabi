export const MEMBER_ERROR_CODES = {
  generic: "generic",
  lastOwner: "lastOwner",
} as const;

export type MemberErrorCode =
  (typeof MEMBER_ERROR_CODES)[keyof typeof MEMBER_ERROR_CODES];

export const MEMBER_SUCCESS_CODES = {
  removed: "removed",
  roleChanged: "roleChanged",
} as const;

export type MemberSuccessCode =
  (typeof MEMBER_SUCCESS_CODES)[keyof typeof MEMBER_SUCCESS_CODES];
