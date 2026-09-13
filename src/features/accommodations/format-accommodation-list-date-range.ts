import { parseCalendarDateParts } from "@/features/trips/calendar-date";

function formatCompactCalendarDate(value: string, includeYear: boolean): string {
  const parts = parseCalendarDateParts(value);
  if (!parts) {
    return value;
  }

  const day = String(parts.day).padStart(2, "0");
  const month = String(parts.month).padStart(2, "0");

  if (includeYear) {
    return `${day}.${month}.${parts.year}`;
  }

  return `${day}.${month}`;
}

export function formatAccommodationListDateRange(
  checkInDate: string,
  checkOutDate: string,
): string {
  const checkInParts = parseCalendarDateParts(checkInDate);
  const checkOutParts = parseCalendarDateParts(checkOutDate);
  const includeYear =
    checkInParts !== null &&
    checkOutParts !== null &&
    checkInParts.year !== checkOutParts.year;

  const checkInLabel = formatCompactCalendarDate(checkInDate, includeYear);
  const checkOutLabel = formatCompactCalendarDate(checkOutDate, includeYear);

  if (checkInDate === checkOutDate) {
    return checkInLabel;
  }

  return `${checkInLabel} – ${checkOutLabel}`;
}
