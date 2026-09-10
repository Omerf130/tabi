import type { WeatherDaySummary, WeatherSnapshot } from "./types";

export function getWeatherForecastDaysForDisplay(
  snapshot: WeatherSnapshot,
): readonly WeatherDaySummary[] {
  return [snapshot.today, ...snapshot.forecast];
}

export { hasHourlyWeatherData } from "./get-near-term-hourly";
