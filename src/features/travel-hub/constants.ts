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
  description: string;
  status: "active" | "coming_soon";
  colorClass: string;
};

export const TRAVEL_TOOLS: readonly TravelToolDefinition[] = [
  {
    id: "accommodations",
    label: "מקומות לינה",
    description: "ההזמנות שלך",
    status: "active",
    colorClass: "toolColorAccommodations",
  },
  {
    id: "lists",
    label: "רשימות",
    description: "ציוד, קניות ועוד",
    status: "active",
    colorClass: "toolColorLists",
  },
  {
    id: "currency",
    label: "מטבע",
    description: "המרת מטבע מהירה",
    status: "active",
    colorClass: "toolColorCurrency",
  },
  {
    id: "transport",
    label: "תחבורה",
    description: "טיסות, רכבות ועוד",
    status: "active",
    colorClass: "toolColorTransport",
  },
  {
    id: "weather",
    label: "מזג אוויר",
    description: "תחזית ליעדים",
    status: "active",
    colorClass: "toolColorWeather",
  },
  {
    id: "language",
    label: "שפה ותקשורת",
    description: "מידע שימושי",
    status: "active",
    colorClass: "toolColorDictionary",
  },
  {
    id: "manage",
    label: "הגדרות וניהול",
    description: "פרטי טיול והרשאות",
    status: "active",
    colorClass: "toolColorManage",
  },
  {
    id: "emergency",
    label: "חירום ועזרה",
    description: "מידע ואנשי קשר",
    status: "active",
    colorClass: "toolColorEmergency",
  },
];

export const CONTEXTUAL_ACCOMMODATION_TITLES = {
  current: "המקום שלך עכשיו",
  upcoming: "הלינה הבאה שלך",
} as const;
