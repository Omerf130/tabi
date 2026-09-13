import type { AppTranslator } from "@/features/i18n/create-app-translator";

export function confirmDayActionDiscard(
  isDirty: boolean,
  t: AppTranslator<"Activity">,
): boolean {
  if (!isDirty) {
    return true;
  }

  return window.confirm(t("errors.discardConfirm"));
}
