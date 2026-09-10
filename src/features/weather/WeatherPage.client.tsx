"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { IconBack, IconSearch, IconWeather } from "@/components/ui/icons";
import { buildTravelWeatherAdvice } from "./build-travel-weather-advice";
import {
  WEATHER_MESSAGES,
  buildWeatherSnapshotHref,
  makeWeatherLocationKey,
} from "./constants";
import {
  formatForecastRowLabel,
  formatHighLowRange,
  formatObservedAt,
  formatTemperatureC,
  formatWeatherHeroDate,
} from "./format-weather";
import { buildNearTermWeatherColumns, shouldShowNearTermStrip } from "./get-near-term-hourly";
import { getWeatherForecastDaysForDisplay } from "./get-weather-forecast-days";
import { WeatherAdviceIcon } from "./WeatherAdviceIcon";
import {
  getWeatherLocationPreferenceSnapshot,
  subscribeToWeatherLocationPreference,
  writeWeatherLocationPreference,
} from "./weather-preferences";
import { WeatherLocationSearch } from "./WeatherLocationSearch.client";
import type { WeatherLocationRef, WeatherPageProps, WeatherSnapshot } from "./types";
import styles from "./WeatherView.module.scss";

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

function WeatherIcon({ iconUrl, className }: { iconUrl: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- WeatherAPI CDN icon
    <img src={iconUrl} alt="" aria-hidden className={className} />
  );
}

function WeatherSkeleton() {
  return (
    <div className={styles.skeletonLayout} aria-busy="true" aria-label="טוען מזג אוויר">
      <div className={styles.skeletonLocation}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonLocationName}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonLocationDate}`} />
      </div>
      <div className={styles.skeletonHero}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonIcon}`} />
        <div className={styles.skeletonHeroText}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonTemp}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonLineShort}`} />
        </div>
      </div>
      <div className={styles.skeletonHourly}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonHourlyCol}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonHourlyCol}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonHourlyCol}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonHourlyCol}`} />
      </div>
      <div className={`${styles.skeletonBlock} ${styles.skeletonAdvice}`} />
      <div className={`${styles.skeletonBlock} ${styles.skeletonForecastCard}`} />
    </div>
  );
}

