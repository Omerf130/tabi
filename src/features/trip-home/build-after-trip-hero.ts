import { getTripDayCount } from "@/features/trips/trip-days";

export type AfterTripDestination = {
  displayName: string;
  country?: string;
};

export function resolveAfterTripIdentityLabel(
  tripName: string,
  destination?: AfterTripDestination | null,
): string {
  const displayName = destination?.displayName?.trim();
  if (displayName) {
    return displayName;
  }
  return tripName;
}

function resolveAfterTripPlaceLabel(
  destination?: AfterTripDestination | null,
  tripName?: string,
): string | null {
  const country = destination?.country?.trim();
  if (country) {
    return country;
  }

  const displayName = destination?.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const name = tripName?.trim();
  if (name) {
    return name;
  }

  return null;
}

export function buildAfterTripDurationLabel(
  startDate: string,
  endDate: string,
  destination?: AfterTripDestination | null,
  tripName?: string,
): string {
  const dayCount = getTripDayCount(startDate, endDate);
  const place = resolveAfterTripPlaceLabel(destination, tripName);

  if (dayCount === 1) {
    return place ? `יום ב${place}` : "יום אחד";
  }

  if (place) {
    return `${dayCount} ימים ב${place}`;
  }

  return `${dayCount} ימים`;
}
