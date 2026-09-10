import { ACTIVITY_TYPE_LABELS } from "@/features/itinerary/activity-types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { TRANSPORT_TYPE_SINGULAR_LABELS } from "@/features/transport/transport-types";
import type { TransportRecord } from "@/features/transport/types";
import type { TravelDocumentRecord } from "@/models/TravelDocument";
import {
  TRAVEL_DOCUMENT_CATEGORY_LABELS,
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

function getFileTypeLabel(contentType: string): string {
  if (contentType in TRAVEL_DOCUMENT_CONTENT_TYPE_LABELS) {
    return TRAVEL_DOCUMENT_CONTENT_TYPE_LABELS[
      contentType as TravelDocumentContentType
    ];
  }
  return "קובץ";
}

function resolveContextLink(
  document: TravelDocumentRecord,
  activityById: ReadonlyMap<string, ActivityViewModel>,
  accommodationById: ReadonlyMap<string, AccommodationViewModel>,
  transportById: ReadonlyMap<string, TransportRecord>,
): { link?: TravelDocumentContextLink; sortDate?: string; transportDepartureDate?: string; accommodationCheckIn?: string; accommodationCheckOut?: string } {
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
        activityType: ACTIVITY_TYPE_LABELS[activity.type],
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
        subtitle: TRANSPORT_TYPE_SINGULAR_LABELS[transport.type],
      },
    };
  }

  return {};
}

export function resolveTravelDocumentsBatch(
  tripId: string,
  documents: readonly TravelDocumentRecord[],
  activityById: ReadonlyMap<string, ActivityViewModel>,
  accommodationById: ReadonlyMap<string, AccommodationViewModel>,
  transportById: ReadonlyMap<string, TransportRecord>,
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
    } = resolveContextLink(document, activityById, accommodationById, transportById);
    const contentType = document.file.contentType;
    const sortDate =
      contextSortDate ?? document.createdAt.toISOString().slice(0, 10);

    viewModels.push({
      id,
      tripId,
      category: document.category,
      categoryLabel: TRAVEL_DOCUMENT_CATEGORY_LABELS[document.category],
      title: document.title,
      description: optionalString(document.description),
      fileContentType: contentType,
      fileTypeLabel: getFileTypeLabel(contentType),
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
