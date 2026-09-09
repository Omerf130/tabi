/** Deterministic presentation data for marketing phone mockups. */

export const BARCELONA_TRIP = {
  city: "Barcelona",
  dateRange: "12–19 September",
  dayLabel: "היום בטיול",
  weather: "24°",
};

export const BARCELONA_TODAY = [
  { time: "10:30", title: "Sagrada Família" },
  { time: "13:00", title: "Lunch" },
  { time: "16:30", title: "Gothic Quarter" },
] as const;

export const ROME_DAY = {
  day: "יום 4",
  city: "Rome",
  items: [
    { time: "09:00", title: "Colosseum" },
    { time: "12:30", title: "Trastevere" },
    { time: "18:00", title: "Dinner" },
  ],
} as const;

export const TRAVEL_HUB_ITEMS = [
  "לינה",
  "תחבורה",
  "מסמכים",
  "מזג אוויר",
  "מטבע",
  "שפה",
] as const;

export const PLANNING_ITEMS = [
  { label: "מסלול", detail: "7 ימים מתוכננים" },
  { label: "לינה", detail: "3 הזמנות" },
  { label: "תחבורה", detail: "טיסה + רכבת" },
  { label: "מסמכים", detail: "5 קבצים" },
  { label: "רשימות", detail: "2 רשימות" },
] as const;

export const DURING_ITEMS = {
  now: { time: "10:30", title: "Sagrada Família" },
  next: { time: "13:00", title: "Lunch" },
  tools: [
    { label: "מזג אוויר", value: "24°" },
    { label: "מטבע", value: "€ → ₪" },
    { label: "שפה", value: "ES" },
    { label: "חירום", value: "112" },
  ],
} as const;

export const CHAOS_FRAGMENTS = [
  { id: "pdf", label: "PDF", tone: "coral" as const },
  { id: "booking", label: "Booking", tone: "sky" as const },
  { id: "whatsapp", label: "WhatsApp", tone: "violet" as const },
  { id: "maps", label: "Maps", tone: "sky" as const },
  { id: "notes", label: "Notes", tone: "warm" as const },
  { id: "weather", label: "Weather", tone: "sky" as const },
  { id: "email", label: "Email", tone: "coral" as const },
] as const;

export const POCKET_ORBIT = [
  { id: "itinerary", label: "מסלול", tone: "violet" as const },
  { id: "accommodation", label: "לינה", tone: "sky" as const },
  { id: "transport", label: "תחבורה", tone: "warm" as const },
  { id: "documents", label: "מסמכים", tone: "coral" as const },
  { id: "weather", label: "מזג אוויר", tone: "sky" as const },
  { id: "currency", label: "מטבע", tone: "violet" as const },
  { id: "language", label: "שפה ותקשורת", tone: "coral" as const },
  { id: "lists", label: "רשימות", tone: "warm" as const },
] as const;

export const HERO_FLOATS = [
  { id: "weather", label: "24° Barcelona", tone: "sky" as const },
  { id: "flight", label: "טיסה LY395", tone: "violet" as const },
  { id: "hotel", label: "המלון הבא", tone: "coral" as const },
  { id: "currency", label: "€ → ₪", tone: "warm" as const },
] as const;

export const MOCK_MEMBERS = [
  { initials: "ד", name: "דנה" },
  { initials: "י", name: "יוסי" },
  { initials: "מ", name: "מיה" },
  { initials: "א", name: "אור" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  { step: "01", title: "פותחים טיול", description: "יוצרים טיול חדש עם תאריכים ויעד." },
  {
    step: "02",
    title: "מזמינים את מי שטס איתכם",
    description: "שולחים הזמנה — כולם רואים את אותו טיול.",
  },
  {
    step: "03",
    title: "מרכזים את כל מה שצריך",
    description: "מסלול, לינה, תחבורה, מסמכים ורשימות.",
  },
  {
    step: "04",
    title: "יוצאים לדרך",
    description: "בזמן הטיול — הכל זמין ביד.",
  },
] as const;
