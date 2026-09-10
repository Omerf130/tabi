import type { TripListType } from "@/features/lists/constants";
import type { TripPhase } from "@/features/trips/trip-phase";

export const TRAVEL_HUB_MANAGE_HREF = (tripId: string): string =>
  `/app/trips/${tripId}/manage`;

export const TRIP_ATTENTION_SECTION_LABELS: Record<
  Exclude<TripPhase, "completed">,
  string
> = {
  upcoming: "לקראת הטיול",
  active: "במהלך הטיול",
};

export const TRIP_ATTENTION_LIST_PRIORITIES: Record<
  Exclude<TripPhase, "completed">,
  readonly TripListType[]
> = {
  upcoming: ["before_trip", "pre_trip_shopping", "packing"],
  active: ["during_trip"],
};

export type TravelToolId =
  | "accommodations"
  | "lists"
  | "currency"
  | "transport"
  | "language"
  | "weather"
  | "emergency"
  | "manage";

export type TravelToolDefinition = {
  id: TravelToolId;
  label: string;
  status: "active" | "coming_soon";
  colorClass: string;
};

export const TRAVEL_TOOLS: readonly TravelToolDefinition[] = [
  {
    id: "accommodations",
    label: "מקומות לינה",
    status: "active",
    colorClass: "toolColorAccommodations",
  },
  {
    id: "lists",
    label: "רשימות",
    status: "active",
    colorClass: "toolColorLists",
  },
  {
    id: "currency",
    label: "מטבע",
    status: "active",
    colorClass: "toolColorCurrency",
  },
  {
    id: "transport",
    label: "תחבורה",
    status: "active",
    colorClass: "toolColorTransport",
  },
  {
    id: "language",
    label: "שפה ותקשורת",
    status: "active",
    colorClass: "toolColorDictionary",
  },
  {
    id: "weather",
    label: "מזג אוויר",
    status: "active",
    colorClass: "toolColorWeather",
  },
  {
    id: "emergency",
    label: "חירום ועזרה",
    status: "active",
    colorClass: "toolColorEmergency",
  },
  {
    id: "manage",
    label: "הגדרות וניהול",
    status: "active",
    colorClass: "toolColorManage",
  },
];

export const CONTEXTUAL_ACCOMMODATION_TITLES = {
  current: "המקום שלך עכשיו",
  upcoming: "הלינה הבאה שלך",
} as const;
