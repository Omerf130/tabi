export const DEFAULT_PHRASEBOOK_PACK_ID = "he-ja";

export const PHRASEBOOK_ERROR_CODES = {
  notFound: "notFound",
  favoriteFailed: "favoriteFailed",
} as const;

export type PhrasebookErrorCode =
  (typeof PHRASEBOOK_ERROR_CODES)[keyof typeof PHRASEBOOK_ERROR_CODES];

export function buildLanguageHref(tripId: string): string {
  return `/app/trips/${tripId}/language`;
}

export function buildLanguagePhraseHref(tripId: string, phraseId: string): string {
  return `/app/trips/${tripId}/language/${phraseId}`;
}

export function buildLanguageCategoryHref(
  tripId: string,
  category: string,
): string {
  const params = new URLSearchParams({ category });
  return `${buildLanguageHref(tripId)}?${params.toString()}`;
}

export function buildLanguageFavoritesHref(tripId: string): string {
  const params = new URLSearchParams({ favorites: "1" });
  return `${buildLanguageHref(tripId)}?${params.toString()}`;
}
