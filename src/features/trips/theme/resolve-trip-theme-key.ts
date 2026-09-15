import {
  DEFAULT_TRIP_THEME_KEY,
  isTripThemeKey,
  type TripThemeKey,
} from "./trip-theme-keys";

/**
 * Resolves the effective Trip theme for presentation.
 * Missing or invalid persisted values fall back to the canonical default.
 */
export function resolveTripThemeKey(value: unknown): TripThemeKey {
  if (typeof value === "string" && isTripThemeKey(value)) {
    return value;
  }
  return DEFAULT_TRIP_THEME_KEY;
}
