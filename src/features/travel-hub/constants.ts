import type { TripListType } from "@/features/lists/constants";
import type { TripPhase } from "@/features/trips/trip-phase";

export const TRAVEL_HUB_MANAGE_HREF = (tripId: string): string =>
  `/app/trips/${tripId}/manage`;

export const TRAVEL_HUB_HERO = {
  title: "כלי הטיול",
  subtitle: "מה שצריך לטיול החלק",
} as const;

export const TRAVEL_HUB_MANAGEMENT_LABEL = "ניהול הטיול";

export const TRAVEL_HUB_ACCOMMODATION = {
  title: "לינה",
  emptyLine: "עדיין לא נוספו מקומות לינה",
  countOne: "מקום לינה אחד",
  countMany: (count: number) => `${count} מקומות לינה`,
  detailCurrent: (name: string) => `עכשיו: ${name}`,
  detailUpcoming: (name: string) => `הבא: ${name}`,
} as const;

export const TRAVEL_HUB_TRANSPORT = {
  title: "תחבורה",
  emptyLine: "עדיין לא נוספו נסיעות",
  countOne: "קטע תחבורה אחד",
  countMany: (count: number) => `${count} קטעי תחבורה`,
} as const;

export const TRAVEL_HUB_LISTS = {
  title: "רשימות",
  emptyPrimary: "רשימות לטיול",
} as const;

export const TRAVEL_HUB_DOCUMENTS = {
  title: "מסמכים",
  emptyPrimary: "המסמכים החשובים לטיול",
  countOne: "מסמך אחד",
  countMany: (count: number) => `${count} מסמכים`,
} as const;

export type TravelHubQuickToolId =
  | "currency"
  | "weather"
  | "language"
  | "emergency";

export type TravelHubQuickToolDefinition = {
  id: TravelHubQuickToolId;
  label: string;
  description: string;
  colorClass: string;
};

export const TRAVEL_HUB_QUICK_TOOLS: readonly TravelHubQuickToolDefinition[] = [
  {
    id: "currency",
    label: "מטבע",
    description: "המרת מטבע",
    colorClass: "toolColorCurrency",
  },
  {
    id: "weather",
    label: "מזג אוויר",
    description: "תחזית לטיול",
    colorClass: "toolColorWeather",
  },
  {
    id: "language",
    label: "שפה ותקשורת",
    description: "שפה ותקשורת",
    colorClass: "toolColorDictionary",
  },
  {
    id: "emergency",
    label: "חירום ועזרה",
    description: "מידע חשוב",
    colorClass: "toolColorEmergency",
  },
];

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

export const CONTEXTUAL_ACCOMMODATION_TITLES = {
  current: "המקום שלך עכשיו",
  upcoming: "הלינה הבאה שלך",
} as const;
