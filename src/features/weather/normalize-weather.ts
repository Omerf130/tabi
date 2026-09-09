import { resolveConditionLabel } from "./condition-labels";
import { WEATHER_FORECAST_DAYS } from "./constants";
import type {
  WeatherCondition,
  WeatherCurrent,
  WeatherDaySummary,
  WeatherLocationRef,
  WeatherSnapshot,
} from "./types";

type WeatherApiCondition = {
  code?: number;
  text?: string;
  icon?: string;
};

type WeatherApiCurrent = {
  temp_c?: number;
  feelslike_c?: number;
  is_day?: number;
  condition?: WeatherApiCondition;
  last_updated?: string;
};

type WeatherApiDay = {
  mintemp_c?: number;
  maxtemp_c?: number;
  daily_chance_of_rain?: number;
  condition?: WeatherApiCondition;
};

type WeatherApiForecastDay = {
  date?: string;
  day?: WeatherApiDay;
};

type WeatherApiLocation = {
  name?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

export type WeatherApiForecastResponse = {
  location?: WeatherApiLocation;
  current?: WeatherApiCurrent;
  forecast?: {
    forecastday?: WeatherApiForecastDay[];
  };
};

export type WeatherApiSearchResult = {
  id?: number;
  name?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
};

export function normalizeIconUrl(icon: string | undefined): string {
  if (!icon) {
    return "";
  }

  if (icon.startsWith("//")) {
    return `https:${icon}`;
  }

  return icon;
}

function normalizeCondition(condition: WeatherApiCondition | undefined): WeatherCondition {
  const code = condition?.code ?? 0;
  const providerText = condition?.text?.trim() || "Unknown";

  return {
    code,
    label: resolveConditionLabel(code, providerText),
    iconUrl: normalizeIconUrl(condition?.icon),
  };
}

function normalizeDaySummary(day: WeatherApiForecastDay): WeatherDaySummary | null {
  if (!day.date || !day.day) {
    return null;
  }

  return {
    date: day.date,
    minTemperatureC: day.day.mintemp_c ?? 0,
    maxTemperatureC: day.day.maxtemp_c ?? 0,
    condition: normalizeCondition(day.day.condition),
    chanceOfRainPercent:
      typeof day.day.daily_chance_of_rain === "number"
        ? day.day.daily_chance_of_rain
        : null,
  };
}

export function normalizeSearchResult(
  result: WeatherApiSearchResult,
): WeatherLocationRef | null {
  if (
    !result.name?.trim() ||
    !result.country?.trim() ||
    typeof result.lat !== "number" ||
    typeof result.lon !== "number"
  ) {
    return null;
  }

  return {
    label: result.name.trim(),
    region: result.region?.trim() || undefined,
    country: result.country.trim(),
    latitude: result.lat,
    longitude: result.lon,
  };
}

export function buildLocationQuery(
  location: Pick<WeatherLocationRef, "latitude" | "longitude">,
): string {
  return `${location.latitude},${location.longitude}`;
}

export function normalizeWeatherSnapshot(
  payload: WeatherApiForecastResponse,
  requestedLocation: WeatherLocationRef,
): WeatherSnapshot {
  const currentPayload = payload.current;
  const forecastDays = payload.forecast?.forecastday ?? [];

  if (!currentPayload || forecastDays.length === 0) {
    throw new Error("Invalid WeatherAPI forecast response");
  }

  const location: WeatherLocationRef = {
    label: requestedLocation.label,
    region: requestedLocation.region,
    country: requestedLocation.country,
    latitude: requestedLocation.latitude,
    longitude: requestedLocation.longitude,
  };

  const normalizedDays = forecastDays
    .slice(0, WEATHER_FORECAST_DAYS)
    .map(normalizeDaySummary)
    .filter((day): day is WeatherDaySummary => day !== null);

  if (normalizedDays.length === 0) {
    throw new Error("Invalid WeatherAPI forecast days");
  }

  const [today, ...forecast] = normalizedDays;

  const current: WeatherCurrent = {
    temperatureC: currentPayload.temp_c ?? 0,
    feelsLikeC: currentPayload.feelslike_c ?? 0,
    condition: normalizeCondition(currentPayload.condition),
    isDay: currentPayload.is_day === 1,
  };

  return {
    location,
    current,
    today,
    forecast,
    observedAt: currentPayload.last_updated ?? new Date().toISOString(),
  };
}
