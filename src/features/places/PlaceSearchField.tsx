"use client";

import { useCallback, useId, useState } from "react";
import type {
  PlacePrimaryTypes,
  PlaceSuggestion,
  ResolvedPlacePreview,
} from "@/features/places/types";
import {
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "@/features/places/constants";
import { isValidPlaceSessionToken } from "@/features/places/placeSession";
import { usePlaceAutocompleteSearch } from "@/features/places/use-place-autocomplete-search";
import { GooglePlacesAttribution } from "./GooglePlacesAttribution";
import styles from "./placeSearch.module.scss";

export type PlaceSearchSelection = ResolvedPlacePreview;

type PlaceSearchFieldProps = {
  tripId: string;
  inputId?: string;
  label?: string;
  placeholder?: string;
  selectedPreviewLabel?: string;
  includedPrimaryTypes?: PlacePrimaryTypes;
  resolvePurpose?: "accommodation" | "activity";
  includeHiddenFields?: boolean;
  initialSelection?: PlaceSearchSelection | null;
  onSelectionChange: (selection: PlaceSearchSelection | null) => void;
  disabled?: boolean;
};

export function PlaceSearchField({
  tripId,
  inputId,
  label = "חפשו את מקום הלינה",
  placeholder = "Hotel Gracery Shinjuku...",
  selectedPreviewLabel,
  includedPrimaryTypes,
  resolvePurpose = "accommodation",
  includeHiddenFields = true,
  initialSelection = null,
  onSelectionChange,
  disabled = false,
}: PlaceSearchFieldProps) {
  const generatedId = useId();
  const fieldId = inputId ?? generatedId;
  const listboxId = `${fieldId}-suggestions`;
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<PlaceSearchSelection | null>(
    initialSelection,
  );
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
  } = usePlaceAutocompleteSearch({
    tripId,
    query,
    enabled: !disabled && !selection,
    includedPrimaryTypes,
  });

  const clearSelection = useCallback(() => {
    setSelection(null);
    onSelectionChange(null);
    setQuery("");
    setActiveIndex(-1);
    setResolveStatus(null);
    setResolveError(null);
    resetSession();
  }, [onSelectionChange, resetSession]);

  const trimmedQuery = query.trim();
  const showSuggestions = suggestions.length > 0;
  const activeDescendantId =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    setResolveError(null);
    setResolveStatus("טוען פרטי מקום...");

    if (!isValidPlaceSessionToken(getSessionToken())) {
      resetSession();
    }

    try {
      const response = await fetch("/app/api/places/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          placeId: suggestion.placeId,
          sessionToken: getSessionToken(),
          primaryText: suggestion.primaryText,
          secondaryText: suggestion.secondaryText,
          purpose: resolvePurpose,
        }),
      });

      const payload = (await response.json()) as {
        preview?: PlaceSearchSelection;
        error?: string;
      };

      if (!response.ok || !payload.preview) {
        setResolveError(payload.error ?? "לא ניתן לטעון פרטי המקום");
        setResolveStatus(null);
        resetSession();
        return;
      }

      setSelection(payload.preview);
      onSelectionChange(payload.preview);
      setQuery("");
      setActiveIndex(-1);
      setResolveStatus(null);
      resetSession();
    } catch {
      setResolveError("לא ניתן לטעון פרטי המקום");
      setResolveStatus(null);
      resetSession();
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setActiveIndex(-1);
      return;
    }

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
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    setResolveError(null);
    setResolveStatus(null);
  }

  if (selection) {
    return (
      <div className={styles.selectedCard}>
        <div className={styles.selectedHeader}>
          <div>
            {selectedPreviewLabel ? (
              <p className={styles.selectedPreviewLabel}>{selectedPreviewLabel}</p>
            ) : null}
            <p className={styles.selectedName} dir="auto">
              {selection.primaryText}
            </p>
            {selection.secondaryText ? (
              <p className={styles.selectedMeta} dir="auto">
                {selection.secondaryText}
              </p>
            ) : null}
            {selection.formattedAddress ? (
              <p className={styles.selectedMeta} dir="auto">
                {selection.formattedAddress}
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
        {includeHiddenFields ? (
          <>
            <input type="hidden" name="placeSource" value="google" />
            <input type="hidden" name="googlePlaceId" value={selection.placeId} />
          </>
        ) : null}
      </div>
    );
  }

  const combinedStatus = resolveStatus ?? status;
  const combinedError = resolveError ?? error;

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
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
          dir="auto"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          aria-autocomplete="list"
          aria-busy={isLoading || Boolean(resolveStatus)}
        />
        {isLoading ? (
          <span className={styles.loadingIndicator} aria-hidden="true" />
        ) : null}
        {showSuggestions ? (
          <ul
            className={styles.suggestions}
            id={listboxId}
            role="listbox"
            aria-label={label}
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
      {combinedStatus ? <p className={styles.status}>{combinedStatus}</p> : null}
      {combinedError ? (
        <p className={`${styles.status} ${styles.statusError}`} role="alert">
          {combinedError}
        </p>
      ) : null}
      {showSuggestions || trimmedQuery.length >= PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH ? (
        <GooglePlacesAttribution />
      ) : null}
    </div>
  );
}
