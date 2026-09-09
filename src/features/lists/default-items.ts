import type { TripListType } from "./constants";

export type DefaultTripListItemTemplate = {
  listType: TripListType;
  text: string;
  order: number;
};

export const DEFAULT_TRIP_LIST_ITEMS: readonly DefaultTripListItemTemplate[] = [
  { listType: "packing", text: "דרכון", order: 0 },
  { listType: "packing", text: "מטען לטלפון", order: 1 },
  { listType: "packing", text: "מתאם חשמל ליפן (Type A)", order: 2 },
  { listType: "packing", text: "Power bank", order: 3 },
  { listType: "packing", text: "בגדים נוחים להליכה", order: 4 },
  { listType: "packing", text: "תרופות אישיות", order: 5 },
  { listType: "packing", text: "מטריה קומפקטית", order: 6 },
  {
    listType: "packing",
    text: "הכנה לכרטיס IC / Suica / Pasmo",
    order: 7,
  },

  { listType: "before_trip", text: "ביטוח נסיעות", order: 0 },
  { listType: "before_trip", text: "eSIM / חבילת גלישה ליפן", order: 1 },
  { listType: "before_trip", text: "Check-in לטיסה", order: 2 },
  {
    listType: "before_trip",
    text: "לוודא שכל המסמכים זמינים בארנק הנסיעה",
    order: 3,
  },
  {
    listType: "before_trip",
    text: "להוריד מפות offline (Google Maps)",
    order: 4,
  },
  {
    listType: "before_trip",
    text: "הזמנת JR Pass / כרטיסים (אם רלוונטי)",
    order: 5,
  },

  { listType: "during_trip", text: "טעינת כרטיס IC / Suica", order: 0 },
  { listType: "during_trip", text: "בדיקת חיובים יומית", order: 1 },
  {
    listType: "during_trip",
    text: "שמירת כרטיסי רכבת / כניסה",
    order: 2,
  },
  { listType: "during_trip", text: "גיבוי תמונות חשובות", order: 3 },
  {
    listType: "during_trip",
    text: "לבדוק תחזית מזג אוויר ליום הבא",
    order: 4,
  },
  {
    listType: "during_trip",
    text: "לרוקן תיק יום מדברים מיותרים",
    order: 5,
  },

  { listType: "pre_trip_shopping", text: "מתאם חשמל ליפן", order: 0 },
  { listType: "pre_trip_shopping", text: "Power bank", order: 1 },
  {
    listType: "pre_trip_shopping",
    text: "נעלי הליכה נוחות (אם חסר)",
    order: 2,
  },
  { listType: "pre_trip_shopping", text: "כיסוי מזוודה", order: 3 },
  {
    listType: "pre_trip_shopping",
    text: "מוצרי הגיינה / נסיעה בגודל נסיעה",
    order: 4,
  },
  { listType: "pre_trip_shopping", text: "תיק יום קטן", order: 5 },
];
