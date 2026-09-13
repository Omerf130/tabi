export const TRIP_REMINDER_TEXT_MAX_LENGTH = 200;

export const TRIP_REMINDER_ERROR_CODES = {
  generic: "generic",
  notFound: "notFound",
  dateOutOfRange: "dateOutOfRange",
} as const;

export type TripReminderErrorCode =
  (typeof TRIP_REMINDER_ERROR_CODES)[keyof typeof TRIP_REMINDER_ERROR_CODES];

export const TRIP_REMINDER_SUCCESS_CODES = {
  created: "created",
  updated: "updated",
  completed: "completed",
  deleted: "deleted",
} as const;

export type TripReminderSuccessCode =
  (typeof TRIP_REMINDER_SUCCESS_CODES)[keyof typeof TRIP_REMINDER_SUCCESS_CODES];

export function getTripRemindersSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/reminders`;
}
