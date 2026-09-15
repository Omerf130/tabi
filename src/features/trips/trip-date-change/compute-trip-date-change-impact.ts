import "server-only";

import { compareCalendarDates } from "@/features/trips/calendar-date";
import { isDateWithinTrip } from "@/features/trips/trip-days";
import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { Accommodation } from "@/models/Accommodation";
import { Transport } from "@/models/Transport";
import { TripExpense } from "@/models/TripExpense";
import { TripReminder } from "@/models/TripReminder";
import {
  accommodationDatesUnchangedForTrip,
  clampAccommodationDatesToTrip,
} from "./accommodation-date-impact";
import {
  computeTripDateChangeImpactHash,
  tripDateChangeRequiresConfirmation,
} from "./impact-hash";
import type { TripDateChangeImpactPlan } from "./trip-date-change-types";

function accommodationLabel(record: {
  manualName?: string | null;
  googlePlaceId?: string | null;
}): string {
  const manual = record.manualName?.trim();
  if (manual) {
    return manual;
  }
  if (record.googlePlaceId) {
    return record.googlePlaceId;
  }
  return "Accommodation";
}

export async function computeTripDateChangeImpact(input: {
  tripId: string;
  oldStartDate: string;
  oldEndDate: string;
  newStartDate: string;
  newEndDate: string;
}): Promise<TripDateChangeImpactPlan> {
  await connectDb();

  const [activities, accommodations, transports, reminders, manualExpenses] =
    await Promise.all([
      Activity.find({ tripId: input.tripId })
        .select("date title")
        .lean(),
      Accommodation.find({ tripId: input.tripId })
        .select("checkInDate checkOutDate manualName googlePlaceId")
        .lean(),
      Transport.find({ tripId: input.tripId })
        .select("type departure")
        .lean(),
      TripReminder.find({ tripId: input.tripId })
        .select("date text userId")
        .lean(),
      TripExpense.find({ tripId: input.tripId, sourceType: "manual" })
        .select("expenseDate title")
        .lean(),
    ]);

  const activitiesToDelete = activities
    .filter(
      (activity) =>
        !isDateWithinTrip(
          input.newStartDate,
          input.newEndDate,
          activity.date,
        ),
    )
    .map((activity) => ({
      id: activity._id.toString(),
      title: activity.title,
      date: activity.date,
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  const accommodationsToDelete: TripDateChangeImpactPlan["accommodationsToDelete"] =
    [];
  const accommodationsToClamp: TripDateChangeImpactPlan["accommodationsToClamp"] =
    [];

  for (const accommodation of accommodations) {
    const id = accommodation._id.toString();
    const label = accommodationLabel(accommodation);
    const { checkInDate, checkOutDate } = accommodation;

    if (
      accommodationDatesUnchangedForTrip(
        checkInDate,
        checkOutDate,
        input.newStartDate,
        input.newEndDate,
      )
    ) {
      continue;
    }

    const clamped = clampAccommodationDatesToTrip(
      checkInDate,
      checkOutDate,
      input.newStartDate,
      input.newEndDate,
    );

    if (!clamped) {
      accommodationsToDelete.push({
        id,
        label,
        checkInDate,
        checkOutDate,
      });
      continue;
    }

    accommodationsToClamp.push({
      id,
      label,
      fromCheckInDate: checkInDate,
      fromCheckOutDate: checkOutDate,
      toCheckInDate: clamped.checkInDate,
      toCheckOutDate: clamped.checkOutDate,
    });
  }

  accommodationsToDelete.sort((a, b) =>
    a.checkInDate.localeCompare(b.checkInDate),
  );
  accommodationsToClamp.sort((a, b) =>
    a.fromCheckInDate.localeCompare(b.fromCheckInDate),
  );

  const transportsToReview = transports
    .filter(
      (transport) =>
        !isDateWithinTrip(
          input.newStartDate,
          input.newEndDate,
          transport.departure.date,
        ),
    )
    .map((transport) => ({
      id: transport._id.toString(),
      type: transport.type,
      departureLocationName: transport.departure.locationName,
      departureDate: transport.departure.date,
    }))
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));

  const remindersOutOfRange = reminders
    .filter(
      (reminder) =>
        !isDateWithinTrip(
          input.newStartDate,
          input.newEndDate,
          reminder.date,
        ),
    )
    .map((reminder) => ({
      id: reminder._id.toString(),
      date: reminder.date,
      text: reminder.text,
      travelerUserId: reminder.userId.toString(),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const manualExpensesOutOfRange = manualExpenses
    .filter(
      (expense) =>
        !isDateWithinTrip(
          input.newStartDate,
          input.newEndDate,
          expense.expenseDate,
        ),
    )
    .map((expense) => ({
      id: expense._id.toString(),
      expenseDate: expense.expenseDate,
      title: expense.title ?? null,
    }))
    .sort((a, b) => a.expenseDate.localeCompare(b.expenseDate));

  const documentsUnlinkedCount =
    activitiesToDelete.length + accommodationsToDelete.length;

  const impactBase = {
    oldStartDate: input.oldStartDate,
    oldEndDate: input.oldEndDate,
    newStartDate: input.newStartDate,
    newEndDate: input.newEndDate,
    activitiesToDelete,
    accommodationsToDelete,
    accommodationsToClamp,
    transportsToReview,
    remindersOutOfRange,
    manualExpensesOutOfRange,
    documentsUnlinkedCount,
  };

  const impactHash = computeTripDateChangeImpactHash(impactBase);
  const requiresConfirmation = tripDateChangeRequiresConfirmation(impactBase);

  return {
    ...impactBase,
    impactHash,
    requiresConfirmation,
  };
}

export function tripDatesAreUnchanged(
  oldStartDate: string,
  oldEndDate: string,
  newStartDate: string,
  newEndDate: string,
): boolean {
  return (
    compareCalendarDates(oldStartDate, newStartDate) === 0 &&
    compareCalendarDates(oldEndDate, newEndDate) === 0
  );
}
