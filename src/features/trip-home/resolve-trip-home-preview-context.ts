import { addCalendarDays, getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getJapanWallClockTime } from "@/features/trips/japan-wall-clock";
import type { TripPhase } from "@/features/trips/trip-phase";

export const TRIP_HOME_PREVIEW_WALL_CLOCK_TIME = "12:00";

export const TRIP_HOME_PREVIEW_BEFORE_DAY_OFFSET = -30;

export type TripHomePreviewPhaseParam = "before" | "during" | "after";

export type TripHomePreviewContext = {
  todayJapan: string;
  nowJapanTime: string;
  isPreview: false;
};

export type TripHomeActivePreviewContext = {
  todayJapan: string;
  nowJapanTime: string;
  isPreview: true;
  previewPhase: TripHomePreviewPhaseParam;
  forcedPhase: TripPhase;
};

export type ResolvedTripHomePreviewContext =
  | TripHomePreviewContext
  | TripHomeActivePreviewContext;

function parseTripHomePreviewPhaseParam(
  value: string | null | undefined,
): TripHomePreviewPhaseParam | null {
  if (value === "before" || value === "during" || value === "after") {
    return value;
  }
  return null;
}

function previewPhaseToForcedPhase(
  previewPhase: TripHomePreviewPhaseParam,
): TripPhase {
  switch (previewPhase) {
    case "before":
      return "upcoming";
    case "during":
      return "active";
    case "after":
      return "completed";
  }
}

function resolvePreviewTodayJapan(
  previewPhase: TripHomePreviewPhaseParam,
  startDate: string,
  endDate: string,
): string {
  switch (previewPhase) {
    case "during":
      return startDate;
    case "before":
      return addCalendarDays(startDate, TRIP_HOME_PREVIEW_BEFORE_DAY_OFFSET);
    case "after":
      return addCalendarDays(endDate, 1);
  }
}

const PREVIEW_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTripHomePreviewTimeParam(
  value: string | null | undefined,
): string | null {
  if (!value || !PREVIEW_TIME_PATTERN.test(value)) {
    return null;
  }
  return value;
}

function resolvePreviewWallClockTime(
  previewPhase: TripHomePreviewPhaseParam,
  previewTime?: string | null,
): string {
  if (previewPhase !== "during") {
    return TRIP_HOME_PREVIEW_WALL_CLOCK_TIME;
  }

  return parseTripHomePreviewTimeParam(previewTime) ?? TRIP_HOME_PREVIEW_WALL_CLOCK_TIME;
}

export function resolveTripHomePreviewContext(input: {
  startDate: string;
  endDate: string;
  previewPhase?: string | null;
  previewTime?: string | null;
}): ResolvedTripHomePreviewContext {
  const productionContext: TripHomePreviewContext = {
    todayJapan: getJapanCalendarDate(),
    nowJapanTime: getJapanWallClockTime(),
    isPreview: false,
  };

  if (process.env.NODE_ENV !== "development") {
    return productionContext;
  }

  const previewPhase = parseTripHomePreviewPhaseParam(input.previewPhase);
  if (!previewPhase) {
    return productionContext;
  }

  return {
    todayJapan: resolvePreviewTodayJapan(
      previewPhase,
      input.startDate,
      input.endDate,
    ),
    nowJapanTime: resolvePreviewWallClockTime(previewPhase, input.previewTime),
    isPreview: true,
    previewPhase,
    forcedPhase: previewPhaseToForcedPhase(previewPhase),
  };
}
