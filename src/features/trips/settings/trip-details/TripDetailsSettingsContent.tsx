import { getLocale } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { resolveAppLocale } from "@/features/i18n/locale";
import { requireTripMember } from "@/features/trips/authorization";
import {
  formatCalendarDateDisplay,
  formatCalendarDateRangeDisplay,
} from "@/features/trips/calendar-date";
import { TripDetailsSettingsClient } from "./TripDetailsSettings.client";

type TripDetailsSettingsContentProps = {
  tripId: string;
};

function formatDestinationLabel(
  destination: { displayName: string; country?: string } | undefined,
): string {
  if (!destination?.displayName) {
    return "";
  }
  if (destination.country && destination.country !== destination.displayName) {
    return `${destination.displayName}, ${destination.country}`;
  }
  return destination.displayName;
}

export async function TripDetailsSettingsContent({
  tripId,
}: TripDetailsSettingsContentProps) {
  const [trip, localeRaw] = await Promise.all([
    requireTripMember(tripId),
    getLocale(),
  ]);
  const locale = resolveAppLocale(localeRaw);

  const model = {
    tripId: trip.id,
    name: trip.name,
    description: trip.description ?? "",
    destinationLabel: formatDestinationLabel(trip.destination),
    dateRangeLabel: formatCalendarDateRangeDisplay(
      trip.startDate,
      trip.endDate,
      locale,
    ),
    startDateLabel: formatCalendarDateDisplay(trip.startDate, locale),
    endDateLabel: formatCalendarDateDisplay(trip.endDate, locale),
    hasCover: Boolean(trip.coverImage),
    coverVisualKey: trip.coverVisualKey ?? null,
    isOwner: trip.role === "owner",
  };

  return (
    <AppPage width="wide">
      <TripDetailsSettingsClient model={model} />
    </AppPage>
  );
}
