import type { TripListType } from "@/features/lists/constants";
import type { TripPhase } from "@/features/trips/trip-phase";

export const TRAVEL_HUB_MANAGE_HREF = (tripId: string): string =>
  `/app/trips/${tripId}/manage`;

export type TravelHubQuickToolId =
  | "currency"
  | "weather"
  | "language"
  | "emergency";

export type TravelHubQuickToolDefinition = {
  id: TravelHubQuickToolId;
  colorClass: string;
};

export const TRAVEL_HUB_QUICK_TOOLS: readonly TravelHubQuickToolDefinition[] = [
  {
    id: "currency",
    colorClass: "toolColorCurrency",
  },
  {
    id: "weather",
    colorClass: "toolColorWeather",
  },
  {
    id: "language",
    colorClass: "toolColorDictionary",
  },
  {
    id: "emergency",
    colorClass: "toolColorEmergency",
  },
];

export const TRIP_ATTENTION_LIST_PRIORITIES: Record<
  Exclude<TripPhase, "completed">,
  readonly TripListType[]
> = {
  upcoming: ["before_trip", "pre_trip_shopping", "packing"],
  active: ["during_trip"],
};
