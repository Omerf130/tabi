"use client";

import { useMemo } from "react";
import { getBrowserIanaTimeZone } from "./browser-iana-time-zone.client";

type TripReminderBrowserTimeZoneFieldProps = {
  name?: string;
};

export function TripReminderBrowserTimeZoneField({
  name = "timeZone",
}: TripReminderBrowserTimeZoneFieldProps) {
  const timeZone = useMemo(() => getBrowserIanaTimeZone(), []);

  return <input type="hidden" name={name} value={timeZone} />;
}
