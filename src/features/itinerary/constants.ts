export const ACTIVITY_TITLE_MIN_LENGTH = 1;
export const ACTIVITY_TITLE_MAX_LENGTH = 120;
export const ACTIVITY_LOCATION_MAX_LENGTH = 200;
export const ACTIVITY_ADDRESS_MAX_LENGTH = 500;
export const ACTIVITY_NOTES_MAX_LENGTH = 2000;

export const ACTIVITY_MESSAGES = {
  generic: "משהו השתבש. נסו שוב.",
  created: "הפעילות נוספה למסלול.",
  updated: "הפעילות עודכנה.",
  deleted: "הפעילות נמחקה.",
  dateOutOfRange: "התאריך אינו בתוך טווח הטיול.",
  notFound: "הפעילות לא נמצאה.",
  deleteConfirm: "למחוק את הפעילות?",
  discardConfirm: "לבטל שינויים?",
} as const;
