import "server-only";

import {
  WEATHER_API_BASE,
  WEATHER_FORECAST_DAYS,
  WEATHER_SEARCH_REVALIDATE_SECONDS,
  WEATHER_SNAPSHOT_REVALIDATE_SECONDS,
} from "./constants";
import {
  buildLocationQuery,
  normalizeSearchResult,
  normalizeWeatherSnapshot,
  type WeatherApiForecastResponse,
  type WeatherApiSearchResult,
} from "./normalize-weather";
import type { WeatherLocationRef, WeatherSnapshot } from "./types";

export class WeatherApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherApiConfigError";
  }
}

export class WeatherApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherApiRequestError";
  }
}

type WeatherApiErrorResponse = {
  error?: {
    code?: number;
    message?: string;
  };
};

function getWeatherApiKey(): string {
  const apiKey = process.env.WEATHER_API_KEY?.trim();
  if (!apiKey) {
    throw new WeatherApiConfigError("WEATHER_API_KEY is not configured");
  }

  return apiKey;
}

async function parseWeatherApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as WeatherApiErrorResponse;
    return payload.error?.message?.trim() || "WeatherAPI request failed";
  } catch {
    return "WeatherAPI request failed";
  }
}

function buildWeatherApiUrl(path: string, params: Record<string, string>): string {
  const apiKey = getWeatherApiKey();
  const searchParams = new URLSearchParams({ key: apiKey, ...params });
  return `${WEATHER_API_BASE}${path}?${searchParams.toString()}`;
}

export async function searchWeatherLocations(
  query: string,
): Promise<WeatherLocationRef[]> {
  const response = await fetch(
    buildWeatherApiUrl("/search.json", { q: query }),
    {
      next: { revalidate: WEATHER_SEARCH_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new WeatherApiRequestError(await parseWeatherApiError(response));
  }

  const payload = (await response.json()) as WeatherApiSearchResult[];
  if (!Array.isArray(payload)) {
    throw new WeatherApiRequestError("Invalid WeatherAPI search response");
  }

  return payload
    .map(normalizeSearchResult)
    .filter((location): location is WeatherLocationRef => location !== null);
}

export async function fetchWeatherForecast(
  location: WeatherLocationRef,
): Promise<WeatherSnapshot> {
  const response = await fetch(
    buildWeatherApiUrl("/forecast.json", {
      q: buildLocationQuery(location),
      days: String(WEATHER_FORECAST_DAYS),
    }),
    {
      next: { revalidate: WEATHER_SNAPSHOT_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new WeatherApiRequestError(await parseWeatherApiError(response));
  }

  const payload = (await response.json()) as WeatherApiForecastResponse;
  return normalizeWeatherSnapshot(payload, location);
}
