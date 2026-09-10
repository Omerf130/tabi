"use client";

import { useCallback, useId, useState } from "react";
import { GooglePlacesAttribution } from "@/features/places/GooglePlacesAttribution";
import {
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "@/features/places/constants";
import { isValidPlaceSessionToken } from "@/features/places/placeSession";
import type { PlaceSuggestion } from "@/features/places/types";
import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";
import { useDestinationAutocompleteSearch } from "./use-destination-autocomplete-search";
import styles from "./CreateTripWizard.module.scss";

type DestinationSearchFieldProps = {
  selection: TripDestinationSnapshot | null;
  onSelectionChange: (selection: TripDestinationSnapshot | null) => void;
  disabled?: boolean;
};

export function DestinationSearchField({
  selection,
  onSelectionChange,
  disabled = false,
}: DestinationSearchFieldProps) {
  const fieldId = useId();
  const listboxId = `${fieldId}-suggestions`;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [resolveStatus, setResolveStatus] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const {
    suggestions,
    isLoading,
    status,
    error,
    getSessionToken,
    resetSession,
  } = useDestinationAutocompleteSearch({
    query,
    enabled: !disabled && !selection,
  });

  const clearSelection = useCallback(() => {
    onSelectionChange(null);
    setQuery("");
    setActiveIndex(-1);
    setResolveStatus(null);
    setResolveError(null);
    resetSession();
  }, [onSelectionChange, resetSession]);

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    setResolveError(null);
    setResolveStatus("Loading destination...");

    if (!isValidPlaceSessionToken(getSessionToken())) {
      resetSession();
    }

    try {
      const response = await fetch("/app/api/places/destination/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: suggestion.placeId,
          sessionToken: getSessionToken(),
          primaryText: suggestion.primaryText,
          secondaryText: suggestion.secondaryText,
        }),
      });

      const payload = (await response.json()) as {
        snapshot?: TripDestinationSnapshot;
        error?: string;
      };

      if (!response.ok || !payload.snapshot) {
        setResolveError(payload.error ?? "Could not load this destination");
        setResolveStatus(null);
        resetSession();
        return;
      }

      onSelectionChange(payload.snapshot);
      setQuery("");
      setActiveIndex(-1);
      setResolveStatus(null);
      resetSession();
    } catch {
      setResolveError("Could not load this destination");
      setResolveStatus(null);
      resetSession();
    }
  }

  if (selection) {
    return (
      <div className={styles.selectedDestination}>
        <div>
          <p className={styles.selectedDestinationName}>{selection.displayName}</p>
          {selection.secondaryLabel ? (
            <p className={styles.selectedDestinationMeta}>{selection.secondaryLabel}</p>
          ) : null}
        </div>
        {!disabled ? (
          <button type="button" className={styles.changeButton} onClick={clearSelection}>
            Change
          </button>
        ) : null}
        <GooglePlacesAttribution />
      </div>
    );
  }

  const showSuggestions = suggestions.length > 0;
  const activeDescendantId =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;
  const combinedStatus = resolveStatus ?? status;
  const combinedError = resolveError ?? error;

  return (
    <div className={styles.searchField}>
      <label className={styles.fieldLabel} htmlFor={fieldId}>
        Search destination
      </label>
      <div className={styles.inputWrap}>
        <input
          id={fieldId}
          className={styles.textInput}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(-1);
            setResolveError(null);
            setResolveStatus(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setActiveIndex(-1);
              return;
            }
            if (!suggestions.length) {
              return;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) =>
                Math.min(current + 1, suggestions.length - 1),
              );
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
          }}
          placeholder="Country, city, or region"
          autoComplete="off"
          disabled={disabled}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          aria-busy={isLoading || Boolean(resolveStatus)}
        />
        {isLoading ? <span className={styles.loadingIndicator} aria-hidden="true" /> : null}
        {showSuggestions ? (
          <ul
            className={styles.suggestions}
            id={listboxId}
            role="listbox"
            aria-label="Destination suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.placeId} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  className={styles.suggestionButton}
                  data-active={index === activeIndex ? "true" : undefined}
                  onClick={() => void selectSuggestion(suggestion)}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <span className={styles.suggestionPrimary}>{suggestion.primaryText}</span>
                  {suggestion.secondaryText ? (
                    <span className={styles.suggestionSecondary}>
                      {suggestion.secondaryText}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {combinedStatus ? <p className={styles.fieldHint}>{combinedStatus}</p> : null}
      {combinedError ? (
        <p className={styles.fieldError} role="alert">
          {combinedError}
        </p>
      ) : null}
      {showSuggestions || query.trim().length >= PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH ? (
        <GooglePlacesAttribution />
      ) : null}
    </div>
  );
}
