import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "./constants";

const FALLBACK_NAME = "Tabi Traveler";

export function deriveRegistrationNameFromEmail(email: string): string {
  const localPart = email.trim().split("@")[0]?.replace(/[._+-]+/g, " ").trim() ?? "";

  if (localPart.length >= NAME_MIN_LENGTH) {
    return localPart.slice(0, NAME_MAX_LENGTH);
  }

  return FALLBACK_NAME;
}
