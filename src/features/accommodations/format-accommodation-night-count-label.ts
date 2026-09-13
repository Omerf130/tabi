import type { AppTranslator } from "@/features/i18n/create-app-translator";

export function formatAccommodationNightCountLabel(
  nightCount: number,
  t: AppTranslator<"Accommodation">,
): string {
  if (nightCount === 1) {
    return t("nightCountOne");
  }

  return t("nightCountMany", { count: nightCount });
}
