"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { IconChevron } from "@/components/ui/icons";
import {
  WEATHER_MESSAGES,
  buildWeatherSnapshotHref,
  makeWeatherLocationKey,
} from "./constants";
import {
  formatForecastDayLabel,
  formatLocationLabel,
  formatObservedAt,
  formatRainChance,
  formatTemperatureC,
} from "./format-weather";
import {
  getWeatherLocationPreferenceSnapshot,
  subscribeToWeatherLocationPreference,
  writeWeatherLocationPreference,
} from "./weather-preferences";
import { WeatherLocationSearch } from "./WeatherLocationSearch.client";
import type { WeatherLocationRef, WeatherPageInitialData, WeatherSnapshot } from "./types";
import styles from "./WeatherView.module.scss";

type WeatherPageProps = WeatherPageInitialData;

function createInitialSnapshotState(
  location: WeatherLocationRef,
  initialSnapshot: WeatherSnapshot | null,
): {
  snapshot: WeatherSnapshot | null;
  loadFailed: boolean;
  cache: Record<string, WeatherSnapshot>;
} {
  if (!initialSnapshot) {
    return { snapshot: null, loadFailed: true, cache: {} };
  }

  return {
    snapshot: initialSnapshot,
    loadFailed: false,
    cache: { [makeWeatherLocationKey(location)]: initialSnapshot },
  };
}

function locationsMatchCoordinates(
  left: WeatherLocationRef,
  right: WeatherLocationRef,
): boolean {
  return left.latitude === right.latitude && left.longitude === right.longitude;
}

