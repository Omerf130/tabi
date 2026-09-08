export const AUTH_MESSAGES = {
  generic: "משהו השתבש. נסו שוב.",
  invalidCredentials: "אימייל או סיסמה אינם נכונים",
  duplicateEmail: "כתובת האימייל כבר רשומה",
  name: "נא להזין שם תקין",
  email: "נא להזין אימייל תקין",
  password: "הסיסמה חייבת להכיל בין 8 ל-256 תווים",
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
