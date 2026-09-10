import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";

export function resolveTripCardVisual(
  tripId: string,
  hasCoverImage: boolean,
  coverVisualKey?: string | null,
): { imageSrc: string; hasPersistedCover: boolean } {
  return resolveTripVisualSrc({
    hasCoverImage,
    tripId,
    coverVisualKey,
  });
}
