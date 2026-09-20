import { getTripPhase } from "@/features/trips/trip-phase";

export function resolveFocusedItineraryDay(
  startDate: string,
  endDate: string,
  todayTripLocal: string,
): string | null {
  const phase = getTripPhase(startDate, endDate, todayTripLocal);

  if (phase === "upcoming") {
    return startDate;
  }

  if (phase === "active") {
    return todayTripLocal;
  }

  return null;
}
