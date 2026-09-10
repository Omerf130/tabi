import { createPlaceSessionToken } from "@/features/places/placeSession";
import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";
import type { PlaceSuggestion } from "@/features/places/types";

type DestinationApiError = {
  error?: string;
};

async function fetchDestinationAutocomplete(
  query: string,
  sessionToken: string,
): Promise<{ ok: boolean; suggestions?: PlaceSuggestion[]; error?: string }> {
  const response = await fetch("/app/api/places/destination/autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: query, sessionToken }),
  });
  const payload = (await response.json()) as {
    suggestions?: PlaceSuggestion[];
  } & DestinationApiError;

  return {
    ok: response.ok,
    suggestions: payload.suggestions,
    error: payload.error,
  };
}

async function fetchDestinationResolve(input: {
  placeId: string;
  sessionToken: string;
  primaryText: string;
  secondaryText?: string;
}): Promise<{ ok: boolean; snapshot?: TripDestinationSnapshot; error?: string }> {
  const response = await fetch("/app/api/places/destination/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as {
    snapshot?: TripDestinationSnapshot;
  } & DestinationApiError;

  return {
    ok: response.ok,
    snapshot: payload.snapshot,
    error: payload.error,
  };
}

/** Autocomplete then resolve — same session token lifecycle as manual search. */
export async function resolveDestinationFromQuery(
  query: string,
): Promise<{ snapshot?: TripDestinationSnapshot; error?: string }> {
  const sessionToken = createPlaceSessionToken();
  const autocomplete = await fetchDestinationAutocomplete(query, sessionToken);

  if (!autocomplete.ok) {
    return { error: autocomplete.error ?? "Could not load this destination" };
  }

  const suggestion = autocomplete.suggestions?.[0];
  if (!suggestion) {
    return { error: "Could not find this destination" };
  }

  const resolved = await fetchDestinationResolve({
    placeId: suggestion.placeId,
    sessionToken,
    primaryText: suggestion.primaryText,
    secondaryText: suggestion.secondaryText,
  });

  if (!resolved.ok || !resolved.snapshot) {
    return { error: resolved.error ?? "Could not load this destination" };
  }

  return { snapshot: resolved.snapshot };
}
