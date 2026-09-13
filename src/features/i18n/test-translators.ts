import { createAppTranslator } from "./create-app-translator";
import type { TripHomeTranslations } from "@/features/trip-home/build-trip-home-view-model";

export function createHebrewHomeTranslations(): TripHomeTranslations {
  return {
    tHome: createAppTranslator("Home", "he"),
    tCommon: createAppTranslator("Common", "he"),
  };
}

export function createHebrewItineraryTranslator() {
  return createAppTranslator("Itinerary", "he");
}

export function createHebrewCommonTranslator() {
  return createAppTranslator("Common", "he");
}

export function createHebrewActivityTranslator() {
  return createAppTranslator("Activity", "he");
}

export function createHebrewTransportTranslator() {
  return createAppTranslator("Transport", "he");
}

export function createHebrewTravelHubTranslators() {
  return {
    t: createAppTranslator("TravelHub", "he"),
    tLists: createAppTranslator("Lists", "he"),
  };
}

export function createHebrewDocumentsTranslator() {
  return createAppTranslator("Documents", "he");
}

export function createHebrewWeatherTranslator() {
  return createAppTranslator("Weather", "he");
}

export function createHebrewLanguageTranslator() {
  return createAppTranslator("Language", "he");
}

export function createHebrewListsTranslator() {
  return createAppTranslator("Lists", "he");
}
