import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchIanaTimeZoneForCoordinatesMock } = vi.hoisted(() => ({
  fetchIanaTimeZoneForCoordinatesMock: vi.fn(),
}));

vi.mock("@/features/places/google-time-zone.server", () => ({
  fetchIanaTimeZoneForCoordinates: fetchIanaTimeZoneForCoordinatesMock,
  GoogleTimeZoneConfigError: class GoogleTimeZoneConfigError extends Error {},
  GoogleTimeZoneRequestError: class GoogleTimeZoneRequestError extends Error {},
}));

import { FALLBACK_TRIP_CALENDAR_TIMEZONE } from "./constants";
import { resolveDestinationTimeZone } from "./resolve-destination-time-zone";

describe("resolveDestinationTimeZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns resolved IANA timezone without fallback", async () => {
    fetchIanaTimeZoneForCoordinatesMock.mockResolvedValue("Europe/Rome");

    await expect(
      resolveDestinationTimeZone({ latitude: 41.9, longitude: 12.5 }),
    ).resolves.toEqual({
      ok: true,
      timeZone: "Europe/Rome",
      usedFallback: false,
    });
  });

  it("uses UTC fallback when API returns null", async () => {
    fetchIanaTimeZoneForCoordinatesMock.mockResolvedValue(null);

    await expect(
      resolveDestinationTimeZone({ latitude: 0, longitude: 0 }),
    ).resolves.toEqual({
      ok: false,
      timeZone: FALLBACK_TRIP_CALENDAR_TIMEZONE,
      usedFallback: true,
    });
  });

  it("uses UTC fallback on request errors without throwing", async () => {
    const { GoogleTimeZoneRequestError } = await import(
      "@/features/places/google-time-zone.server"
    );
    fetchIanaTimeZoneForCoordinatesMock.mockRejectedValue(
      new GoogleTimeZoneRequestError("fail"),
    );

    await expect(
      resolveDestinationTimeZone({ latitude: 35.6, longitude: 139.6 }),
    ).resolves.toEqual({
      ok: false,
      timeZone: FALLBACK_TRIP_CALENDAR_TIMEZONE,
      usedFallback: true,
    });
  });
});
