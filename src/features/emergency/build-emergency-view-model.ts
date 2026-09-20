import {
  buildAccommodationDetailHref,
  buildAccommodationTaxiHref,
} from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { buildLanguageCategoryHref, buildLanguagePhraseHref } from "@/features/language/constants";
import { resolvePhraseIntentMessageKey } from "@/features/language/phrase-intent-message-key";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { getCalendarDateInTimeZone } from "@/features/trips/destination/trip-local-calendar";
import { getTripPhase } from "@/features/trips/trip-phase";
import { selectContextualAccommodation } from "@/features/travel-hub/select-contextual-accommodation";
import { buildTripDetailsSettingsHref } from "@/features/settings/constants";
import { CURATED_EMERGENCY_PHRASE_IDS } from "./constants";
import { createEmergencyCategoryLabelResolver } from "./emergency-labels";
import { resolveCountryEmergencyServices } from "./resolve-country-emergency-services";
import {
  buildEmergencyResourceActions,
  type EmergencyResourceActionLabels,
} from "./resource-actions";
import {
  EMERGENCY_CUSTOM_CATEGORIES,
  type EmergencyCustomCategory,
  type EmergencyPageViewModel,
  type EmergencyVerifiedViewModel,
  type VerifiedEmergencyServiceViewModel,
} from "./types";
import type { TripEmergencyResourceDocument } from "@/models/TripEmergencyResource";
import { buildAccommodationNavigationHref } from "@/lib/maps/navigation-entities";
import type { PreferredMapsApp } from "@/lib/maps/maps-app";

function buildCategoryLabels(
  t: AppTranslator<"Emergency">,
): Record<EmergencyCustomCategory, string> {
  const resolve = createEmergencyCategoryLabelResolver(t);
  return Object.fromEntries(
    EMERGENCY_CUSTOM_CATEGORIES.map((category) => [category, resolve(category)]),
  ) as Record<EmergencyCustomCategory, string>;
}

function buildVerifiedViewModel(input: {
  countryCode: string | null | undefined;
  actionLabels: EmergencyResourceActionLabels;
  preferredMapsApp?: PreferredMapsApp;
}): EmergencyVerifiedViewModel {
  const resolution = resolveCountryEmergencyServices(input.countryCode);
  if (resolution.status !== "ready") {
    return resolution;
  }

  const services: VerifiedEmergencyServiceViewModel[] = resolution.record.services.map(
    (service) => ({
      id: service.id,
      category: service.category,
      phone: service.phone,
      actions: buildEmergencyResourceActions(
        { phone: service.phone },
        input.actionLabels,
        input.preferredMapsApp,
      ),
    }),
  );

  return {
    status: "ready",
    countryCode: resolution.countryCode,
    services,
    source: {
      sourceId: resolution.manifest.sourceId,
      sourceRevision: resolution.manifest.sourceRevision,
      datasetImportedAt: resolution.manifest.datasetImportedAt,
      gitCommit: resolution.manifest.gitCommit,
    },
  };
}

function toCustomResourceViewModel(
  resource: TripEmergencyResourceDocument,
  resolveCategoryLabel: ReturnType<typeof createEmergencyCategoryLabelResolver>,
  actionLabels: EmergencyResourceActionLabels,
  preferredMapsApp: PreferredMapsApp,
) {
  const tripId = resource.tripId.toString();
  return {
    id: resource._id.toString(),
    tripId,
    category: resource.category,
    categoryLabel: resolveCategoryLabel(resource.category),
    title: resource.title,
    phone: resource.phone ?? undefined,
    secondaryPhone: resource.secondaryPhone ?? undefined,
    email: resource.email ?? undefined,
    address: resource.address ?? undefined,
    url: resource.url ?? undefined,
    reference: resource.reference ?? undefined,
    notes: resource.notes ?? undefined,
    createdBy: resource.createdBy.toString(),
    actions: buildEmergencyResourceActions(
      {
        phone: resource.phone ?? undefined,
        secondaryPhone: resource.secondaryPhone ?? undefined,
        email: resource.email ?? undefined,
        address: resource.address ?? undefined,
        url: resource.url ?? undefined,
        reference: resource.reference ?? undefined,
      },
      actionLabels,
      preferredMapsApp,
    ),
  };
}

type BuildEmergencyViewModelInput = {
  tripId: string;
  destinationCountryCode: string | null | undefined;
  startDate: string;
  endDate: string;
  accommodations: readonly AccommodationViewModel[];
  customResources: readonly TripEmergencyResourceDocument[];
  emergencyDocuments: EmergencyPageViewModel["documents"];
  destinationCalendarTimeZone: string;
  todayTripLocal?: string;
  preferredMapsApp?: PreferredMapsApp;
  t: AppTranslator<"Emergency">;
  tLanguage: AppTranslator<"Language">;
};

export function buildEmergencyViewModel({
  tripId,
  destinationCountryCode,
  startDate,
  endDate,
  accommodations,
  customResources,
  emergencyDocuments,
  destinationCalendarTimeZone,
  todayTripLocal: todayTripLocalOverride,
  preferredMapsApp,
  t,
  tLanguage,
}: BuildEmergencyViewModelInput): EmergencyPageViewModel {
  const todayTripLocal =
    todayTripLocalOverride ??
    getCalendarDateInTimeZone(destinationCalendarTimeZone);
  const actionLabels: EmergencyResourceActionLabels = {
    openWebsite: t("openWebsite"),
    openInMap: t("openInMap"),
    copyReference: t("copyReference"),
  };

  const verified = buildVerifiedViewModel({
    countryCode: destinationCountryCode,
    actionLabels,
    preferredMapsApp,
  });

  const tripPhase = getTripPhase(startDate, endDate, todayTripLocal);
  const contextual = selectContextualAccommodation(
    accommodations,
    tripPhase,
    todayTripLocal,
  );
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
          mapsHref:
            buildAccommodationNavigationHref(
              contextual.accommodation,
              preferredMapsApp,
            ) ?? undefined,
        }
      : null;

  const phraseLinks = CURATED_EMERGENCY_PHRASE_IDS.flatMap((phraseId) => {
    const messageKey = resolvePhraseIntentMessageKey(phraseId);
    const sourceText = tLanguage(
      messageKey as Parameters<AppTranslator<"Language">>[0],
    );
    return [
      {
        id: phraseId,
        sourceText,
        detailHref: buildLanguagePhraseHref(tripId, phraseId),
      },
    ];
  });

  const resolveCategoryLabel = createEmergencyCategoryLabelResolver(t);

  return {
    tripId,
    verified,
    tripDetailsHref: buildTripDetailsSettingsHref(tripId),
    currentAccommodation,
    documents: [...emergencyDocuments],
    customResources: customResources.map((resource) =>
      toCustomResourceViewModel(
        resource,
        resolveCategoryLabel,
        actionLabels,
        preferredMapsApp,
      ),
    ),
    phraseLinks,
    allEmergencyPhrasesHref: buildLanguageCategoryHref(tripId, "emergency"),
    categoryLabels: buildCategoryLabels(t),
  };
}
