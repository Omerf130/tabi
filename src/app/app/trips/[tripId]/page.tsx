import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { listActivitiesForTripDay } from "@/features/itinerary/queries";
import { requireUser } from "@/features/auth/session";
import { buildTripHomeViewModel } from "@/features/trip-home/build-trip-home-view-model";
import { TripHomeContent } from "@/features/trip-home/TripHomeContent";
import { requireTripMember } from "@/features/trips/authorization";
import { getTripCoverPath } from "@/features/trips/cover/constants";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getJapanWallClockTime } from "@/features/trips/japan-wall-clock";
import { listIncompleteRemindersForUserTripDay } from "@/features/trips/reminders/queries";
import { selectTodayHomeReminders } from "@/features/trips/reminders/select-today-home-reminders";
import { getTripPhase } from "@/features/trips/trip-phase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `${trip.name} · Tabi` };
}

export default async function TripHomePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, user] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
  ]);
  const todayJapan = getJapanCalendarDate();
  const nowJapanTime = getJapanWallClockTime();
  const phase = getTripPhase(trip.startDate, trip.endDate, todayJapan);
  const previewDate =
    phase === "active" ? todayJapan : phase === "upcoming" ? trip.startDate : null;
  const [dayActivities, todayReminderRecords] = await Promise.all([
    previewDate
      ? listActivitiesForTripDay(trip.id, previewDate)
      : Promise.resolve([]),
    phase === "active"
      ? listIncompleteRemindersForUserTripDay(trip.id, user.id, todayJapan)
      : Promise.resolve([]),
  ]);
  const todayReminders = selectTodayHomeReminders(
    todayReminderRecords,
    phase,
    todayJapan,
  );

  const model = buildTripHomeViewModel({
    trip,
    coverImageHref: trip.coverImage ? getTripCoverPath(trip.id) : undefined,
    dayActivities,
    todayReminders,
    todayJapan,
    nowJapanTime,
  });

  return (
    <AppPage width="wide">
      <TripHomeContent model={model} />
    </AppPage>
  );
}
