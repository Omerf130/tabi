import { formatHourlyTimeLabel } from "./format-weather";
import type { WeatherCondition, WeatherHourSummary, WeatherSnapshot } from "./types";

export type NearTermWeatherColumn = {
  label: string;
  temperatureC: number;
  condition: WeatherCondition;
  isNow: boolean;
};

const NEAR_TERM_FUTURE_SLOTS = 3;
const MIN_GAP_MS = 2.5 * 60 * 60 * 1000;

function parseWeatherTime(value: string): number {
  const parsed = new Date(value.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export function hasHourlyWeatherData(snapshot: WeatherSnapshot): boolean {
  return snapshot.hourly.length > 0;
}

function pickFutureHourlySlots(
  hourly: readonly WeatherHourSummary[],
  observedAt: string,
): WeatherHourSummary[] {
  const observedMs = parseWeatherTime(observedAt);
  const futureHours = hourly.filter((hour) => parseWeatherTime(hour.time) > observedMs);
  const picked: WeatherHourSummary[] = [];
  let lastMs = observedMs;

  for (const hour of futureHours) {
    if (picked.length >= NEAR_TERM_FUTURE_SLOTS) {
      break;
    }

    const hourMs = parseWeatherTime(hour.time);
    if (picked.length === 0 || hourMs - lastMs >= MIN_GAP_MS) {
      picked.push(hour);
      lastMs = hourMs;
    }
  }

  if (picked.length < NEAR_TERM_FUTURE_SLOTS) {
    for (const hour of futureHours) {
      if (picked.length >= NEAR_TERM_FUTURE_SLOTS) {
        break;
      }

      if (!picked.includes(hour)) {
        picked.push(hour);
      }
    }
  }

  return picked.slice(0, NEAR_TERM_FUTURE_SLOTS);
}

export function buildNearTermWeatherColumns(
  snapshot: WeatherSnapshot,
): NearTermWeatherColumn[] {
  const columns: NearTermWeatherColumn[] = [
    {
      label: "עכשיו",
      temperatureC: snapshot.current.temperatureC,
      condition: snapshot.current.condition,
      isNow: true,
    },
  ];

  if (!hasHourlyWeatherData(snapshot)) {
    return columns;
  }

  for (const hour of pickFutureHourlySlots(snapshot.hourly, snapshot.observedAt)) {
    columns.push({
      label: formatHourlyTimeLabel(hour.time),
      temperatureC: hour.temperatureC,
      condition: hour.condition,
      isNow: false,
    });
  }

  return columns;
}

export function shouldShowNearTermStrip(snapshot: WeatherSnapshot): boolean {
  return buildNearTermWeatherColumns(snapshot).length >= 2;
}
