"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PLACES_AUTOCOMPLETE_DEBOUNCE_MS,
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "@/features/places/constants";
import { shouldApplyAutocompleteResponse } from "@/features/places/place-autocomplete-race";
import { createPlaceSessionToken } from "@/features/places/placeSession";
import type { PlaceSuggestion } from "@/features/places/types";

type AutocompleteResponse = {
  suggestions?: PlaceSuggestion[];
  error?: string;
};

async function fetchDestinationAutocomplete(
  input: { query: string; sessionToken: string },
  signal?: AbortSignal,
): Promise<AutocompleteResponse & { ok: boolean }> {
  const response = await fetch("/app/api/places/destination/autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: input.query,
      sessionToken: input.sessionToken,
    }),
    signal,
  });

  const payload = (await response.json()) as AutocompleteResponse;
  return {
    ok: response.ok,
    suggestions: payload.suggestions,
    error: payload.error,
  };
}

export function useDestinationAutocompleteSearch(input: {
  query: string;
  enabled: boolean;
}) {
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

  const trimmedQuery = input.query.trim();
  const canSearch =
    input.enabled && trimmedQuery.length >= PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH;

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
      setStatus("Searching destinations...");

      void fetchDestinationAutocomplete(
        {
          query: trimmedQuery,
          sessionToken: sessionTokenRef.current,
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
            setError(payload.error ?? "Could not load suggestions");
            setStatus(null);
            return;
          }

          const nextSuggestions = payload.suggestions ?? [];
          setSuggestions(nextSuggestions);
          setStatus(
            nextSuggestions.length ? null : "No destinations found. Try another search.",
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
          setError("Could not load suggestions");
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
  }, [canSearch, trimmedQuery]);

  return {
    suggestions,
    isLoading,
    status,
    error,
    getSessionToken,
    resetSession,
  };
}
