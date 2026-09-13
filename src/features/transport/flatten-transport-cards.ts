import { compareCalendarDates } from "@/features/trips/calendar-date";
import { compareTransportDepartureTimesForSameDay } from "./transport-datetime";
import type { TransportType } from "./transport-types";
import type { TransportCardViewModel } from "./types";

export function flattenTransportCards(
  groupedTransports: Record<TransportType, TransportCardViewModel[]>,
): TransportCardViewModel[] {
  const cards = Object.values(groupedTransports).flat();

  return cards.sort((left, right) => {
    const byDate = compareCalendarDates(left.departureDate, right.departureDate);
    if (byDate !== 0) {
      return byDate;
    }

    const byTime = compareTransportDepartureTimesForSameDay(
      left.departureTime,
      right.departureTime,
    );
    if (byTime !== 0) {
      return byTime;
    }

    return left.id.localeCompare(right.id);
  });
}
