export const TRIP_THEME_KEYS = [
  "default",
  "ocean",
  "sakura",
  "forest",
  "sunset",
] as const;

export type TripThemeKey = (typeof TRIP_THEME_KEYS)[number];

export const DEFAULT_TRIP_THEME_KEY: TripThemeKey = "default";

export function isTripThemeKey(value: string): value is TripThemeKey {
  return (TRIP_THEME_KEYS as readonly string[]).includes(value);
}
