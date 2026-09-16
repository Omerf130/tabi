import type { TripThemeKey } from "./trip-theme-keys";

/** Presentation-only decorative layer roles (not persisted domain). */
export type TripThemeAtmosphereLayerRole = "top" | "mid" | "bottom";

export type TripThemeAtmosphereLayer = {
  role: TripThemeAtmosphereLayerRole;
  src: string;
};

/**
 * Central mapping from Trip theme → local public PNG artwork.
 * Paths match the on-disk folders under `public/themes/`.
 * Not every file in public/themes/ must be used — composition over coverage.
 */
export const TRIP_THEME_ATMOSPHERE_LAYERS: Record<
  TripThemeKey,
  readonly TripThemeAtmosphereLayer[]
> = {
  default: [],
  ocean: [
    { role: "top", src: "/themes/ocean/top-wave.png" },
    { role: "mid", src: "/themes/ocean/wave.png" },
    { role: "bottom", src: "/themes/ocean/wave.png" },
  ],
  sakura: [
    { role: "top", src: "/themes/Sakura/sakura-top.png" },
    { role: "mid", src: "/themes/Sakura/sakura.png" },
    { role: "bottom", src: "/themes/Sakura/sakura-bottom.png" },
  ],
  forest: [
    { role: "top", src: "/themes/forest/forest-top.png" },
    { role: "bottom", src: "/themes/forest/forest-bottom.png" },
  ],
  sunset: [{ role: "top", src: "/themes/Sunset/sunset.png" }],
};

/** One representative artwork for Appearance preview cards. */
export const TRIP_THEME_ATMOSPHERE_PREVIEW_SRC: Partial<
  Record<TripThemeKey, string>
> = {
  ocean: "/themes/ocean/top-wave.png",
  sakura: "/themes/Sakura/sakura-top.png",
  forest: "/themes/forest/forest-top.png",
  sunset: "/themes/Sunset/sunset.png",
};

export function listTripThemeAtmosphereLayers(
  themeKey: TripThemeKey,
): readonly TripThemeAtmosphereLayer[] {
  return TRIP_THEME_ATMOSPHERE_LAYERS[themeKey] ?? [];
}
