import type { WeatherDaySummary, WeatherSnapshot } from "@/features/weather/types";

export function isDateInWeatherSnapshot(
  snapshot: WeatherSnapshot,
  date: string,
): boolean {
  if (snapshot.today.date === date) {
    return true;
  }

  return snapshot.forecast.some((day) => day.date === date);
}

export type FocusedDayWeatherData = {
  temperatureC: number;
  conditionIconUrl: string;
  conditionLabel: string;
};

export function extractFocusedDayWeather(
  snapshot: WeatherSnapshot,
  date: string,
): FocusedDayWeatherData | null {
  if (!isDateInWeatherSnapshot(snapshot, date)) {
    return null;
  }

  if (snapshot.today.date === date) {
    return {
      temperatureC: snapshot.current.temperatureC,
      conditionIconUrl: snapshot.current.condition.iconUrl,
      conditionLabel: snapshot.current.condition.label,
    };
  }

  const forecastDay = snapshot.forecast.find((day) => day.date === date);
  if (!forecastDay) {
    return null;
  }

  return extractWeatherFromDaySummary(forecastDay);
}

function extractWeatherFromDaySummary(day: WeatherDaySummary): FocusedDayWeatherData {
  return {
    temperatureC: day.maxTemperatureC,
    conditionIconUrl: day.condition.iconUrl,
    conditionLabel: day.condition.label,
  };
}
