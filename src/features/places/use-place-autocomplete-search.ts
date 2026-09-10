"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PLACES_AUTOCOMPLETE_DEBOUNCE_MS,
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "./constants";
import { shouldApplyAutocompleteResponse } from "./place-autocomplete-race";
import { createPlaceSessionToken } from "./placeSession";
import type { PlacePrimaryTypes, PlaceSuggestion } from "./types";

export type UsePlaceAutocompleteSearchInput = {
  tripId: string;
  query: string;
  enabled: boolean;
  includedPrimaryTypes?: PlacePrimaryTypes;
};

export type UsePlaceAutocompleteSearchResult = {
  suggestions: PlaceSuggestion[];
  isLoading: boolean;
  status: string | null;
  error: string | null;
  getSessionToken: () => string;
  resetSession: () => void;
};

type AutocompleteResponse = {
  suggestions?: PlaceSuggestion[];
  error?: string;
};

export async function fetchPlaceAutocompleteSuggestions(
  input: {
    tripId: string;
    query: string;
    sessionToken: string;
    includedPrimaryTypes?: PlacePrimaryTypes;
  },
  signal?: AbortSignal,
): Promise<AutocompleteResponse & { ok: boolean; status: number }> {
  const response = await fetch("/app/api/places/autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tripId: input.tripId,
      input: input.query,
      sessionToken: input.sessionToken,
      ...(input.includedPrimaryTypes !== undefined
        ? { includedPrimaryTypes: [...input.includedPrimaryTypes] }
        : {}),
    }),
    signal,
  });

  const payload = (await response.json()) as AutocompleteResponse;

  return {
    ok: response.ok,
    status: response.status,
    suggestions: payload.suggestions,
    error: payload.error,
  };
}

export function usePlaceAutocompleteSearch({
  tripId,
  query,
  enabled,
  includedPrimaryTypes,
}: UsePlaceAutocompleteSearchInput): UsePlaceAutocompleteSearchResult {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionTokenRef = useRef(createPlaceSessionToken());
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getSessionToken = useCallback(() => sessionTokenRef.current, []);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = createPlaceSessionToken();
  }, []);

  const trimmedQuery = query.trim();
  const canSearch =
    enabled && trimmedQuery.length >= PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH;

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (!canSearch) {
      queueMicrotask(() => {
        setIsLoading(false);
        if (trimmedQuery.length < PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH) {
          setSuggestions([]);
          setStatus(null);
          setError(null);
        }
      });
      return;
    }

    debounceRef.current = setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setStatus("טוען הצעות...");

      void fetchPlaceAutocompleteSuggestions(
        {
          tripId,
          query: trimmedQuery,
          sessionToken: sessionTokenRef.current,
          includedPrimaryTypes,
        },
        controller.signal,
      )
        .then((payload) => {
          if (controller.signal.aborted) {
            return;
          }
          if (!shouldApplyAutocompleteResponse(requestId, requestIdRef.current)) {
            return;
          }

          if (!payload.ok) {
            setSuggestions([]);
            setError(payload.error ?? "לא ניתן לטעון הצעות");
            setStatus(null);
            return;
          }

          const nextSuggestions = payload.suggestions ?? [];
          setSuggestions(nextSuggestions);
          setStatus(
            nextSuggestions.length
              ? null
              : "לא נמצאו תוצאות. נסו חיפוש אחר או הזנה ידנית.",
          );
        })
        .catch((fetchError: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          if (!shouldApplyAutocompleteResponse(requestId, requestIdRef.current)) {
            return;
          }
          if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
            return;
          }
          setSuggestions([]);
          setError("לא ניתן לטעון הצעות");
          setStatus(null);
        })
        .finally(() => {
          if (shouldApplyAutocompleteResponse(requestId, requestIdRef.current)) {
            setIsLoading(false);
          }
        });
    }, PLACES_AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [canSearch, includedPrimaryTypes, trimmedQuery, tripId]);

  return {
    suggestions,
    isLoading,
    status,
    error,
    getSessionToken,
    resetSession,
  };
}
