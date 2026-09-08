import type { ActivityViewModel } from "@/features/itinerary/types";
import {
  formatCalendarDateRangeDisplay,
  getJapanCalendarDate,
} from "@/features/trips/calendar-date";
import { getCalendarDaysUntil } from "@/features/trips/calendar-day-diff";
import { getJapanWallClockTime } from "@/features/trips/japan-wall-clock";
import { getTripPhase } from "@/features/trips/trip-phase";
import {
  formatTripDayDateLabel,
  formatTripDayHeading,
  formatTripDayWeekday,
  getTripDayCount,
  getTripDayNumber,
} from "@/features/trips/trip-days";
import {
  buildActiveItineraryPreview,
  buildUpcomingItineraryPreview,
} from "./build-itinerary-preview";
import type { DailyItinerarySummary, TripHomeReminderStrip, TripHomeViewModel } from "./types";
import { HOME_REMINDER_EMPTY_MESSAGE } from "@/features/trips/reminders/select-today-home-reminders";
import { getTripRemindersSettingsHref } from "@/features/trips/reminders/constants";
import type { TodayHomeReminderItem } from "@/features/trips/reminders/select-today-home-reminders";

type BuildTripHomeViewModelInput = {
  trip: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  coverImageHref?: string;
  dayActivities?: readonly ActivityViewModel[];
  todayReminders?: readonly TodayHomeReminderItem[];
  todayJapan?: string;
  nowJapanTime?: string;
};

function formatCountdownLabel(daysUntilStart: number): string {
  if (daysUntilStart === 0) {
    return "היום מתחילים";
  }
  if (daysUntilStart === 1) {
    return "עוד יום אחד";
  }
  return `עוד ${daysUntilStart} ימים`;
}

export function buildTripHomeViewModel({
  trip,
  coverImageHref,
  dayActivities = [],
  todayReminders = [],
  todayJapan = getJapanCalendarDate(),
  nowJapanTime = getJapanWallClockTime(),
}: BuildTripHomeViewModelInput): TripHomeViewModel {
  const phase = getTripPhase(trip.startDate, trip.endDate, todayJapan);
  const dateRangeLabel = formatCalendarDateRangeDisplay(
    trip.startDate,
    trip.endDate,
  );
  const totalDays = getTripDayCount(trip.startDate, trip.endDate);
  const basePath = `/app/trips/${trip.id}/itinerary`;
  const reminderStrip: TripHomeReminderStrip = {
    reminders: todayReminders.map((reminder) => ({
      id: reminder.id,
      time: reminder.time,
      text: reminder.text,
    })),
    settingsHref: getTripRemindersSettingsHref(trip.id),
    emptyMessage: HOME_REMINDER_EMPTY_MESSAGE,
  };
  const shared = {
    tripName: trip.name,
    totalDays,
    coverImageHref,
    reminderStrip,
  };

  if (phase === "upcoming") {
    const countdownDays = getCalendarDaysUntil(todayJapan, trip.startDate);
    const preview = buildUpcomingItineraryPreview(dayActivities);
    const itineraryHref = `${basePath}?date=${trip.startDate}`;
    const dailyItinerary: DailyItinerarySummary = {
      title: "היום הראשון",
      subtitle: `${formatTripDayWeekday(trip.startDate)} · ${formatTripDayDateLabel(trip.startDate)}`,
      dayMeta: `יום 1 מתוך ${totalDays}`,
      items: preview.items,
      overflowCount: preview.overflowCount,
      isEmpty: dayActivities.length === 0,
      emptyMessage: "היום הראשון עדיין מחכה לתכנון",
      ctaLabel: "למסלול המלא",
      ctaHref: itineraryHref,
    };

    return {
      ...shared,
      phase,
      dateRangeLabel,
      itineraryHref,
      primaryCtaLabel: "למסלול",
      countdownDays,
      countdownLabel: formatCountdownLabel(countdownDays),
      dailyItinerary,
    };
  }

  if (phase === "completed") {
    return {
      ...shared,
      phase,
      dateRangeLabel,
      itineraryHref: basePath,
      primaryCtaLabel: "למסלול",
      statusLine: "הטיול הסתיים",
      closingLine: "תודה על הטיול המשותף",
    };
  }

  const dayNumber = getTripDayNumber(trip.startDate, trip.endDate, todayJapan)!;
  const preview = buildActiveItineraryPreview(dayActivities, nowJapanTime);
  const itineraryHref = `${basePath}?date=${todayJapan}`;
  const dailyItinerary: DailyItinerarySummary = {
    title: "המסלול של היום",
    subtitle: `${formatTripDayWeekday(todayJapan)} · ${formatTripDayDateLabel(todayJapan)}`,
    dayMeta: `יום ${dayNumber} מתוך ${totalDays}`,
    items: preview.items,
    overflowCount: preview.overflowCount,
    isEmpty: dayActivities.length === 0,
    emptyMessage: "היום עדיין פנוי",
    ctaLabel:
      dayActivities.length === 0 ? "למסלול של היום" : "למסלול המלא של היום",
    ctaHref: itineraryHref,
  };

  return {
    ...shared,
    phase,
    dateRangeLabel,
    itineraryHref,
    primaryCtaLabel: "למסלול של היום",
    currentDay: {
      date: todayJapan,
      dayNumber,
      totalDays,
      weekdayLabel: formatTripDayWeekday(todayJapan),
      dateLabel: formatTripDayDateLabel(todayJapan),
      headingLabel: formatTripDayHeading(todayJapan),
    },
    dailyItinerary,
  };
}
