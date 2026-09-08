"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ResolvedPlacePreview, PlaceSuggestion } from "@/features/places/types";
import {
  PLACES_AUTOCOMPLETE_DEBOUNCE_MS,
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "@/features/places/constants";
import {
  createPlaceSessionToken,
  isValidPlaceSessionToken,
} from "@/features/places/placeSession";
import { GooglePlacesAttribution } from "./GooglePlacesAttribution";
import styles from "./placeSearch.module.scss";

export type PlaceSearchSelection = ResolvedPlacePreview;

type PlaceSearchFieldProps = {
  tripId: string;
  inputId?: string;
  label?: string;
  initialSelection?: PlaceSearchSelection | null;
  onSelectionChange: (selection: PlaceSearchSelection | null) => void;
  disabled?: boolean;
};

export function PlaceSearchField({
  tripId,
  inputId,
  label = "חפשו את מקום הלינה",
  initialSelection = null,
  onSelectionChange,
  disabled = false,
}: PlaceSearchFieldProps) {
  const generatedId = useId();
  const fieldId = inputId ?? generatedId;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selection, setSelection] = useState<PlaceSearchSelection | null>(
    initialSelection,
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const sessionTokenRef = useRef(createPlaceSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = createPlaceSessionToken();
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    onSelectionChange(null);
    setQuery("");
    setSuggestions([]);
    setActiveIndex(-1);
    setStatus(null);
    setError(null);
    resetSession();
  }, [onSelectionChange, resetSession]);

  const trimmedQuery = query.trim();
  const canSearch =
    !disabled &&
    !selection &&
    trimmedQuery.length >= PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH;

  useEffect(() => {
    if (!canSearch) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        setStatus("טוען הצעות...");
        setError(null);

        try {
          const response = await fetch("/app/api/places/autocomplete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tripId,
              input: trimmedQuery,
              sessionToken: sessionTokenRef.current,
            }),
          });

          const payload = (await response.json()) as {
            suggestions?: PlaceSuggestion[];
            error?: string;
          };

          if (!response.ok) {
            setSuggestions([]);
            setError(payload.error ?? "לא ניתן לטעון הצעות");
            setStatus(null);
            return;
          }

          setSuggestions(payload.suggestions ?? []);
          setStatus(
            payload.suggestions?.length
              ? null
              : "לא נמצאו תוצאות. נסו חיפוש אחר או הזנה ידנית.",
          );
        } catch {
          setSuggestions([]);
          setError("לא ניתן לטעון הצעות");
          setStatus(null);
        }
      });
    }, PLACES_AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [canSearch, trimmedQuery, tripId]);

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    setError(null);
    setStatus("טוען פרטי מקום...");
    setSuggestions([]);

    if (!isValidPlaceSessionToken(sessionTokenRef.current)) {
      resetSession();
    }

    try {
      const response = await fetch("/app/api/places/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          placeId: suggestion.placeId,
          sessionToken: sessionTokenRef.current,
          primaryText: suggestion.primaryText,
          secondaryText: suggestion.secondaryText,
        }),
      });

      const payload = (await response.json()) as {
        preview?: PlaceSearchSelection;
        error?: string;
      };

      if (!response.ok || !payload.preview) {
        setError(payload.error ?? "לא ניתן לטעון פרטי המקום");
        setStatus(null);
        resetSession();
        return;
      }

      setSelection(payload.preview);
      onSelectionChange(payload.preview);
      setQuery("");
      setStatus(null);
      resetSession();
    } catch {
      setError("לא ניתן לטעון פרטי המקום");
      setStatus(null);
      resetSession();
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) {
        void selectSuggestion(suggestion);
      }
    }

    if (event.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);

    if (value.trim().length < PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH) {
      setSuggestions([]);
      setStatus(null);
      setError(null);
    }
  }

  if (selection) {
    return (
      <div className={styles.selectedCard}>
        <div className={styles.selectedHeader}>
          <div>
            <p className={styles.selectedName} dir="auto">
              {selection.primaryText}
            </p>
            {selection.secondaryText ? (
              <p className={styles.selectedMeta} dir="auto">
                {selection.secondaryText}
              </p>
            ) : null}
          </div>
          {!disabled ? (
            <button
              type="button"
              className={styles.changeButton}
              onClick={clearSelection}
            >
              שינוי מקום
            </button>
          ) : null}
        </div>
        <GooglePlacesAttribution />
        <input type="hidden" name="placeSource" value="google" />
        <input type="hidden" name="googlePlaceId" value={selection.placeId} />
      </div>
    );
  }

  return (
    <div className={styles.searchField}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={fieldId}
          className={styles.input}
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Hotel Gracery Shinjuku..."
          autoComplete="off"
          disabled={disabled || isPending}
          dir="auto"
        />
        {suggestions.length > 0 ? (
          <ul className={styles.suggestions} ref={listRef} role="listbox">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.placeId} role="presentation">
                <button
                  type="button"
                  className={styles.suggestionButton}
                  data-active={index === activeIndex ? "true" : undefined}
                  onClick={() => void selectSuggestion(suggestion)}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <span className={styles.suggestionPrimary} dir="auto">
                    {suggestion.primaryText}
                  </span>
                  {suggestion.secondaryText ? (
                    <span className={styles.suggestionSecondary} dir="auto">
                      {suggestion.secondaryText}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {status ? <p className={styles.status}>{status}</p> : null}
      {error ? (
        <p className={`${styles.status} ${styles.statusError}`} role="alert">
          {error}
        </p>
      ) : null}
      {suggestions.length > 0 || trimmedQuery.length >= PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH ? (
        <GooglePlacesAttribution />
      ) : null}
    </div>
  );
}
