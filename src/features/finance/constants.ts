export const DEFAULT_BASE_CURRENCY = "ILS";

export const FINANCE_PAGE_TITLE = "הכסף בטיול";

export const EXPENSE_SOURCE_TYPES = [
  "activity",
  "accommodation",
  "transport",
  "manual",
] as const;

export const EXPENSE_CATEGORIES = [
  "accommodation",
  "food",
  "transport",
  "activities",
  "shopping",
  "flights",
  "other",
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<
  (typeof EXPENSE_CATEGORIES)[number],
  string
> = {
  accommodation: "לינה",
  food: "אוכל",
  transport: "תחבורה",
  activities: "פעילויות",
  shopping: "קניות",
  flights: "טיסות",
  other: "אחר",
};

export const FINANCE_MESSAGES = {
  generic: "משהו השתבש. נסו שוב.",
  validationFailed: "נתונים לא תקינים",
  settingsNotFound: "הגדרות כספים לא נמצאו",
  budgetRequired: "יש להזין סכום תקציב חיובי",
  budgetInvalid: "סכום תקציב לא תקין",
  baseCurrencyInvalid: "מטבע בסיס לא נתמך",
  baseCurrencyLocked:
    "לא ניתן לשנות מטבע בסיס לאחר שנוספו הוצאות לטיול",
  expenseAmountInvalid: "סכום הוצאה חייב להיות גדול מאפס",
  manualTitleRequired: "יש להזין שם להוצאה",
  linkedSourceRequired: "חסר מזהה מקור להוצאה מקושרת",
  manualSourceIdForbidden: "הוצאה ידנית לא יכולה להיות מקושרת לישות",
  linkedTitleForbidden: "הוצאה מקושרת לא שומרת כותרת",
  categoryInvalid: "קטגוריה לא תקינה",
  sourceTypeInvalid: "סוג מקור לא תקין",
  noBudgetConfigured: "לא הוגדר תקציב לטיול",
  setBudgetCta: "הגדרת תקציב לטיול",
  editBudgetCta: "עריכת תקציב",
  totalExpenses: "סה״כ הוצאות",
  totalBudget: "תקציב",
  remaining: "נותר",
  spent: "הוצאות",
  pageTitle: FINANCE_PAGE_TITLE,
  afterRecapTitle: "סיכום ההוצאות",
  afterNoExpenses: "לא נרשמו הוצאות לטיול הזה",
  afterFullFinanceCta: "לסיכום הכספי המלא",
  afterOpenFinanceCta: "לפתיחת הכספים",
  noExpensesYet: "עדיין אין הוצאות",
  memberNoBudget: "לא הוגדר תקציב לטיול",
  baseCurrencyLabel: "מטבע בסיס",
  budgetAmountLabel: "תקציב כולל",
  saveSettings: "שמירה",
  clearBudget: "ניקוי תקציב",
  settingsTitle: "הגדרות כספים",
  heroSubtitle: "מעקב הוצאות ותקציב במקום אחד",
  tripBudgetTitle: "תקציב הטיול",
  percentConsumed: "נוצל",
  addExpense: "הוספת הוצאה",
  editExpense: "עריכת הוצאה",
  addExpenseSubtitle: "הוסיפו הוצאה לטיול",
  saveExpense: "שמירה",
  deleteExpense: "מחיקת הוצאה",
  deleteExpenseConfirm: "למחוק את ההוצאה?",
  cancel: "ביטול",
  titleLabel: "תיאור / שם",
  categoryLabel: "קטגוריה",
  dateLabel: "תאריך",
  amountLabel: "סכום",
  currencyLabel: "מטבע",
  notesLabel: "הערות (אופציונלי)",
  conversionPreview: "לפי שער המרה עדכני",
  conversionPreviewFailed: "לא ניתן לטעון שער המרה כרגע",
  categoriesSectionTitle: "הוצאות לפי קטגוריות",
  recentSectionTitle: "הוצאות אחרונות",
  allSectionTitle: "כל ההוצאות",
  showAll: "הצג הכל",
  showRecent: "חזרה לסיכום",
  totalExpensesCenter: "סה״כ הוצאות",
  noCategoriesYet: "עדיין אין הוצאות לפי קטגוריות",
  overBudget: "חריגה מהתקציב",
  hubNoExpenses: "עדיין לא נוספו הוצאות",
  linkedToActivity: "מחובר לפעילות",
  linkedToAccommodation: "מחובר למקום לינה",
  linkedToTransport: "מחובר לתחבורה",
  deletedSourceFallback: "פריט שנמחק",
  removeLinkedCost: "הסרת העלות",
  removeLinkedCostConfirm: "להסיר את העלות? הפריט המקור יישאר ללא שינוי.",
  entityCostSectionTitle: "עלות",
  entityCostHelper: "אפשר להשאיר ריק ולהוסיף מאוחר יותר",
  activityCostCategoryLabel: "קטגוריית הוצאה",
} as const;

export function buildFinanceHref(tripId: string): string {
  return `/app/trips/${tripId}/finance`;
}
