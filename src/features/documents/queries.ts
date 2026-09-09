import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { Accommodation } from "@/models/Accommodation";
import { TravelDocument } from "@/models/TravelDocument";
import { resolveAccommodationIdentity } from "@/features/accommodations/resolve-accommodation-identity";
import { ACTIVITY_TYPE_LABELS } from "@/features/itinerary/activity-types";
import { TRANSPORT_TYPE_SINGULAR_LABELS } from "@/features/transport/transport-types";
import type { TransportLinkedDocumentViewModel } from "@/features/transport/types";
import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";
import {
  TRAVEL_DOCUMENT_CATEGORY_LABELS,
  TRAVEL_DOCUMENT_CONTENT_TYPE_LABELS,
  getTravelDocumentDetailPath,
  getTravelDocumentFilePath,
  isImageContentType,
  isPdfContentType,
  type TravelDocumentContentType,
} from "./constants";
import type { TravelDocumentRecord } from "@/models/TravelDocument";
import type {
  AccommodationLinkOption,
  ActivityLinkOption,
  TransportLinkOption,
  TravelDocumentContextLink,
  TravelDocumentViewModel,
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

async function resolveContextLink(
  tripId: string,
  document: TravelDocumentRecord,
): Promise<{ link?: TravelDocumentContextLink; sortDate?: string }> {
  if (document.activityId) {
    const activity = await Activity.findOne({
      _id: document.activityId.toString(),
      tripId,
    }).lean();

    if (!activity) {
      return {};
    }

    return {
      sortDate: activity.date,
      link: {
        type: "activity",
        activityId: activity._id.toString(),
        title: activity.title,
        date: activity.date,
        activityType: ACTIVITY_TYPE_LABELS[activity.type],
      },
    };
  }

  if (document.accommodationId) {
    const accommodation = await Accommodation.findOne({
      _id: document.accommodationId.toString(),
      tripId,
    }).lean();

    if (!accommodation) {
      return {};
    }

    const identity = await resolveAccommodationIdentity(accommodation);

    return {
      sortDate: accommodation.checkInDate,
      link: {
        type: "accommodation",
        accommodationId: accommodation._id.toString(),
        title: identity.name,
        subtitle: identity.city,
      },
    };
  }

  if (document.transportId) {
    const { Transport } = await import("@/models/Transport");
    const transport = await Transport.findOne({
      _id: document.transportId.toString(),
      tripId,
    }).lean();

    if (!transport) {
      return {};
    }

    return {
      sortDate: transport.departure.date,
      link: {
        type: "transport",
        transportId: transport._id.toString(),
        title: `${transport.departure.locationName} → ${transport.arrival.locationName}`,
        subtitle: TRANSPORT_TYPE_SINGULAR_LABELS[transport.type],
      },
    };
  }

  return {};
}

async function toTravelDocumentViewModel(
  document: TravelDocumentRecord,
): Promise<TravelDocumentViewModel | null> {
  if (!document.file?.contentType) {
    return null;
  }

  const tripId = document.tripId.toString();
  const id = document._id.toString();
  const { link: contextLink, sortDate: contextSortDate } = await resolveContextLink(
    tripId,
    document,
  );
  const contentType = document.file.contentType;
  const sortDate =
    contextSortDate ?? document.createdAt.toISOString().slice(0, 10);

  return {
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
  };
}

export async function listEmergencyDocumentsForTrip(tripId: string) {
  await connectDb();
  const documents = await TravelDocument.find({ tripId, showInEmergency: true })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  const viewModels = (
    await Promise.all(
      documents.map((document) => toTravelDocumentViewModel(document)),
    )
  ).filter((document): document is TravelDocumentViewModel => document !== null);

  return viewModels.map((document) => ({
    id: document.id,
    title: document.title,
    categoryLabel: document.categoryLabel,
    detailHref: document.detailHref,
    fileHref: document.fileHref,
  }));
}

export async function listTravelDocumentsForTrip(
  tripId: string,
): Promise<TravelDocumentViewModel[]> {
  await connectDb();
  const documents = await TravelDocument.find({ tripId })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  const viewModels = (
    await Promise.all(
      documents.map((document) => toTravelDocumentViewModel(document)),
    )
  ).filter((document): document is TravelDocumentViewModel => document !== null);

  return viewModels.sort((a, b) => {
    const byDate = b.sortDate.localeCompare(a.sortDate);
    if (byDate !== 0) {
      return byDate;
    }
    return b.id.localeCompare(a.id);
  });
}

export async function getTravelDocumentForTrip(
  tripId: string,
  documentId: string,
): Promise<TravelDocumentViewModel | null> {
  await connectDb();
  const document = await TravelDocument.findOne({
    _id: documentId,
    tripId,
  }).lean();

  if (!document) {
    return null;
  }

  return toTravelDocumentViewModel(document);
}

export async function listActivityLinkOptions(
  tripId: string,
): Promise<ActivityLinkOption[]> {
  await connectDb();
  const activities = await Activity.find({ tripId })
    .sort({ date: 1, order: 1, createdAt: 1, _id: 1 })
    .lean();

  return activities.map((activity) => ({
    id: activity._id.toString(),
    date: activity.date,
    label: `${formatCalendarDateDisplay(activity.date)} · ${activity.title}`,
  }));
}

export async function listAccommodationLinkOptions(
  tripId: string,
): Promise<AccommodationLinkOption[]> {
  await connectDb();
  const accommodations = await Accommodation.find({ tripId })
    .sort({ checkInDate: 1, _id: 1 })
    .lean();

  const options = await Promise.all(
    accommodations.map(async (accommodation) => {
      const identity = await resolveAccommodationIdentity(accommodation);
      return {
        id: accommodation._id.toString(),
        label: `${identity.name} · ${formatCalendarDateDisplay(accommodation.checkInDate)}`,
      };
    }),
  );

  return options;
}

export async function listTransportLinkOptions(
  tripId: string,
): Promise<TransportLinkOption[]> {
  const { listTransportLinkOptions: listOptions } = await import(
    "@/features/transport/queries"
  );
  return listOptions(tripId);
}

export async function listTravelDocumentsLinkedToTransport(
  tripId: string,
  transportId: string,
): Promise<TransportLinkedDocumentViewModel[]> {
  await connectDb();
  const documents = await TravelDocument.find({ tripId, transportId })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  const linked: TransportLinkedDocumentViewModel[] = [];

  for (const document of documents) {
    const viewModel = await toTravelDocumentViewModel(document);
    if (!viewModel) {
      continue;
    }

    linked.push({
      id: viewModel.id,
      title: viewModel.title,
      categoryLabel: viewModel.categoryLabel,
      href: viewModel.detailHref,
    });
  }

  return linked;
}
