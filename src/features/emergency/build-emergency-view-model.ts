import {
  buildAccommodationDetailHref,
  buildAccommodationTaxiHref,
} from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { buildLanguageCategoryHref, buildLanguagePhraseHref } from "@/features/language/constants";
import { getPhraseFromDefaultPack } from "@/features/language/builtin/registry";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getTripPhase } from "@/features/trips/trip-phase";
import { selectContextualAccommodation } from "@/features/travel-hub/select-contextual-accommodation";
import {
  CURATED_EMERGENCY_PHRASE_IDS,
  DEFAULT_EMERGENCY_PACK_ID,
  EMERGENCY_CUSTOM_CATEGORY_LABELS,
} from "./constants";
import { getDefaultEmergencyPack } from "./builtin/registry";
import { buildEmergencyResourceActions } from "./resource-actions";
import type {
  BuiltInEmergencyResourceViewModel,
  EmergencyDocumentViewModel,
  EmergencyPageViewModel,
  TripEmergencyResourceViewModel,
} from "./types";
import type { TripEmergencyResourceDocument } from "@/models/TripEmergencyResource";

function toBuiltInViewModel(
  resource: ReturnType<typeof getDefaultEmergencyPack>["resources"][number],
): BuiltInEmergencyResourceViewModel {
  return {
    ...resource,
    actions: buildEmergencyResourceActions({
      phone: resource.phone,
      secondaryPhone: resource.secondaryPhone,
      internationalPhone: resource.internationalPhone,
      email: resource.email,
      address: resource.address,
      url: resource.url,
    }),
  };
}

function toCustomResourceViewModel(
  resource: TripEmergencyResourceDocument,
): TripEmergencyResourceViewModel {
  const tripId = resource.tripId.toString();
  return {
    id: resource._id.toString(),
    tripId,
    category: resource.category,
    categoryLabel: EMERGENCY_CUSTOM_CATEGORY_LABELS[resource.category],
    title: resource.title,
    phone: resource.phone ?? undefined,
    secondaryPhone: resource.secondaryPhone ?? undefined,
    email: resource.email ?? undefined,
    address: resource.address ?? undefined,
    url: resource.url ?? undefined,
    reference: resource.reference ?? undefined,
    notes: resource.notes ?? undefined,
    createdBy: resource.createdBy.toString(),
    actions: buildEmergencyResourceActions({
      phone: resource.phone ?? undefined,
      secondaryPhone: resource.secondaryPhone ?? undefined,
      email: resource.email ?? undefined,
      address: resource.address ?? undefined,
      url: resource.url ?? undefined,
      reference: resource.reference ?? undefined,
    }),
  };
}

type BuildEmergencyViewModelInput = {
  tripId: string;
  startDate: string;
  endDate: string;
  accommodations: readonly AccommodationViewModel[];
  customResources: readonly TripEmergencyResourceDocument[];
  emergencyDocuments: readonly EmergencyDocumentViewModel[];
  todayJapan?: string;
};

export function buildEmergencyViewModel({
  tripId,
  startDate,
  endDate,
  accommodations,
  customResources,
  emergencyDocuments,
  todayJapan = getJapanCalendarDate(),
}: BuildEmergencyViewModelInput): EmergencyPageViewModel {
  const pack = getDefaultEmergencyPack();
  const builtIn = pack.resources.map(toBuiltInViewModel);
  const urgentResources = builtIn.filter((resource) =>
    ["police", "ambulance_fire"].includes(resource.kind),
  );
  const assistanceResources = builtIn.filter((resource) =>
    ["tourist_hotline", "embassy_consular", "other_official"].includes(resource.kind),
  );

  const tripPhase = getTripPhase(startDate, endDate, todayJapan);
  const contextual = selectContextualAccommodation(accommodations, tripPhase, todayJapan);
  const currentAccommodation =
    contextual?.variant === "current"
      ? {
          id: contextual.accommodation.id,
          name: contextual.accommodation.name,
          city: contextual.accommodation.city,
          address:
            contextual.accommodation.addressJapanese ??
            contextual.accommodation.addressEnglish,
          detailHref: buildAccommodationDetailHref(tripId, contextual.accommodation.id),
          taxiHref: buildAccommodationTaxiHref(tripId, contextual.accommodation.id),
          mapsHref: contextual.accommodation.googleMapsUrl,
        }
      : null;

  const phraseLinks = CURATED_EMERGENCY_PHRASE_IDS.flatMap((phraseId) => {
    const phrase = getPhraseFromDefaultPack(phraseId);
    if (!phrase) {
      return [];
    }
    return [
      {
        id: phrase.id,
        sourceText: phrase.sourceText,
        detailHref: buildLanguagePhraseHref(tripId, phrase.id),
      },
    ];
  });

  return {
    tripId,
    packId: DEFAULT_EMERGENCY_PACK_ID,
    urgentResources,
    assistanceResources,
    currentAccommodation,
    documents: [...emergencyDocuments],
    customResources: customResources.map(toCustomResourceViewModel),
    phraseLinks,
    allEmergencyPhrasesHref: buildLanguageCategoryHref(tripId, "emergency"),
    categoryLabels: EMERGENCY_CUSTOM_CATEGORY_LABELS,
  };
}
