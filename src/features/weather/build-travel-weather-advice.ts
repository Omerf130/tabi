import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { WeatherSnapshot } from "./types";

export type TravelWeatherAdviceIcon = "umbrella" | "water" | "jacket" | "layer" | "comfort";

export type TravelWeatherAdvice = {
  title: string;
  message: string;
  icon: TravelWeatherAdviceIcon;
};

const RAIN_CONDITION_CODES = new Set([
  1063, 1069, 1072, 1087, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192,
  1195, 1198, 1201, 1204, 1207, 1240, 1243, 1246, 1249, 1252, 1255, 1261, 1264,
]);

function isRainRelatedCondition(code: number): boolean {
  return RAIN_CONDITION_CODES.has(code);
}

function maxRainChance(snapshot: WeatherSnapshot): number {
  const values = [
    snapshot.today.chanceOfRainPercent,
    ...snapshot.forecast.map((day) => day.chanceOfRainPercent),
  ].filter((value): value is number => value !== null);

  return values.length > 0 ? Math.max(...values) : 0;
}

export function buildTravelWeatherAdvice(
  snapshot: WeatherSnapshot,
  t: AppTranslator<"Weather">,
): TravelWeatherAdvice {
  const title = t("adviceTitle");
  const { current, today } = snapshot;
  const rainChance = maxRainChance(snapshot);

  if (
    rainChance >= 50 ||
    isRainRelatedCondition(current.condition.code) ||
    isRainRelatedCondition(today.condition.code)
  ) {
    return { title, message: t("adviceUmbrella"), icon: "umbrella" };
  }

  if (current.temperatureC >= 30 || today.maxTemperatureC >= 32) {
    return { title, message: t("adviceWater"), icon: "water" };
  }

  if (current.temperatureC <= 10 || today.minTemperatureC <= 8) {
    return { title, message: t("adviceJacket"), icon: "jacket" };
  }

  if (current.temperatureC <= 18 || today.minTemperatureC <= 14) {
    return { title, message: t("adviceLayer"), icon: "layer" };
  }

  return { title, message: t("adviceComfort"), icon: "comfort" };
}
