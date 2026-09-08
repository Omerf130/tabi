export const TRIP_NAME_MIN_LENGTH = 2;
export const TRIP_NAME_MAX_LENGTH = 80;

export const TRIP_CALENDAR_TIMEZONE = "Asia/Tokyo";

export const TRIP_MAX_DURATION_DAYS = 180;

export const TRIP_MESSAGES = {
  generic: "משהו השתבש. נסו שוב.",
  name: "נא להזין שם טיול תקין",
  startDate: "נא לבחור תאריך התחלה תקין",
  endDate: "נא לבחור תאריך סיום תקין",
  dateOrder: "תאריך הסיום חייב להיות אחרי תאריך ההתחלה או בו",
  maxDuration: "משך הטיול לא יכול לעלות על 180 ימים",
} as const;

export const TRIP_PHASE_LABELS = {
  upcoming: "בקרוב",
  active: "פעיל",
  completed: "הסתיים",
} as const;

export const TRIP_ROLE_LABELS = {
  owner: "בעלים",
  member: "חבר בטיול",
} as const;
