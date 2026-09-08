import "server-only";

import {
  PLACES_AUTOCOMPLETE_FIELD_MASK,
  PLACES_AUTOCOMPLETE_MAX_SUGGESTIONS,
  PLACES_DETAILS_FIELD_MASK,
  PLACES_DISPLAY_LANGUAGE_CODE,
  PLACES_INCLUDED_REGION_CODES,
  PLACES_LODGING_PRIMARY_TYPES,
  PLACES_MESSAGES,
  PLACES_SEARCH_LANGUAGE_CODE,
} from "./constants";
import {
  extractCityFromAddressComponents,
  extractCityFromSecondaryText,
} from "./extractCity";
import {
  getCachedPlaceDisplay,
  setCachedPlaceDisplay,
} from "./placeDisplayCache";
import type {
  PlaceDisplaySnapshot,
  PlacePrimaryTypes,
  PlaceSuggestion,
  ResolvedPlacePreview,
} from "./types";

export class GooglePlacesConfigError extends Error {
  constructor() {
    super(PLACES_MESSAGES.missingApiKey);
    this.name = "GooglePlacesConfigError";
  }
}

export class GooglePlacesRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GooglePlacesRequestError";
  }
}

function getGooglePlacesApiKey(): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    throw new GooglePlacesConfigError();
  }
  return apiKey;
}

type GoogleTextField = {
  text?: string;
};

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePlaceDetailsResponse = {
  id?: string;
  displayName?: GoogleTextField;
  formattedAddress?: string;
  googleMapsUri?: string;
  addressComponents?: GoogleAddressComponent[];
};

type GoogleAutocompletePrediction = {
  placeId?: string;
  text?: GoogleTextField;
  structuredFormat?: {
    mainText?: GoogleTextField;
    secondaryText?: GoogleTextField;
  };
};

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: GoogleAutocompletePrediction;
  }>;
};

function normalizePlaceId(rawId: string | undefined): string | undefined {
  if (!rawId?.trim()) {
    return undefined;
  }
  return rawId.startsWith("places/") ? rawId.slice("places/".length) : rawId;
}

async function fetchPlaceDetails(
  placeId: string,
  options: { sessionToken?: string; languageCode?: string } = {},
): Promise<GooglePlaceDetailsResponse> {
  const apiKey = getGooglePlacesApiKey();
  const encodedPlaceId = encodeURIComponent(placeId);
  const url = new URL(
    `https://places.googleapis.com/v1/places/${encodedPlaceId}`,
  );
  if (options.sessionToken) {
    url.searchParams.set("sessionToken", options.sessionToken);
  }
  url.searchParams.set(
    "languageCode",
    options.languageCode ?? PLACES_DISPLAY_LANGUAGE_CODE,
  );

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACES_DETAILS_FIELD_MASK,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GooglePlacesRequestError(PLACES_MESSAGES.resolveFailed);
  }

  return (await response.json()) as GooglePlaceDetailsResponse;
}

export async function autocompletePlaces(input: {
  query: string;
  sessionToken: string;
  includedPrimaryTypes?: PlacePrimaryTypes;
}): Promise<PlaceSuggestion[]> {
  const apiKey = getGooglePlacesApiKey();

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACES_AUTOCOMPLETE_FIELD_MASK,
    },
    body: JSON.stringify({
      input: input.query,
      sessionToken: input.sessionToken,
      includedRegionCodes: [...PLACES_INCLUDED_REGION_CODES],
      includedPrimaryTypes: [...(input.includedPrimaryTypes ?? PLACES_LODGING_PRIMARY_TYPES)],
      languageCode: PLACES_SEARCH_LANGUAGE_CODE,
      includeQueryPredictions: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GooglePlacesRequestError(PLACES_MESSAGES.autocompleteFailed);
  }

  const payload = (await response.json()) as GoogleAutocompleteResponse;
  const suggestions: PlaceSuggestion[] = [];

  for (const item of payload.suggestions ?? []) {
    const prediction = item.placePrediction;
    const placeId = normalizePlaceId(prediction?.placeId);
    if (!placeId) {
      continue;
    }

    const primaryText =
      prediction?.structuredFormat?.mainText?.text?.trim() ||
      prediction?.text?.text?.trim();
    if (!primaryText) {
      continue;
    }

    const secondaryText =
      prediction?.structuredFormat?.secondaryText?.text?.trim() || undefined;

    suggestions.push({ placeId, primaryText, secondaryText });
    if (suggestions.length >= PLACES_AUTOCOMPLETE_MAX_SUGGESTIONS) {
      break;
    }
  }

  return suggestions;
}

