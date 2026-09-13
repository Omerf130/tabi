import type { MyTripsFilter } from "./filter-my-trips";

export const MY_TRIPS_FALLBACK_VISUAL = "/destination-visuals/homeApp.png";

/** Cinematic account-level hero — existing destination visual asset. */
export const MY_TRIPS_HERO_VISUAL = "/destination-visuals/japan.png";

export const CREATE_TRIP_PATH = "/app/trips/new";

export const MY_TRIPS_PHASE_LABELS = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Past",
} as const;

export const MY_TRIPS_FILTER_LABELS: Record<MyTripsFilter, string> = {
  all: "All",
  upcoming: "Upcoming",
  past: "Past",
};

export const MY_TRIPS_EMPTY_COPY: Record<
  MyTripsFilter,
  { title: string; body: string; cta?: string }
> = {
  all: {
    title: "No trips yet",
    body: "Start planning your next adventure and keep all your trips in one place.",
    cta: "Plan Your First Trip →",
  },
  upcoming: {
    title: "No upcoming trips",
    body: "When you plan your next journey, it will appear here.",
    cta: "Plan a Trip →",
  },
  past: {
    title: "No past trips yet",
    body: "Completed adventures will be collected here for you to revisit.",
  },
};
