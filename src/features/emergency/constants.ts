import type { EmergencyCustomCategory } from "./types";

export const DEFAULT_EMERGENCY_PACK_ID = "JP";

export const EMERGENCY_PAGE_TITLE = "חירום ועזרה";

export const EMERGENCY_CUSTOM_CATEGORY_LABELS: Record<EmergencyCustomCategory, string> = {
  insurance: "ביטוח",
  medical: "רפואה",
  personal_contact: "איש קשר",
  financial: "כספים",
  transport: "תחבורה",
  local_contact: "איש קשר מקומי",
  other: "אחר",
};

export const EMERGENCY_MESSAGES = {
  notFound: "המשאב לא נמצא",
  validationFailed: "לא ניתן לשמור את המשאב",
  deleteConfirm: "למחוק את המשאב?",
  noCustomResources: "אין משאבי חירום מותאמים עדיין",
  noDocuments: "אין מסמכים מסומנים לחירום",
  locationPrompt: "הצג את המיקום שלי",
  locationDenied: "הגישה למיקום נדחתה. אפשר לאשר בהגדרות הדפדפן.",
  locationUnavailable: "לא ניתן לקבל מיקום כרגע.",
  locationTimeout: "בקשת המיקום ארכה יותר מדי.",
  locationUnsupported: "הדפדפן לא תומך במיקום.",
  locationCopySuccess: "הקואורדינטות הועתקו",
  locationCopyFailed: "לא ניתן להעתיק",
  copySuccess: "הועתק",
  copyFailed: "לא ניתן להעתיק",
  addResource: "הוספה",
  saveResource: "שמירה",
  cancel: "ביטול",
  edit: "עריכה",
  delete: "מחיקה",
  allEmergencyPhrases: "כל ביטויי החירום",
  emergencyPhrases: "משפטים שימושיים בחירום",
  urgentSection: "חירום מיידי",
  assistanceSection: "סיוע לתיירים וקונסולרי",
  myLocation: "המיקום שלי",
  currentAccommodation: "מקום הלינה הנוכחי",
  emergencyDocuments: "מסמכים חשובים",
  myTripResources: "משאבי הטיול שלי",
  sourceNote: "מידע רשמי שנבדק ידנית מול המקורות המצוינים.",
} as const;

export const CURATED_EMERGENCY_PHRASE_IDS = [
  "emergency.need-help",
  "emergency.ambulance",
  "emergency.hospital",
  "emergency.lost-passport",
  "emergency.police",
] as const;

export function buildEmergencyHref(tripId: string): string {
  return `/app/trips/${tripId}/emergency`;
}
