import type { AppTranslator } from "@/features/i18n/create-app-translator";
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
  t: AppTranslator<"Home">,
  destination?: AfterTripDestination | null,
  tripName?: string,
): string {
  const dayCount = getTripDayCount(startDate, endDate);
  const place = resolveAfterTripPlaceLabel(destination, tripName);

  if (dayCount === 1) {
    return place
      ? t("durationOneDayInPlace", { place })
      : t("durationOneDay");
  }

  if (place) {
    return t("durationDaysInPlace", { count: dayCount, place });
  }

  return t("durationDays", { count: dayCount });
}
