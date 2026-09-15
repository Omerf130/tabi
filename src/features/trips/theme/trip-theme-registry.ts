import {
  DEFAULT_TRIP_THEME_KEY,
  TRIP_THEME_KEYS,
  type TripThemeKey,
} from "./trip-theme-keys";

export type TripThemeDefinition = {
  key: TripThemeKey;
  /** Relative keys under the `TripTheme` next-intl namespace (S4C UI). */
  nameMessageKey: string;
  descriptionMessageKey: string;
  enabled: boolean;
};

export const TRIP_THEME_REGISTRY: ReadonlyArray<TripThemeDefinition> = [
  {
    key: "default",
    nameMessageKey: "themes.default.name",
    descriptionMessageKey: "themes.default.description",
    enabled: true,
  },
  {
    key: "ocean",
    nameMessageKey: "themes.ocean.name",
    descriptionMessageKey: "themes.ocean.description",
    enabled: true,
  },
  {
    key: "sakura",
    nameMessageKey: "themes.sakura.name",
    descriptionMessageKey: "themes.sakura.description",
    enabled: false,
  },
  {
    key: "forest",
    nameMessageKey: "themes.forest.name",
    descriptionMessageKey: "themes.forest.description",
    enabled: false,
  },
  {
    key: "sunset",
    nameMessageKey: "themes.sunset.name",
    descriptionMessageKey: "themes.sunset.description",
    enabled: false,
  },
];

const registryByKey = new Map<TripThemeKey, TripThemeDefinition>(
  TRIP_THEME_REGISTRY.map((definition) => [definition.key, definition]),
);

export function getTripThemeDefinition(key: TripThemeKey): TripThemeDefinition {
  const definition = registryByKey.get(key);
  if (!definition) {
    return registryByKey.get(DEFAULT_TRIP_THEME_KEY)!;
  }
  return definition;
}

/** Themes owners can choose in Settings (requires a runtime CSS palette). */
export function listSelectableTripThemes(): ReadonlyArray<TripThemeDefinition> {
  return TRIP_THEME_REGISTRY.filter((definition) => definition.enabled);
}

export function isTripThemeSelectable(key: TripThemeKey): boolean {
  return getTripThemeDefinition(key).enabled;
}

/** Registry keys must match the canonical finite key list. */
export function assertTripThemeRegistryMatchesKeys(): void {
  const registryKeys = TRIP_THEME_REGISTRY.map((d) => d.key).sort();
  const canonicalKeys = [...TRIP_THEME_KEYS].sort();
  if (registryKeys.join(",") !== canonicalKeys.join(",")) {
    throw new Error("TRIP_THEME_REGISTRY keys diverge from TRIP_THEME_KEYS");
  }
}

assertTripThemeRegistryMatchesKeys();
