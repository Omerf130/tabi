export const AUTH_MESSAGES = {
  generic: "Something went wrong. Please try again.",
  invalidCredentials: "Email or password is incorrect",
  duplicateEmail: "This email is already registered",
  name: "Please enter a valid name",
  email: "Please enter a valid email",
  password: "Password must be between 8 and 256 characters",
  googleSignInFailed:
    "We couldn't sign you in with Google. Please try again.",
} as const;

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

export function duplicateEmailMessage(): string {
  return AUTH_MESSAGES.duplicateEmail;
}
