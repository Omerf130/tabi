import type {
  AccommodationLinkOption,
  ActivityLinkOption,
  TransportLinkOption,
} from "@/features/documents/types";
import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import type { ActivityViewModel } from "./types";

type DocumentLinkType = "none" | "activity" | "accommodation" | "transport";

export type DayDocumentLinkOptions = {
  activityOptions: ActivityLinkOption[];
  accommodationOptions: AccommodationLinkOption[];
  transportOptions: TransportLinkOption[];
  initialLinkType: DocumentLinkType;
  initialActivityId?: string;
  initialAccommodationId?: string;
  initialTransportId?: string;
};

export function buildDayDocumentLinkOptions(
  date: string,
  activities: readonly ActivityViewModel[],
  transports: readonly TransportItineraryItemViewModel[],
  accommodations: readonly AccommodationViewModel[],
): DayDocumentLinkOptions {
  const activityOptions = activities.map((activity) => ({
    id: activity.id,
    date: activity.date,
    label: `${formatCalendarDateDisplay(activity.date)} · ${activity.title}`,
  }));

  const accommodationOptions = accommodations.map((accommodation) => ({
    id: accommodation.id,
    label: `${accommodation.name} · ${formatCalendarDateDisplay(accommodation.checkInDate)}`,
  }));

  const transportOptions = transports.map((transport) => ({
    id: transport.id,
    label: `${transport.routeLabel} · ${formatCalendarDateDisplay(date)}`,
    departureDate: date,
  }));

  const totalEligible =
    activityOptions.length + accommodationOptions.length + transportOptions.length;

  if (totalEligible === 1) {
    if (activityOptions.length === 1) {
      return {
        activityOptions,
        accommodationOptions,
        transportOptions,
        initialLinkType: "activity",
        initialActivityId: activityOptions[0]!.id,
      };
    }
    if (accommodationOptions.length === 1) {
      return {
        activityOptions,
        accommodationOptions,
        transportOptions,
        initialLinkType: "accommodation",
        initialAccommodationId: accommodationOptions[0]!.id,
      };
    }
    return {
      activityOptions,
      accommodationOptions,
      transportOptions,
      initialLinkType: "transport",
      initialTransportId: transportOptions[0]!.id,
    };
  }

  return {
    activityOptions,
    accommodationOptions,
    transportOptions,
    initialLinkType: "none",
  };
}
