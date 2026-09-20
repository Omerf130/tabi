import "server-only";

import { isValidIanaTimeZone } from "@/features/trips/destination/is-valid-iana-time-zone";

export class GoogleTimeZoneConfigError extends Error {
  constructor() {
    super("GOOGLE_PLACES_API_KEY is not configured");
    this.name = "GoogleTimeZoneConfigError";
  }
}

export class GoogleTimeZoneRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleTimeZoneRequestError";
  }
}

type GoogleTimeZoneResponse = {
  status?: string;
  timeZoneId?: string;
  errorMessage?: string;
};

function getGoogleMapsApiKey(): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    throw new GoogleTimeZoneConfigError();
  }
  return apiKey;
}

export async function fetchIanaTimeZoneForCoordinates(input: {
  latitude: number;
  longitude: number;
  timestampSeconds?: number;
}): Promise<string | null> {
  const apiKey = getGoogleMapsApiKey();
  const timestamp =
    input.timestampSeconds ?? Math.floor(Date.now() / 1000);
  const params = new URLSearchParams({
    location: `${input.latitude},${input.longitude}`,
    timestamp: String(timestamp),
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/timezone/json?${params.toString()}`,
    { next: { revalidate: 0 } },
  );

  if (!response.ok) {
    throw new GoogleTimeZoneRequestError(
      `Time Zone API HTTP ${response.status}`,
    );
  }

  const body = (await response.json()) as GoogleTimeZoneResponse;
  if (body.status !== "OK" || !body.timeZoneId?.trim()) {
    return null;
  }

  const timeZoneId = body.timeZoneId.trim();
  if (!isValidIanaTimeZone(timeZoneId)) {
    return null;
  }

  return timeZoneId;
}
