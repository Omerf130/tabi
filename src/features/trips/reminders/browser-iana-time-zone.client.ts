"use client";

import { isValidIanaTimeZone } from "@/features/trips/destination/is-valid-iana-time-zone";

export function getBrowserIanaTimeZone(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim() ?? "";
  if (!isValidIanaTimeZone(timeZone)) {
    return "";
  }
  return timeZone;
}
