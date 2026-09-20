import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { PushSubscriptionErrorCode } from "./constants";

export function translatePushSubscriptionError(
  t: AppTranslator<"AccountNotifications">,
  code?: PushSubscriptionErrorCode,
): string | undefined {
  if (!code) {
    return undefined;
  }

  return t(`errors.${code}`);
}
