import {
  addCalendarDays,
  compareCalendarDates,
} from "@/features/trips/calendar-date";
import {
  assertAccommodationDateRange,
  isAccommodationOccupiedOnDate,
} from "@/features/accommodations/accommodation-domain";
import { getInclusiveDateRange } from "@/features/trips/trip-days";

export function accommodationOverlapsTripDayRange(
  checkInDate: string,
  checkOutDate: string,
  tripStartDate: string,
  tripEndDate: string,
): boolean {
  for (const day of getInclusiveDateRange(tripStartDate, tripEndDate)) {
    if (isAccommodationOccupiedOnDate(checkInDate, checkOutDate, day)) {
      return true;
    }
  }
  return false;
}

export function clampAccommodationDatesToTrip(
  checkInDate: string,
  checkOutDate: string,
  tripStartDate: string,
  tripEndDate: string,
): { checkInDate: string; checkOutDate: string } | null {
  if (
    !accommodationOverlapsTripDayRange(
      checkInDate,
      checkOutDate,
      tripStartDate,
      tripEndDate,
    )
  ) {
    return null;
  }

  const checkInClamped =
    compareCalendarDates(checkInDate, tripStartDate) < 0
      ? tripStartDate
      : checkInDate;

  const dayAfterTripEnd = addCalendarDays(tripEndDate, 1);
  const checkOutClamped =
    compareCalendarDates(checkOutDate, dayAfterTripEnd) > 0
      ? dayAfterTripEnd
      : checkOutDate;

  if (compareCalendarDates(checkOutClamped, checkInClamped) <= 0) {
    return null;
  }

  try {
    assertAccommodationDateRange(
      checkInClamped,
      checkOutClamped,
      tripStartDate,
      tripEndDate,
    );
    return { checkInDate: checkInClamped, checkOutDate: checkOutClamped };
  } catch {
    return null;
  }
}

export function accommodationDatesUnchangedForTrip(
  checkInDate: string,
  checkOutDate: string,
  tripStartDate: string,
  tripEndDate: string,
): boolean {
  const clamped = clampAccommodationDatesToTrip(
    checkInDate,
    checkOutDate,
    tripStartDate,
    tripEndDate,
  );
  if (!clamped) {
    return false;
  }
  return (
    clamped.checkInDate === checkInDate && clamped.checkOutDate === checkOutDate
  );
}
