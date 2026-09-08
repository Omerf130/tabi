import { compareCalendarDates } from "./calendar-date";
import type { TripListItem } from "./public-trip";
import type { TripPhase } from "./trip-phase";

const PHASE_ORDER: Record<TripPhase, number> = {
  active: 0,
  upcoming: 1,
  completed: 2,
};

export function sortTripListItems(items: TripListItem[]): TripListItem[] {
  return [...items].sort((a, b) => {
    const phaseDiff = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
    if (phaseDiff !== 0) {
      return phaseDiff;
    }

    if (a.phase === "upcoming") {
      return compareCalendarDates(a.startDate, b.startDate);
    }

    if (a.phase === "completed") {
      return compareCalendarDates(b.endDate, a.endDate);
    }

    return compareCalendarDates(a.startDate, b.startDate);
  });
}
