import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from "../constants";

function isValidUserName(name: string | undefined | null): name is string {
  if (!name) {
    return false;
  }
  const trimmed = name.trim();
  return trimmed.length >= NAME_MIN_LENGTH && trimmed.length <= NAME_MAX_LENGTH;
}

/** Derive a human-readable name from a verified email local part. */
export function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "Traveler";
  const cleaned = localPart
    .replace(/[._+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const candidate =
    cleaned.length >= NAME_MIN_LENGTH
      ? cleaned
      : `${cleaned || "Traveler"} User`.trim();

  if (candidate.length <= NAME_MAX_LENGTH) {
    return candidate;
  }

  return candidate.slice(0, NAME_MAX_LENGTH).trimEnd();
}

export function resolveGoogleUserName(
  profileName: string | undefined | null,
  verifiedEmail: string,
): string {
  if (isValidUserName(profileName)) {
    return profileName.trim();
  }
  return deriveNameFromEmail(verifiedEmail);
}
