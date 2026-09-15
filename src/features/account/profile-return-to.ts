const OBJECT_ID = "[a-f0-9]{24}";

const PROFILE_RETURN_PATTERNS = [
  new RegExp(`^/app$`),
  new RegExp(`^/app/trips/${OBJECT_ID}$`),
  new RegExp(`^/app/trips/${OBJECT_ID}/manage$`),
  new RegExp(`^/app/trips/${OBJECT_ID}/manage/[a-z]+$`),
];

function decodeReturnTo(value: string): string | null {
  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value && decoded.includes("%")) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function sanitizeProfileReturnTo(value: unknown): string {
  if (typeof value !== "string") {
    return "/app";
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/app";
  }

  if (trimmed.includes("\\") || trimmed.includes("\0")) {
    return "/app";
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return "/app";
  }

  const normalized = decodeReturnTo(trimmed);
  if (!normalized || !normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/app";
  }

  if (PROFILE_RETURN_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return normalized;
  }

  return "/app";
}

export function buildProfileHrefWithReturnTo(returnTo: string): string {
  const safe = sanitizeProfileReturnTo(returnTo);
  return `/app/account/profile?returnTo=${encodeURIComponent(safe)}`;
}

export function buildSettingsProfileHref(tripId: string): string {
  return buildProfileHrefWithReturnTo(`/app/trips/${tripId}/manage`);
}
