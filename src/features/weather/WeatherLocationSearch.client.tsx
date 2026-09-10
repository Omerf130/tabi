"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { IconSearch } from "@/components/ui/icons";
import {
  WEATHER_MESSAGES,
  WEATHER_SEARCH_DEBOUNCE_MS,
  WEATHER_SEARCH_MIN_INPUT_LENGTH,
  buildWeatherSearchHref,
} from "./constants";
import { formatLocationLabel } from "./format-weather";
import type { WeatherLocationRef } from "./types";
import styles from "./WeatherView.module.scss";

type WeatherLocationSearchProps = {
  tripId: string;
  onSelect: (location: WeatherLocationRef) => void;
  onClose: () => void;
};

export function WeatherLocationSearch({
  tripId,
  onSelect,
  onClose,
}: WeatherLocationSearchProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WeatherLocationRef[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) {
      return;
    }

    dialog.showModal();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= WEATHER_SEARCH_MIN_INPUT_LENGTH;
  const visibleResults = canSearch ? results : [];

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (!canSearch) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      startTransition(async () => {
        setStatus("מחפש...");
        setError(null);

        try {
          const response = await fetch(buildWeatherSearchHref(tripId, trimmedQuery), {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error("search failed");
          }

          const nextResults = (await response.json()) as WeatherLocationRef[];
          setResults(nextResults);
          setStatus(null);
        } catch (fetchError) {
          if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
            return;
          }

          setResults([]);
          setStatus(null);
          setError(WEATHER_MESSAGES.loadFailed);
        }
      });
    }, WEATHER_SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [canSearch, trimmedQuery, tripId]);

  function handleClose() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setQuery("");
    setResults([]);
    setStatus(null);
    setError(null);
    onClose();
  }

  function handleSelect(location: WeatherLocationRef) {
    onSelect(location);
    handleClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.searchPanel}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      <div className={styles.searchPanelInner}>
        <div className={styles.searchHeader}>
          <h2 id={titleId} className={styles.searchTitle}>
            {WEATHER_MESSAGES.changeLocation}
          </h2>
          <button
            type="button"
            className={styles.searchClose}
            onClick={handleClose}
            aria-label="סגירה"
          >
            ×
          </button>
        </div>

        <div className={styles.searchFieldWrap}>
          <IconSearch className={styles.searchFieldIcon} aria-hidden />
          <input
            type="search"
            className={styles.searchInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={WEATHER_MESSAGES.searchPlaceholder}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>

        {error ? <p className={styles.emptyResults}>{error}</p> : null}
        {status ? <p className={styles.searchStatus}>{status}</p> : null}
        {!error && !status && visibleResults.length === 0 && canSearch ? (
          <p className={styles.emptyResults}>{WEATHER_MESSAGES.noResults}</p>
        ) : null}

        <ul className={styles.searchResults}>
          {visibleResults.map((location) => (
            <li key={`${location.latitude},${location.longitude},${location.label}`}>
              <button
                type="button"
                className={styles.searchOption}
                onClick={() => handleSelect(location)}
                disabled={isPending}
              >
                <span className={styles.searchOptionLabel}>{location.label}</span>
                <span className={styles.searchOptionMeta}>
                  {formatLocationLabel(location.label, location.region, location.country)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
