export const TRIP_REMINDER_TEXT_MAX_LENGTH = 200;

export const TRIP_REMINDER_MESSAGES = {
  created: "התזכורת נוספה",
  updated: "התזכורת עודכנה",
  completed: "התזכורת סומנה כהושלמה",
  deleted: "התזכורת נמחקה",
  generic: "לא ניתן לשמור את התזכורת. נסו שוב.",
  notFound: "התזכורת לא נמצאה",
  dateOutOfRange: "התאריך חייב להיות בתוך טווח הטיול",
} as const;

export function getTripRemindersSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/reminders`;
}
