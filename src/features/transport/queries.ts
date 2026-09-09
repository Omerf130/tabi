import "server-only";

import { isDateWithinTrip } from "@/features/trips/trip-days";
import { connectDb } from "@/lib/db/connect";
import { Transport } from "@/models/Transport";
import { TRANSPORT_TYPES, type TransportType } from "./transport-types";
import {
  toTransportCardViewModel,
  toTransportDetailViewModel,
  toTransportItineraryItemViewModel,
  toTransportRecord,
} from "./to-transport-view-model";
import type {
  TransportCardViewModel,
  TransportDetailViewModel,
  TransportItineraryItemViewModel,
  TransportRecord,
} from "./types";

export async function listTransportsForTrip(tripId: string): Promise<TransportRecord[]> {
  await connectDb();
  const documents = await Transport.find({ tripId })
    .sort({
      type: 1,
      "departure.date": 1,
      "departure.time": 1,
      createdAt: 1,
      _id: 1,
    })
    .lean();

  return documents.map(toTransportRecord);
}

export async function getTransportForTrip(
  tripId: string,
  transportId: string,
): Promise<TransportRecord | null> {
  await connectDb();
  const document = await Transport.findOne({ _id: transportId, tripId }).lean();
  return document ? toTransportRecord(document) : null;
}

export async function listTransportCardsForTrip(
  tripId: string,
): Promise<Record<TransportType, TransportCardViewModel[]>> {
  const records = await listTransportsForTrip(tripId);
  const grouped = Object.fromEntries(
    TRANSPORT_TYPES.map((type) => [type, [] as TransportCardViewModel[]]),
  ) as Record<TransportType, TransportCardViewModel[]>;

  for (const record of records) {
    grouped[record.type].push(toTransportCardViewModel(tripId, record));
  }

  return grouped;
}

export async function listTransportsForItineraryDay(
  tripId: string,
  date: string,
  tripStartDate: string,
  tripEndDate: string,
): Promise<TransportItineraryItemViewModel[]> {
  if (!isDateWithinTrip(tripStartDate, tripEndDate, date)) {
    return [];
  }

  await connectDb();
  const documents = await Transport.find({
    tripId,
    "departure.date": date,
  })
    .sort({ "departure.time": 1, createdAt: 1, _id: 1 })
    .lean();

  return documents
    .map(toTransportRecord)
    .map((record) => toTransportItineraryItemViewModel(tripId, record));
}

export async function listTransportsForItineraryTrip(
  tripId: string,
  tripStartDate: string,
  tripEndDate: string,
): Promise<Map<string, TransportItineraryItemViewModel[]>> {
  await connectDb();
  const documents = await Transport.find({
    tripId,
    "departure.date": { $gte: tripStartDate, $lte: tripEndDate },
  })
    .sort({ "departure.date": 1, "departure.time": 1, createdAt: 1, _id: 1 })
    .lean();

  const grouped = new Map<string, TransportItineraryItemViewModel[]>();

  for (const document of documents) {
    const record = toTransportRecord(document);
    const item = toTransportItineraryItemViewModel(tripId, record);
    const existing = grouped.get(record.departure.date) ?? [];
    existing.push(item);
    grouped.set(record.departure.date, existing);
  }

  return grouped;
}

export async function getTransportDetailViewModel(
  tripId: string,
  transportId: string,
  linkedDocuments: TransportDetailViewModel["linkedDocuments"] = [],
): Promise<TransportDetailViewModel | null> {
  const record = await getTransportForTrip(tripId, transportId);
  if (!record) {
    return null;
  }

  return toTransportDetailViewModel(tripId, record, linkedDocuments);
}

export async function listTransportLinkOptions(tripId: string): Promise<
  Array<{
    id: string;
    type: TransportType;
    label: string;
    departureDate: string;
  }>
> {
  const records = await listTransportsForTrip(tripId);
  return records.map((record) => ({
    id: record.id,
    type: record.type,
    label: `${record.departure.locationName} → ${record.arrival.locationName}`,
    departureDate: record.departure.date,
  }));
}
