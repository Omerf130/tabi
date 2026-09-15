export const PLACE_IMAGE_FALLBACK_ICONS = [
  "activity-other",
  "activity-hotel",
  "accommodation",
] as const;

export type PlaceImageFallbackIcon = (typeof PLACE_IMAGE_FALLBACK_ICONS)[number];
