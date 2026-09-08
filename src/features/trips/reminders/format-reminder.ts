import { formatTripDayDateLabel } from "@/features/trips/trip-days";

export function formatReminderDateLabel(
  date: string,
  todayJapan: string,
): string {
  if (date === todayJapan) {
    return "היום";
  }

  return formatTripDayDateLabel(date);
}

export function formatReminderDisplayLine(
  date: string,
  time: string,
  todayJapan: string,
): string {
  return `${formatReminderDateLabel(date, todayJapan)} · ${time}`;
}
