import "server-only";

import { searchWeatherLocations } from "@/features/weather/weatherapi.server";
import type { WeatherLocationRef } from "@/features/weather/types";
import {
  resolveDayLocationCandidates,
  type DayLocationCandidate,
  type DayLocationSourceType,
  type ResolveDayLocationCandidatesInput,
} from "./resolve-day-location-candidates";

export type ResolvedDayWeatherLocation = WeatherLocationRef & {
  sourceType: DayLocationSourceType;
  sourceId: string;
};

async function resolveFirstWeatherApiLocation(
  query: string,
): Promise<WeatherLocationRef | null> {
  try {
    const results = await searchWeatherLocations(query);
    return results[0] ?? null;
  } catch {
    return null;
  }
}

async function resolveCandidate(
  candidate: DayLocationCandidate,
): Promise<ResolvedDayWeatherLocation | null> {
  if (candidate.coordinates) {
    return {
      label: candidate.query,
      latitude: candidate.coordinates.latitude,
      longitude: candidate.coordinates.longitude,
      country: candidate.country ?? "Japan",
      sourceType: candidate.sourceType,
      sourceId: candidate.sourceId,
    };
  }

  const location = await resolveFirstWeatherApiLocation(candidate.query);
  if (!location) {
    return null;
  }

  return {
    ...location,
    sourceType: candidate.sourceType,
    sourceId: candidate.sourceId,
  };
}

export async function resolveDayLocation(
  input: ResolveDayLocationCandidatesInput,
): Promise<ResolvedDayWeatherLocation | null> {
  const candidates = resolveDayLocationCandidates(input);

  for (const candidate of candidates) {
    const resolved = await resolveCandidate(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}
