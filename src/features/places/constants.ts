export const PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH = 3;
export const PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH = 120;
export const PLACES_AUTOCOMPLETE_DEBOUNCE_MS = 300;
export const PLACES_AUTOCOMPLETE_MAX_SUGGESTIONS = 5;
export const PLACES_INCLUDED_REGION_CODES = ["jp"] as const;
export const PLACES_SEARCH_LANGUAGE_CODE = "en";
export const PLACES_DISPLAY_LANGUAGE_CODE = "ja";

/** Lodging bias for Accommodation; other features may override via request. */
export const PLACES_LODGING_PRIMARY_TYPES = ["lodging"] as const;

export const PLACES_AUTOCOMPLETE_FIELD_MASK =
  "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat";

export const PLACES_DETAILS_FIELD_MASK =
  "id,displayName,formattedAddress,googleMapsUri,addressComponents";

export const PLACES_PHOTO_FIELD_MASK = "photos";

export const PLACES_DISPLAY_CACHE_TTL_MS = 60 * 60 * 1000;

export const PLACES_RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const PLACES_RATE_LIMIT_MAX_REQUESTS = 40;

export const PLACES_MESSAGES = {
  missingApiKey: "Google Places is not configured",
  autocompleteFailed: "לא ניתן לטעון הצעות. נסו שוב.",
  resolveFailed: "לא ניתן לטעון פרטי המקום. נסו שוב.",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  invalidInput: "Invalid request",
  rateLimited: "Too many requests",
} as const;

export const GOOGLE_ATTRIBUTION = {
  label: "Google Maps",
  poweredByText: "Powered by Google",
} as const;