export function WeatherPage({
  tripId,
  defaultLocation,
  initialSnapshot,
}: WeatherPageProps) {
  const initialState = createInitialSnapshotState(defaultLocation, initialSnapshot);
  const storedLocation = useSyncExternalStore(
    subscribeToWeatherLocationPreference,
    getWeatherLocationPreferenceSnapshot,
    () => null,
  );

  const [selectedLocation, setSelectedLocation] = useState<WeatherLocationRef | null>(null);
  const location = selectedLocation ?? storedLocation ?? defaultLocation;

  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(initialState.snapshot);
  const [snapshotCache, setSnapshotCache] = useState<Record<string, WeatherSnapshot>>(
    initialState.cache,
  );
  const [loadFailed, setLoadFailed] = useState(initialState.loadFailed);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const storedSnapshotFetchStartedRef = useRef(false);

  const fetchSnapshot = useCallback(
    async (
      nextLocation: WeatherLocationRef,
      allowStaleFallback: boolean,
      forceRefresh = false,
    ) => {
      const cacheKey = makeWeatherLocationKey(nextLocation);
      const cached = snapshotCache[cacheKey];

      if (cached && !forceRefresh) {
        setSnapshot(cached);
        setLoadFailed(false);
        setRefreshFailed(false);
        return cached;
      }

      setIsFetching(true);
      try {
        const response = await fetch(buildWeatherSnapshotHref(tripId, nextLocation));
        if (!response.ok) {
          throw new Error("snapshot fetch failed");
        }

        const nextSnapshot = (await response.json()) as WeatherSnapshot;
        const enrichedSnapshot: WeatherSnapshot = {
          ...nextSnapshot,
          location: nextLocation,
        };

        setSnapshotCache((current) => ({
          ...current,
          [cacheKey]: enrichedSnapshot,
        }));
        setSnapshot(enrichedSnapshot);
        setLoadFailed(false);
        setRefreshFailed(false);
        return enrichedSnapshot;
      } catch {
        if (allowStaleFallback && cached) {
          setSnapshot(cached);
          setLoadFailed(false);
          setRefreshFailed(true);
          return cached;
        }

        if (allowStaleFallback && snapshot) {
          setRefreshFailed(true);
          setLoadFailed(false);
          return snapshot;
        }

        setLoadFailed(true);
        setRefreshFailed(false);
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    [snapshot, snapshotCache, tripId],
  );

  useEffect(() => {
    if (storedSnapshotFetchStartedRef.current || !storedLocation) {
      return;
    }

    if (locationsMatchCoordinates(storedLocation, defaultLocation)) {
      return;
    }

    storedSnapshotFetchStartedRef.current = true;
    const preferredLocation = storedLocation;
    queueMicrotask(() => {
      void fetchSnapshot(preferredLocation, false);
    });
  }, [defaultLocation, fetchSnapshot, storedLocation]);

  function handleLocationSelect(nextLocation: WeatherLocationRef) {
    setSelectedLocation(nextLocation);
    writeWeatherLocationPreference(nextLocation);
    void fetchSnapshot(nextLocation, true);
  }

  function handleRetry() {
    void fetchSnapshot(location, false, true);
  }

  const locationLabel = formatLocationLabel(
    location.label,
    location.region,
    location.country,
  );

  return (
    <div className={styles.weather}>
      <div className={styles.locationBar}>
        <button
          type="button"
          className={styles.locationButton}
          onClick={() => setSearchOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          aria-label={`${WEATHER_MESSAGES.changeLocation}: ${locationLabel}`}
          disabled={isFetching}
        >
          <span className={styles.locationText}>
            <span className={styles.locationLabel}>{location.label}</span>
            <span className={styles.locationMeta}>{locationLabel}</span>
          </span>
          <IconChevron className={styles.locationChevron} aria-hidden />
        </button>
      </div>

      {loadFailed ? (
        <div className={styles.errorBlock}>
          <p className={styles.errorText}>{WEATHER_MESSAGES.loadFailed}</p>
          <button type="button" className={styles.retryButton} onClick={handleRetry}>
            {WEATHER_MESSAGES.retry}
          </button>
        </div>
      ) : snapshot ? (
        <>
          <section className={styles.currentCard} aria-label="מזג אוויר נוכחי">
            <div className={styles.currentMain}>
              <div>
                <p className={styles.currentTemp}>
                  {formatTemperatureC(snapshot.current.temperatureC)}
                </p>
                <p className={styles.currentCondition}>{snapshot.current.condition.label}</p>
              </div>
              {snapshot.current.condition.iconUrl ? (
                // Provider CDN icon; isolated for future visual redesign.
                // eslint-disable-next-line @next/next/no-img-element -- WeatherAPI CDN icon
                <img
                  src={snapshot.current.condition.iconUrl}
                  alt=""
                  className={styles.currentIcon}
                />
              ) : null}
            </div>
            <p className={styles.feelsLike}>
              {WEATHER_MESSAGES.feelsLike} {formatTemperatureC(snapshot.current.feelsLikeC)}
            </p>
          </section>

          <section className={styles.todayCard} aria-label={WEATHER_MESSAGES.today}>
            <h2 className={styles.sectionTitle}>{WEATHER_MESSAGES.today}</h2>
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <p className={styles.statLabel}>מינימום</p>
                <p className={styles.statValue}>
                  {formatTemperatureC(snapshot.today.minTemperatureC)}
                </p>
              </div>
              <div className={styles.stat}>
                <p className={styles.statLabel}>מקסימום</p>
                <p className={styles.statValue}>
                  {formatTemperatureC(snapshot.today.maxTemperatureC)}
                </p>
              </div>
              {formatRainChance(snapshot.today.chanceOfRainPercent) ? (
                <div className={styles.stat}>
                  <p className={styles.statLabel}>{WEATHER_MESSAGES.rainChance}</p>
                  <p className={styles.statValue}>
                    {formatRainChance(snapshot.today.chanceOfRainPercent)}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          {snapshot.forecast.length > 0 ? (
            <section className={styles.forecastCard} aria-label={WEATHER_MESSAGES.forecast}>
              <h2 className={styles.sectionTitle}>{WEATHER_MESSAGES.forecast}</h2>
              <ul className={styles.forecastList}>
                {snapshot.forecast.map((day) => (
                  <li key={day.date} className={styles.forecastItem}>
                    <p className={styles.forecastDay}>{formatForecastDayLabel(day.date)}</p>
                    <div className={styles.forecastMiddle}>
                      {day.condition.iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- WeatherAPI CDN icon
                        <img
                          src={day.condition.iconUrl}
                          alt=""
                          className={styles.forecastIcon}
                        />
                      ) : null}
                      <p className={styles.forecastCondition}>{day.condition.label}</p>
                    </div>
                    <div className={styles.forecastTemps}>
                      <p className={styles.forecastTempRange}>
                        {formatTemperatureC(day.maxTemperatureC)} /{" "}
                        {formatTemperatureC(day.minTemperatureC)}
                      </p>
                      {formatRainChance(day.chanceOfRainPercent) ? (
                        <p className={styles.forecastRain}>
                          {WEATHER_MESSAGES.rainChance}{" "}
                          {formatRainChance(day.chanceOfRainPercent)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className={styles.freshness}>
            {WEATHER_MESSAGES.updated} · {formatObservedAt(snapshot.observedAt)}
          </p>
          {refreshFailed ? (
            <p className={styles.refreshNotice}>{WEATHER_MESSAGES.refreshFailed}</p>
          ) : null}
        </>
      ) : null}

      {searchOpen ? (
        <WeatherLocationSearch
          tripId={tripId}
          onSelect={handleLocationSelect}
          onClose={() => setSearchOpen(false)}
        />
      ) : null}
    </div>
  );
}
