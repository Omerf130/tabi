import type { PhrasebookCategory } from "./types";

export const DEFAULT_PHRASEBOOK_PACK_ID = "he-ja";

export const PHRASEBOOK_PAGE_TITLE = "שפה ותקשורת";

export const PHRASEBOOK_CATEGORY_LABELS: Record<PhrasebookCategory, string> = {
  basics: "בסיסי",
  restaurants: "מסעדות",
  transport: "תחבורה",
  hotel: "מלון",
  shopping: "קניות",
  directions: "התמצאות",
  emergency: "חירום ובריאות",
  numbers_time: "מספרים וזמן",
};

export const PHRASEBOOK_MESSAGES = {
  notFound: "הביטוי לא נמצא",
  favoriteFailed: "לא ניתן לעדכן מועדפים",
  noResults: "לא נמצאו ביטויים",
  noFavorites: "אין מועדפים עדיין",
  favoritesSection: "מועדפים",
  searchPlaceholder: "חיפוש ביטוי…",
  showAll: "כל הביטויים",
  favoriteAdd: "הוספה למועדפים",
  favoriteRemove: "הסרה מהמועדפים",
} as const;

export function buildLanguageHref(tripId: string): string {
  return `/app/trips/${tripId}/language`;
}

export function buildLanguagePhraseHref(tripId: string, phraseId: string): string {
  return `/app/trips/${tripId}/language/${phraseId}`;
}

export function buildLanguageCategoryHref(
  tripId: string,
  category: PhrasebookCategory,
): string {
  const params = new URLSearchParams({ category });
  return `${buildLanguageHref(tripId)}?${params.toString()}`;
}

export function buildLanguageFavoritesHref(tripId: string): string {
  const params = new URLSearchParams({ favorites: "1" });
  return `${buildLanguageHref(tripId)}?${params.toString()}`;
}
