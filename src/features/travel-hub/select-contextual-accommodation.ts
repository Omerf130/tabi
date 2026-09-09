import {
  compareAccommodations,
  isAccommodationOccupiedOnDate,
} from "@/features/accommodations/accommodation-domain";
import { compareCalendarDates } from "@/features/trips/calendar-date";
import type { TripPhase } from "@/features/trips/trip-phase";

export type ContextualAccommodationVariant = "current" | "upcoming";

export type ContextualAccommodationInput = {
  id: string;
  checkInDate: string;
  checkOutDate: string;
};

export type ContextualAccommodationResult<T extends ContextualAccommodationInput> = {
  accommodation: T;
  variant: ContextualAccommodationVariant;
};

export function selectContextualAccommodation<T extends ContextualAccommodationInput>(
  accommodations: readonly T[],
  tripPhase: TripPhase,
  todayJapan: string,
): ContextualAccommodationResult<T> | null {
  if (tripPhase === "completed" || accommodations.length === 0) {
    return null;
  }

  const sorted = [...accommodations].sort(compareAccommodations);

  if (tripPhase === "active") {
    const occupied = sorted.filter((accommodation) =>
      isAccommodationOccupiedOnDate(
        accommodation.checkInDate,
        accommodation.checkOutDate,
        todayJapan,
      ),
    );

    if (occupied.length > 0) {
      return { accommodation: occupied[0], variant: "current" };
    }

    const next = sorted.find(
      (accommodation) =>
        compareCalendarDates(accommodation.checkInDate, todayJapan) >= 0,
    );

    return next ? { accommodation: next, variant: "upcoming" } : null;
  }

  const next = sorted.find(
    (accommodation) =>
      compareCalendarDates(accommodation.checkInDate, todayJapan) >= 0,
  );

  if (next) {
    return { accommodation: next, variant: "upcoming" };
  }

  return sorted[0] ? { accommodation: sorted[0], variant: "upcoming" } : null;
}