/** Terminates the autocomplete session with one Place Details request. */
export async function resolveSelectedPlace(input: {
  placeId: string;
  sessionToken: string;
  primaryText: string;
  secondaryText?: string;
}): Promise<ResolvedPlacePreview> {
  const details = await fetchPlaceDetails(input.placeId, {
    sessionToken: input.sessionToken,
    languageCode: PLACES_DISPLAY_LANGUAGE_CODE,
  });

  const displayNameJapanese = details.displayName?.text?.trim();
  const formattedAddressJapanese = details.formattedAddress?.trim();
  const city =
    extractCityFromAddressComponents(details.addressComponents) ||
    extractCityFromSecondaryText(input.secondaryText);

  return {
    placeId: input.placeId,
    primaryText: input.primaryText,
    secondaryText: input.secondaryText,
    displayNameJapanese,
    formattedAddressJapanese,
    city,
    googleMapsUrl: details.googleMapsUri?.trim() || undefined,
  };
}

export async function getPlaceDisplaySnapshot(
  placeId: string,
  options: {
    fallbackPrimaryText?: string;
    fallbackSecondaryText?: string;
    languageCode?: string;
  } = {},
): Promise<PlaceDisplaySnapshot | null> {
  const languageCode = options.languageCode ?? PLACES_SEARCH_LANGUAGE_CODE;
  const cached = getCachedPlaceDisplay(placeId, languageCode);
  if (cached) {
    return cached;
  }

  try {
    const details = await fetchPlaceDetails(placeId, { languageCode });
    const name =
      details.displayName?.text?.trim() ||
      options.fallbackPrimaryText?.trim() ||
      "מקום לינה";
    const city =
      extractCityFromAddressComponents(details.addressComponents) ||
      extractCityFromSecondaryText(options.fallbackSecondaryText) ||
      "Japan";
    const formattedAddress = details.formattedAddress?.trim();

    const snapshot: PlaceDisplaySnapshot = {
      placeId,
      name,
      nameJapanese:
        languageCode === PLACES_DISPLAY_LANGUAGE_CODE
          ? details.displayName?.text?.trim()
          : undefined,
      city,
      addressEnglish:
        languageCode === PLACES_SEARCH_LANGUAGE_CODE ? formattedAddress : undefined,
      addressJapanese:
        languageCode === PLACES_DISPLAY_LANGUAGE_CODE ? formattedAddress : undefined,
      googleMapsUrl: details.googleMapsUri?.trim() || undefined,
    };

    setCachedPlaceDisplay(placeId, languageCode, snapshot);
    return snapshot;
  } catch {
    return null;
  }
}

export async function getPlaceDisplayForTraveler(
  placeId: string,
): Promise<PlaceDisplaySnapshot | null> {
  const english = await getPlaceDisplaySnapshot(placeId, {
    languageCode: PLACES_SEARCH_LANGUAGE_CODE,
  });
  const japanese = await getPlaceDisplaySnapshot(placeId, {
    languageCode: PLACES_DISPLAY_LANGUAGE_CODE,
  });

  if (!english && !japanese) {
    return null;
  }

  return {
    placeId,
    name: english?.name ?? japanese?.name ?? "מקום לינה",
    nameJapanese: japanese?.name,
    city: english?.city ?? japanese?.city ?? "Japan",
    addressEnglish: english?.addressEnglish,
    addressJapanese: japanese?.addressJapanese,
    googleMapsUrl: english?.googleMapsUrl ?? japanese?.googleMapsUrl,
  };
}

export function getGooglePlacesApiKeyForTests(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY?.trim();
}
