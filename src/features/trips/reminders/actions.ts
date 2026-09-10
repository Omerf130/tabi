"use server";

import { revalidatePath } from "next/cache";
import { revalidateItineraryPaths } from "@/features/itinerary/revalidation";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { requireUser } from "@/features/auth/session";
import { requireTripMember } from "@/features/trips/authorization";
import { TRIP_REMINDER_MESSAGES } from "./constants";
import {
  completeTripReminder,
  createTripReminder,
  deleteTripReminder,
  TripReminderNotFoundError,
  TripReminderValidationError,
  updateTripReminder,
} from "./reminder-domain";
import { getReminderForUser } from "./queries";
import {
  createTripReminderSchema,
  tripReminderMutationSchema,
  updateTripReminderSchema,
} from "./schemas";

export type TripReminderActionState = {
  ok?: boolean;
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

function revalidateTripReminderPaths(tripId: string, dates: readonly string[] = []): void {
  revalidatePath(`/app/trips/${tripId}`);
  revalidateTripManagement(tripId, "reminders");
  revalidateItineraryPaths(tripId, dates);
}

export async function createTripReminderAction(
  _prev: TripReminderActionState,
  formData: FormData,
): Promise<TripReminderActionState> {
  const parsed = createTripReminderSchema.safeParse({
    tripId: formData.get("tripId"),
    date: formData.get("date"),
    time: formData.get("time"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return {
      error: TRIP_REMINDER_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const user = await requireUser();
    const trip = await requireTripMember(parsed.data.tripId);
    await createTripReminder({
      tripId: trip.id,
      userId: user.id,
      startDate: trip.startDate,
      endDate: trip.endDate,
      date: parsed.data.date,
      time: parsed.data.time,
      text: parsed.data.text,
    });
    revalidateTripReminderPaths(trip.id, [parsed.data.date]);
    return { ok: true, success: TRIP_REMINDER_MESSAGES.created };
  } catch (error) {
    if (error instanceof TripReminderValidationError) {
      return { error: error.message };
    }
    return { error: TRIP_REMINDER_MESSAGES.generic };
  }
}

export async function updateTripReminderAction(
  _prev: TripReminderActionState,
  formData: FormData,
): Promise<TripReminderActionState> {
  const parsed = updateTripReminderSchema.safeParse({
    tripId: formData.get("tripId"),
    reminderId: formData.get("reminderId"),
    date: formData.get("date"),
    time: formData.get("time"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return {
      error: TRIP_REMINDER_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const user = await requireUser();
    const trip = await requireTripMember(parsed.data.tripId);
    const existing = await getReminderForUser(
      trip.id,
      user.id,
      parsed.data.reminderId,
    );
    await updateTripReminder({
      tripId: trip.id,
      userId: user.id,
      reminderId: parsed.data.reminderId,
      startDate: trip.startDate,
      endDate: trip.endDate,
      date: parsed.data.date,
      time: parsed.data.time,
      text: parsed.data.text,
    });
    revalidateTripReminderPaths(
      trip.id,
      existing && existing.date !== parsed.data.date
        ? [parsed.data.date, existing.date]
        : [parsed.data.date],
    );
    return { ok: true, success: TRIP_REMINDER_MESSAGES.updated };
  } catch (error) {
    if (error instanceof TripReminderValidationError) {
      return { error: error.message };
    }
    if (error instanceof TripReminderNotFoundError) {
      return { error: error.message };
    }
    return { error: TRIP_REMINDER_MESSAGES.generic };
  }
}

export async function completeTripReminderAction(
  _prev: TripReminderActionState,
  formData: FormData,
): Promise<TripReminderActionState> {
  const parsed = tripReminderMutationSchema.safeParse({
    tripId: formData.get("tripId"),
    reminderId: formData.get("reminderId"),
  });

  if (!parsed.success) {
    return { error: TRIP_REMINDER_MESSAGES.generic };
  }

  try {
    const user = await requireUser();
    await requireTripMember(parsed.data.tripId);
    const existing = await getReminderForUser(
      parsed.data.tripId,
      user.id,
      parsed.data.reminderId,
    );
    await completeTripReminder({
      tripId: parsed.data.tripId,
      userId: user.id,
      reminderId: parsed.data.reminderId,
    });
    revalidateTripReminderPaths(
      parsed.data.tripId,
      existing ? [existing.date] : [],
    );
    return { ok: true, success: TRIP_REMINDER_MESSAGES.completed };
  } catch (error) {
    if (error instanceof TripReminderNotFoundError) {
      return { error: error.message };
    }
    return { error: TRIP_REMINDER_MESSAGES.generic };
  }
}

export async function deleteTripReminderAction(
  _prev: TripReminderActionState,
  formData: FormData,
): Promise<TripReminderActionState> {
  const parsed = tripReminderMutationSchema.safeParse({
    tripId: formData.get("tripId"),
    reminderId: formData.get("reminderId"),
  });

  if (!parsed.success) {
    return { error: TRIP_REMINDER_MESSAGES.generic };
  }

  try {
    const user = await requireUser();
    await requireTripMember(parsed.data.tripId);
    const existing = await getReminderForUser(
      parsed.data.tripId,
      user.id,
      parsed.data.reminderId,
    );
    await deleteTripReminder({
      tripId: parsed.data.tripId,
      userId: user.id,
      reminderId: parsed.data.reminderId,
    });
    revalidateTripReminderPaths(
      parsed.data.tripId,
      existing ? [existing.date] : [],
    );
    return { ok: true, success: TRIP_REMINDER_MESSAGES.deleted };
  } catch (error) {
    if (error instanceof TripReminderNotFoundError) {
      return { error: error.message };
    }
    return { error: TRIP_REMINDER_MESSAGES.generic };
  }
}
