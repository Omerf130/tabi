import { createAppTranslator, type AppTranslator } from "@/features/i18n/create-app-translator";

export type TransportTimezoneOption = {
  value: string;
  label: string;
  defaultForJapan?: boolean;
};

const TRANSPORT_TIMEZONE_DEFINITIONS = [
  { value: "Asia/Tokyo", messageKey: "japan", defaultForJapan: true },
  { value: "Asia/Jerusalem", messageKey: "israel" },
  { value: "Europe/London", messageKey: "london" },
  { value: "Europe/Paris", messageKey: "paris" },
  { value: "America/New_York", messageKey: "newYork" },
  { value: "America/Los_Angeles", messageKey: "losAngeles" },
  { value: "Asia/Seoul", messageKey: "seoul" },
  { value: "Asia/Hong_Kong", messageKey: "hongKong" },
  { value: "Asia/Singapore", messageKey: "singapore" },
  { value: "Australia/Sydney", messageKey: "sydney" },
  { value: "Pacific/Auckland", messageKey: "auckland" },
  { value: "UTC", messageKey: "utc" },
] as const;

export function createTransportTimezoneOptions(
  t: AppTranslator<"Transport">,
): readonly TransportTimezoneOption[] {
  return TRANSPORT_TIMEZONE_DEFINITIONS.map((option) => ({
    value: option.value,
    label: t(`timezones.${option.messageKey}`),
    defaultForJapan:
      "defaultForJapan" in option ? option.defaultForJapan : undefined,
  }));
}

export function createTransportTimezoneLabelResolver(
  t: AppTranslator<"Transport">,
) {
  const labelsByValue = new Map(
    createTransportTimezoneOptions(t).map((option) => [option.value, option.label]),
  );

  return (value: string) => labelsByValue.get(value) ?? value;
}

export function isSupportedTransportTimezone(
  value: string,
  options: readonly TransportTimezoneOption[] = TRANSPORT_TIMEZONE_OPTIONS,
): boolean {
  return options.some((option) => option.value === value);
}

export function getDefaultJapanTransportTimezone(
  options: readonly TransportTimezoneOption[],
): string {
  return options.find((option) => option.defaultForJapan)?.value ?? "Asia/Tokyo";
}

/** Hebrew fallback for legacy call sites; prefer createTransportTimezoneOptions. */
export const TRANSPORT_TIMEZONE_OPTIONS = createTransportTimezoneOptions(
  createAppTranslator("Transport", "he"),
);

export function getTransportTimezoneLabel(
  value: string,
  resolveLabel: (value: string) => string = (timezone) =>
    TRANSPORT_TIMEZONE_OPTIONS.find((option) => option.value === timezone)
      ?.label ?? timezone,
): string {
  return resolveLabel(value);
}
