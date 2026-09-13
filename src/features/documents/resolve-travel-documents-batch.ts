import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { createActivityTypeLabelResolver } from "@/features/itinerary/activity-types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { createTransportTypeSingularLabelResolver } from "@/features/transport/transport-types";
import type { TransportRecord } from "@/features/transport/types";
import type { TravelDocumentRecord } from "@/models/TravelDocument";
import { createTravelDocumentCategoryLabelResolver } from "./document-labels";
import {
  TRAVEL_DOCUMENT_CONTENT_TYPE_LABELS,
  getTravelDocumentDetailPath,
  getTravelDocumentFilePath,
  isImageContentType,
  isPdfContentType,
  type TravelDocumentContentType,
} from "./constants";
import type {
  ResolvedTravelDocumentViewModel,
  TravelDocumentContextLink,
} from "./types";

type TravelDocumentBatchLabels = {
  getCategoryLabel: ReturnType<typeof createTravelDocumentCategoryLabelResolver>;
  getActivityTypeLabel: ReturnType<typeof createActivityTypeLabelResolver>;
  getTransportTypeLabel: ReturnType<typeof createTransportTypeSingularLabelResolver>;
  fileFallbackLabel: string;
};

function optionalString(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

function formatCreatedAtLabel(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFileTypeLabel(contentType: string, fileFallbackLabel: string): string {
  if (contentType in TRAVEL_DOCUMENT_CONTENT_TYPE_LABELS) {
    return TRAVEL_DOCUMENT_CONTENT_TYPE_LABELS[
      contentType as TravelDocumentContentType
    ];
  }
  return fileFallbackLabel;
}

function resolveContextLink(
  document: TravelDocumentRecord,
  activityById: ReadonlyMap<string, ActivityViewModel>,
  accommodationById: ReadonlyMap<string, AccommodationViewModel>,
  transportById: ReadonlyMap<string, TransportRecord>,
  labels: TravelDocumentBatchLabels,
): {
  link?: TravelDocumentContextLink;
  sortDate?: string;
  transportDepartureDate?: string;
  accommodationCheckIn?: string;
  accommodationCheckOut?: string;
} {
  if (document.activityId) {
    const activity = activityById.get(document.activityId.toString());
    if (!activity) {
      return {};
    }
    return {
      sortDate: activity.date,
      link: {
        type: "activity",
        activityId: activity.id,
        title: activity.title,
        date: activity.date,
        activityType: labels.getActivityTypeLabel(activity.type),
      },
    };
  }

  if (document.accommodationId) {
    const accommodation = accommodationById.get(document.accommodationId.toString());
    if (!accommodation) {
      return {};
    }
    return {
      sortDate: accommodation.checkInDate,
      accommodationCheckIn: accommodation.checkInDate,
      accommodationCheckOut: accommodation.checkOutDate,
      link: {
        type: "accommodation",
        accommodationId: accommodation.id,
        title: accommodation.name,
        subtitle: accommodation.city,
      },
    };
  }

  if (document.transportId) {
    const transport = transportById.get(document.transportId.toString());
    if (!transport) {
      return {};
    }
    return {
      sortDate: transport.departure.date,
      transportDepartureDate: transport.departure.date,
      link: {
        type: "transport",
        transportId: transport.id,
        title: `${transport.departure.locationName} → ${transport.arrival.locationName}`,
        subtitle: labels.getTransportTypeLabel(transport.type),
      },
    };
  }

  return {};
}

export function createTravelDocumentBatchLabels(
  tDocs: AppTranslator<"Documents">,
  tActivity: AppTranslator<"Activity">,
  tTransport: AppTranslator<"Transport">,
): TravelDocumentBatchLabels {
  return {
    getCategoryLabel: createTravelDocumentCategoryLabelResolver(tDocs),
    getActivityTypeLabel: createActivityTypeLabelResolver(tActivity),
    getTransportTypeLabel: createTransportTypeSingularLabelResolver(tTransport),
    fileFallbackLabel: tDocs("file"),
  };
}

export function resolveTravelDocumentsBatch(
  tripId: string,
  documents: readonly TravelDocumentRecord[],
  activityById: ReadonlyMap<string, ActivityViewModel>,
  accommodationById: ReadonlyMap<string, AccommodationViewModel>,
  transportById: ReadonlyMap<string, TransportRecord>,
  labels: TravelDocumentBatchLabels,
): ResolvedTravelDocumentViewModel[] {
  const viewModels: ResolvedTravelDocumentViewModel[] = [];

  for (const document of documents) {
    if (!document.file?.contentType) {
      continue;
    }

    const id = document._id.toString();
    const {
      link: contextLink,
      sortDate: contextSortDate,
      transportDepartureDate,
      accommodationCheckIn,
      accommodationCheckOut,
    } = resolveContextLink(document, activityById, accommodationById, transportById, labels);
    const contentType = document.file.contentType;
    const sortDate =
      contextSortDate ?? document.createdAt.toISOString().slice(0, 10);

    viewModels.push({
      id,
      tripId,
      category: document.category,
      categoryLabel: labels.getCategoryLabel(document.category),
      title: document.title,
      description: optionalString(document.description),
      fileContentType: contentType,
      fileTypeLabel: getFileTypeLabel(contentType, labels.fileFallbackLabel),
      isPdf: isPdfContentType(contentType),
      isImage: isImageContentType(contentType),
      fileHref: getTravelDocumentFilePath(tripId, id),
      downloadHref: `${getTravelDocumentFilePath(tripId, id)}?download=1`,
      detailHref: getTravelDocumentDetailPath(tripId, id),
      contextLink,
      createdAtLabel: formatCreatedAtLabel(document.createdAt),
      sortDate,
      showInEmergency: document.showInEmergency ?? false,
      transportDepartureDate,
      accommodationCheckIn,
      accommodationCheckOut,
    });
  }

  return viewModels.sort((a, b) => {
    const byDate = b.sortDate.localeCompare(a.sortDate);
    if (byDate !== 0) {
      return byDate;
    }
    return b.id.localeCompare(a.id);
  });
}

export type DocumentDayRelevanceInput = {
  contextLink?: TravelDocumentContextLink;
  transportDepartureDate?: string;
  accommodationCheckIn?: string;
  accommodationCheckOut?: string;
};

export function toDocumentDayRelevanceInput(
  document: ResolvedTravelDocumentViewModel,
): DocumentDayRelevanceInput {
  return {
    contextLink: document.contextLink,
    transportDepartureDate: document.transportDepartureDate,
    accommodationCheckIn: document.accommodationCheckIn,
    accommodationCheckOut: document.accommodationCheckOut,
  };
}
