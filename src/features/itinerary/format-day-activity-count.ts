import type { AppTranslator } from "@/features/i18n/create-app-translator";

export function formatDayActivityCount(
  count: number,
  t: AppTranslator<"Common">,
): string {
  return t("activityCount", { count });
}
