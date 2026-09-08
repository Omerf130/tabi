export const INVITE_EXPIRY_DAYS = 7;

export const INVITE_MESSAGES = {
  generic: "משהו השתבש. נסו שוב.",
  invalid: "הקישור אינו תקף או שפג תוקפו.",
  alreadyMember: "אתה כבר חבר בטיול הזה.",
  accepted: "הצטרפת לטיול בהצלחה.",
  revoked: "ההזמנה בוטלה.",
  ownerRoleWarning:
    "בעלים יכולים לנהל את חברי הטיול וליצור הזמנות נוספות.",
} as const;

export const INVITE_STATUS_LABELS = {
  active: "פעיל",
  used: "שומש",
  expired: "פג תוקף",
  revoked: "בוטל",
} as const;

export const INVITE_ROLE_LABELS = {
  owner: "בעלים",
  member: "חבר בטיול",
} as const;
