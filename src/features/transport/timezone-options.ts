export type TransportTimezoneOption = {
  value: string;
  label: string;
  defaultForJapan?: boolean;
};

/** Curated IANA zones with Hebrew-friendly labels. */
export const TRANSPORT_TIMEZONE_OPTIONS: readonly TransportTimezoneOption[] = [
  { value: "Asia/Tokyo", label: "יפן", defaultForJapan: true },
  { value: "Asia/Jerusalem", label: "ישראל" },
  { value: "Europe/London", label: "בריטניה (לונדון)" },
  { value: "Europe/Paris", label: "צרפת (פריז)" },
  { value: "America/New_York", label: 'ארה"ב (ניו יורק)' },
  { value: "America/Los_Angeles", label: 'ארה"ב (לוס אנג\'לס)' },
  { value: "Asia/Seoul", label: "דרום קוריאה (סיאול)" },
  { value: "Asia/Hong_Kong", label: "הונג קונג" },
  { value: "Asia/Singapore", label: "סינגפור" },
  { value: "Australia/Sydney", label: "אוסטרליה (סידני)" },
  { value: "Pacific/Auckland", label: "ניו זילנד (אוקלנד)" },
  { value: "UTC", label: "UTC" },
];

const timezoneValues = new Set(TRANSPORT_TIMEZONE_OPTIONS.map((option) => option.value));

export function isSupportedTransportTimezone(value: string): boolean {
  return timezoneValues.has(value);
}

export function getDefaultJapanTransportTimezone(): string {
  return (
    TRANSPORT_TIMEZONE_OPTIONS.find((option) => option.defaultForJapan)?.value ??
    "Asia/Tokyo"
  );
}

export function getTransportTimezoneLabel(value: string): string {
  return (
    TRANSPORT_TIMEZONE_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}
