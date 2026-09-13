import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type {
  TripReminderErrorCode,
  TripReminderSuccessCode,
} from "./constants";

export function translateReminderError(
  t: AppTranslator<"TripReminders">,
  code?: TripReminderErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as TripReminderErrorCode}`);
}

export function translateReminderSuccess(
  t: AppTranslator<"TripReminders">,
  code?: TripReminderSuccessCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  return t(`errors.${code as TripReminderSuccessCode}`);
}
