import {
  listAccommodationLinkOptions,
  listActivityLinkOptions,
  listTransportLinkOptions,
} from "@/features/documents/queries";
import { prepareEntityCostFormContext } from "@/features/finance/linked-expense-queries";
import { getInclusiveDateRange } from "@/features/trips/trip-days";
import type { TripMemberRole } from "@/models/TripMember";
import type { QuickAddBootstrap } from "./types";

type TripDatesInput = {
  id: string;
  startDate: string;
  endDate: string;
  role: TripMemberRole;
  destinationCalendarTimeZone: string;
};

export async function loadQuickAddBootstrap(
  trip: TripDatesInput,
): Promise<QuickAddBootstrap> {
  const tripDates = getInclusiveDateRange(trip.startDate, trip.endDate);
  const isOwner = trip.role === "owner";

  const [financeContext, activityOptions, accommodationOptions, transportOptions] =
    await Promise.all([
      isOwner ? prepareEntityCostFormContext(trip.id) : Promise.resolve(null),
      isOwner ? listActivityLinkOptions(trip.id) : Promise.resolve([]),
      isOwner ? listAccommodationLinkOptions(trip.id) : Promise.resolve([]),
      isOwner ? listTransportLinkOptions(trip.id) : Promise.resolve([]),
    ]);

  return {
    startDate: trip.startDate,
    endDate: trip.endDate,
    tripDates,
    destinationCalendarTimeZone: trip.destinationCalendarTimeZone,
    financeBaseCurrency: financeContext?.baseCurrency ?? "ILS",
    currencies: financeContext?.currencies ?? [],
    showCostFields: isOwner,
    documentLinkOptions: {
      activityOptions,
      accommodationOptions,
      transportOptions,
    },
    role: trip.role,
  };
}
