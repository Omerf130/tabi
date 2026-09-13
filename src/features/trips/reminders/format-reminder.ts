import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { formatTripDayDateLabel } from "@/features/trips/trip-days";

export function formatReminderDateLabel(
  date: string,
  todayJapan: string,
  t: AppTranslator<"TripReminders">,
): string {
  if (date === todayJapan) {
    return t("todayLabel");
  }

  return formatTripDayDateLabel(date);
}

export function formatReminderDisplayLine(
  date: string,
  time: string,
  todayJapan: string,
  t: AppTranslator<"TripReminders">,
): string {
  return `${formatReminderDateLabel(date, todayJapan, t)} · ${time}`;
}
