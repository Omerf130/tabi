export const TRIP_LIST_TYPES = [
  "packing",
  "before_trip",
  "during_trip",
  "pre_trip_shopping",
] as const;

export type TripListType = (typeof TRIP_LIST_TYPES)[number];

export const TRIP_LIST_SLUGS = [
  "packing",
  "before-trip",
  "during-trip",
  "pre-trip-shopping",
] as const;

export type TripListSlug = (typeof TRIP_LIST_SLUGS)[number];

export const TRIP_LIST_ITEM_TEXT_MAX_LENGTH = 120;

export const TRIP_LIST_MESSAGES = {
  created: "הפריט נוסף",
  updated: "הפריט עודכן",
  deleted: "הפריט נמחק",
  completed: "הפריט סומן כהושלם",
  uncompleted: "הפריט סומן כלא הושלם",
  generic: "לא ניתן לעדכן את הרשימה. נסו שוב.",
  notFound: "הפריט לא נמצא",
  deleteConfirm: "למחוק את הפריט?",
} as const;

export const TRIP_LIST_DEFINITIONS: ReadonlyArray<{
  type: TripListType;
  slug: TripListSlug;
  title: string;
  icon: "grid" | "plane" | "itinerary" | "shopping";
}> = [
  { type: "packing", slug: "packing", title: "ציוד לארוז", icon: "grid" },
  {
    type: "before_trip",
    slug: "before-trip",
    title: "מטלות לפני הטיסה",
    icon: "plane",
  },
  {
    type: "during_trip",
    slug: "during-trip",
    title: "מטלות במהלך הטיול",
    icon: "itinerary",
  },
  {
    type: "pre_trip_shopping",
    slug: "pre-trip-shopping",
    title: "קניות לקראת הטיול",
    icon: "shopping",
  },
];

const slugToTypeMap = new Map<TripListSlug, TripListType>(
  TRIP_LIST_DEFINITIONS.map((definition) => [definition.slug, definition.type]),
);

const typeToSlugMap = new Map<TripListType, TripListSlug>(
  TRIP_LIST_DEFINITIONS.map((definition) => [definition.type, definition.slug]),
);

export function isTripListSlug(value: string): value is TripListSlug {
  return TRIP_LIST_SLUGS.includes(value as TripListSlug);
}

export function isTripListType(value: string): value is TripListType {
  return TRIP_LIST_TYPES.includes(value as TripListType);
}

export function getTripListTypeFromSlug(slug: TripListSlug): TripListType {
  return slugToTypeMap.get(slug)!;
}

export function getTripListSlugFromType(type: TripListType): TripListSlug {
  return typeToSlugMap.get(type)!;
}

export function buildListsLandingHref(tripId: string): string {
  return `/app/trips/${tripId}/lists`;
}

export function buildListDetailHref(tripId: string, slug: TripListSlug): string {
  return `/app/trips/${tripId}/lists/${slug}`;
}
