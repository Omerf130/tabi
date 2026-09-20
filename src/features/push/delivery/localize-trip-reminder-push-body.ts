import { createAppTranslator } from "@/features/i18n/create-app-translator";
import type { AppLocale } from "@/features/i18n/locale";

export function localizeTripReminderPushBody(locale: AppLocale): string {
  const t = createAppTranslator("PushDelivery", locale);
  return t("tripReminderBody");
}
