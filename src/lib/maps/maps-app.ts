export const MAPS_APPS = ["google", "waze", "apple"] as const;

export type MapsApp = (typeof MAPS_APPS)[number];

export type PreferredMapsApp = MapsApp | null | undefined;

export function resolvePreferredMapsApp(
  preferredMapsApp: PreferredMapsApp,
): MapsApp {
  if (preferredMapsApp === "google" || preferredMapsApp === "waze" || preferredMapsApp === "apple") {
    return preferredMapsApp;
  }
  return "google";
}

export function parseStoredPreferredMapsApp(
  value: unknown,
): MapsApp | null {
  if (value === "google" || value === "waze" || value === "apple") {
    return value;
  }
  return null;
}
