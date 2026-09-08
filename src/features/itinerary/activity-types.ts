export const ACTIVITY_TYPES = [
  "attraction",
  "transport",
  "restaurant",
  "hotel",
  "freeTime",
  "shopping",
  "other",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  attraction: "אטרקציה",
  transport: "תחבורה",
  restaurant: "מסעדה",
  hotel: "לינה",
  freeTime: "זמן חופשי",
  shopping: "קניות",
  other: "אחר",
};
