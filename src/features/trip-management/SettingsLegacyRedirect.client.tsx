"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  buildTripManagementHref,
  DEFAULT_TRIP_MANAGEMENT_SECTION,
  LEGACY_SETTINGS_HASH_MAP,
} from "./constants";

type SettingsLegacyRedirectProps = {
  tripId: string;
};

export function SettingsLegacyRedirect({ tripId }: SettingsLegacyRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const section = LEGACY_SETTINGS_HASH_MAP[hash] ?? DEFAULT_TRIP_MANAGEMENT_SECTION;
    router.replace(buildTripManagementHref(tripId, section));
  }, [router, tripId]);

  return null;
}