export function WeatherPage({
  tripId,
  backHref,
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

  const showSkeleton = isFetching && !snapshot;
  const advice = snapshot ? buildTravelWeatherAdvice(snapshot) : null;
  const forecastDays = snapshot ? getWeatherForecastDaysForDisplay(snapshot) : [];
  const nearTermColumns = snapshot ? buildNearTermWeatherColumns(snapshot) : [];
  const showNearTermStrip = snapshot ? shouldShowNearTermStrip(snapshot) : false;

  return (
    <div className={styles.weather}>
      <header className={styles.weatherHeader}>
        <Link href={backHref} className={styles.backLink} aria-label="חזרה">
          <IconBack className={styles.backGlyph} aria-hidden />
        </Link>
        <div className={styles.weatherHeaderTitleGroup}>
          <IconWeather className={styles.weatherHeaderIcon} aria-hidden />
          <h1 className={styles.weatherHeaderTitle}>מזג אוויר</h1>
        </div>
        <button
          type="button"
          className={styles.headerSearchButton}
          onClick={() => setSearchOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          aria-label={WEATHER_MESSAGES.searchLocation}
        >
          <IconSearch className={styles.headerSearchIcon} aria-hidden />
        </button>
      </header>

      <div className={styles.locationBlock}>
        <h2 className={styles.locationName}>{location.label}</h2>
        {snapshot ? (
          <p className={styles.locationDate}>{formatWeatherHeroDate(snapshot.observedAt)}</p>
        ) : (
          <p className={styles.locationDatePlaceholder} aria-hidden />
        )}
      </div>

      {loadFailed ? (
        <div className={styles.errorBlock} role="alert">
          <p className={styles.errorText}>{WEATHER_MESSAGES.loadFailed}</p>
          <button type="button" className={styles.retryButton} onClick={handleRetry}>
            {WEATHER_MESSAGES.retry}
          </button>
        </div>
      ) : showSkeleton ? (
        <WeatherSkeleton />
      ) : snapshot ? (
        <div className={styles.weatherBody}>
          <div className={styles.primaryStack}>
            <section className={styles.currentSection} aria-label="מזג אוויר נוכחי">
              <div className={styles.currentHero}>
                {snapshot.current.condition.iconUrl ? (
                  <div className={styles.currentIconWrap}>
                    <WeatherIcon
                      iconUrl={snapshot.current.condition.iconUrl}
                      className={styles.currentIcon}
                    />
                  </div>
                ) : null}
                <div className={styles.currentDetails}>
                  <p className={styles.currentTemp}>
                    {formatTemperatureC(snapshot.current.temperatureC)}
                  </p>
                  <p className={styles.currentCondition}>{snapshot.current.condition.label}</p>
                  <p className={styles.currentHighLow}>
                    {formatHighLowRange(
                      snapshot.today.maxTemperatureC,
                      snapshot.today.minTemperatureC,
                    )}
                  </p>
                </div>
              </div>
            </section>

            {showNearTermStrip ? (
              <section className={styles.hourlySection} aria-label="תחזית לטווח קצר">
                <div
                  className={styles.hourlyStrip}
                  style={{
                    gridTemplateColumns: `repeat(${nearTermColumns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {nearTermColumns.map((column) => (
                    <div
                      key={`${column.label}-${column.temperatureC}`}
                      className={styles.hourlyColumn}
                    >
                      <span className={styles.hourlyLabel}>{column.label}</span>
                      {column.condition.iconUrl ? (
                        <WeatherIcon
                          iconUrl={column.condition.iconUrl}
                          className={styles.hourlyIcon}
                        />
                      ) : null}
                      <span className={styles.hourlyTemp}>
                        {formatTemperatureC(column.temperatureC)}
                      </span>
                      <span className={styles.srOnly}>{column.condition.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {advice ? (
              <section className={styles.adviceCard} aria-label={advice.title}>
                <div className={styles.adviceIconWrap} aria-hidden>
                  <WeatherAdviceIcon kind={advice.icon} className={styles.adviceIcon} />
                </div>
                <div className={styles.adviceText}>
                  <h3 className={styles.adviceTitle}>{advice.title}</h3>
                  <p className={styles.adviceMessage}>{advice.message}</p>
                </div>
              </section>
            ) : null}
          </div>

          <div className={styles.secondaryStack}>
            <section
              className={styles.forecastCard}
              aria-labelledby="weather-forecast-title"
            >
              <h2 id="weather-forecast-title" className={styles.forecastTitle}>
                {WEATHER_MESSAGES.forecast}
              </h2>
              {forecastDays.length > 0 ? (
                <ul className={styles.forecastList}>
                  {forecastDays.map((day) => (
                    <li key={day.date} className={styles.forecastRow}>
                      <span className={styles.forecastDate}>{formatForecastRowLabel(day.date)}</span>
                      <span className={styles.forecastIconCell}>
                        {day.condition.iconUrl ? (
                          <WeatherIcon
                            iconUrl={day.condition.iconUrl}
                            className={styles.forecastIcon}
                          />
                        ) : null}
                        <span className={styles.srOnly}>{day.condition.label}</span>
                      </span>
                      <span className={styles.forecastHigh}>
                        {formatTemperatureC(day.maxTemperatureC)}
                      </span>
                      <span className={styles.forecastLow}>
                        {formatTemperatureC(day.minTemperatureC)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <footer className={styles.metaFooter}>
              <p className={styles.freshness}>
                {WEATHER_MESSAGES.updated} · {formatObservedAt(snapshot.observedAt)}
              </p>
              {refreshFailed ? (
                <p className={styles.refreshNotice}>{WEATHER_MESSAGES.refreshFailed}</p>
              ) : null}
            </footer>
          </div>
        </div>
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
