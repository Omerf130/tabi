import {
  isValidVisualKey,
  NEUTRAL_FALLBACK_VISUAL_SRC,
  resolveVisualSrc,
} from "./registry";

export function resolveTripVisualSrc(input: {
  hasCoverImage: boolean;
  tripId: string;
  coverVisualKey?: string | null;
}): { imageSrc: string; hasPersistedCover: boolean } {
  if (input.hasCoverImage) {
    return {
      imageSrc: `/app/trips/${input.tripId}/cover`,
      hasPersistedCover: true,
    };
  }

  if (input.coverVisualKey && isValidVisualKey(input.coverVisualKey)) {
    return {
      imageSrc: resolveVisualSrc(input.coverVisualKey),
      hasPersistedCover: false,
    };
  }

  return {
    imageSrc: NEUTRAL_FALLBACK_VISUAL_SRC,
    hasPersistedCover: false,
  };
}
