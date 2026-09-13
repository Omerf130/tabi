export const AUTH_MESSAGES = {
  generic: "generic",
  invalidCredentials: "invalidCredentials",
  duplicateEmail: "duplicateEmail",
  name: "name",
  email: "email",
  password: "password",
  googleSignInFailed: "googleSignInFailed",
} as const;

export type AuthErrorCode = (typeof AUTH_MESSAGES)[keyof typeof AUTH_MESSAGES];

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

export function duplicateEmailMessage(): AuthErrorCode {
  return AUTH_MESSAGES.duplicateEmail;
}
