const TRAVEL_LANGUAGE_TAG_PATTERN =
  /^[a-z]{2,3}(-([A-Za-z]{2,4}|[0-9]{3}|[a-z0-9]{5,8}))*$/;

/**
 * Normalizes a BCP-47-style language tag for Azure Translator compatibility.
 * Returns null when the input cannot represent a valid travel language code.
 */
export function normalizeTravelLanguageCode(
  raw: string | undefined | null,
): string | null {
  if (raw == null) {
    return null;
  }

  const tag = raw.trim().replace(/_/g, "-");
  if (!tag) {
    return null;
  }

  const segments = tag.split("-").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const language = segments[0].toLowerCase();
  if (!/^[a-z]{2,3}$/.test(language)) {
    return null;
  }

  const rest = segments.slice(1).map((segment, index) => {
    if (index === 0 && segment.length === 4) {
      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    }
    if (segment.length === 2) {
      return segment.toUpperCase();
    }
    if (/^[0-9]{3}$/.test(segment)) {
      return segment;
    }
    return segment.toLowerCase();
  });

  let normalized: string;

  if (language === "zh") {
    const script = rest.find((segment) => segment === "Hans" || segment === "Hant");
    if (script === "Hant") {
      normalized = "zh-Hant";
    } else if (script === "Hans") {
      normalized = "zh-Hans";
    } else {
      normalized = "zh-Hans";
    }
  } else if (language === "sr") {
    const script = rest.find((segment) => segment === "Cyrl" || segment === "Latn");
    if (script === "Latn") {
      normalized = "sr-Latn";
    } else if (script === "Cyrl") {
      normalized = "sr-Cyrl";
    } else {
      normalized = language;
    }
  } else if (rest.length === 0) {
    normalized = language;
  } else if (rest.length === 1 && rest[0].length === 2) {
    normalized = `${language}-${rest[0]}`;
  } else {
    normalized = [language, ...rest].join("-");
  }

  if (!TRAVEL_LANGUAGE_TAG_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export function isValidTravelLanguageCode(raw: string | undefined | null): boolean {
  return normalizeTravelLanguageCode(raw) !== null;
}
