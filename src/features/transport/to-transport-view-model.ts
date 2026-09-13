import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";

import type { AppTranslator } from "@/features/i18n/create-app-translator";

import { buildTransportListTitle } from "./build-transport-list-title";

import {

  buildTransportDetailHref,

  buildTransportHref,

} from "./constants";

import { resolveTransportVisualSrc } from "./resolve-transport-visual-src";

import { formatTransportTimeRangeLabel } from "./transport-datetime";

import { createTransportTimezoneLabelResolver } from "./timezone-options";

import {

  createTrainCategoryLabelResolver,

  createTransportTypeLabelResolver,

  createTransportTypeSingularLabelResolver,

  type TrainCategory,

  type TransportType,

} from "./transport-types";

import type {

  FlatTransportDetails,

  TransportCardViewModel,

  TransportDetailViewModel,

  TransportItineraryItemViewModel,

  TransportLinkedDocumentViewModel,

  TransportRecord,

} from "./types";

import type { TransportDocumentRecord } from "@/models/Transport";



function buildRouteLabel(

  departureName: string,

  arrivalName: string,

  departureCode?: string | null,

  arrivalCode?: string | null,

): string {

  const from = departureCode?.trim()

    ? `${departureName} (${departureCode.trim()})`

    : departureName;

  const to = arrivalCode?.trim()

    ? `${arrivalName} (${arrivalCode.trim()})`

    : arrivalName;

  return `${from} → ${to}`;

}



function buildMetaLabel(

  type: TransportType,

  details: FlatTransportDetails,

  t: AppTranslator<"Transport">,

): string | undefined {

  const getTrainCategory = createTrainCategoryLabelResolver(t);



  if (type === "flight") {

    const parts = [details.airline, details.flightNumber].filter(Boolean);

    return parts.length > 0 ? parts.join(" · ") : undefined;

  }



  if (type === "train") {

    const category =

      details.trainCategory && getTrainCategory(details.trainCategory as TrainCategory)

        ? getTrainCategory(details.trainCategory as TrainCategory)

        : undefined;

    const service = [details.serviceName, details.trainNumber].filter(Boolean).join(" ");

    const parts = [category, service].filter(Boolean);

    return parts.length > 0 ? parts.join(" · ") : undefined;

  }



  const parts = [details.operator, details.serviceNumber].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : undefined;

}



export function toTransportRecord(document: TransportDocumentRecord): TransportRecord {

  const details = document.details ?? {};

  return {

    id: document._id.toString(),

    tripId: document.tripId.toString(),

    type: document.type,

    departure: {

      locationName: document.departure.locationName,

      locationCode: document.departure.locationCode ?? undefined,

      date: document.departure.date,

      time: document.departure.time,

      timezone: document.departure.timezone,

    },

    arrival: {

      locationName: document.arrival.locationName,

      locationCode: document.arrival.locationCode ?? undefined,

      date: document.arrival.date,

      time: document.arrival.time,

      timezone: document.arrival.timezone,

    },

    bookingReference: document.bookingReference ?? undefined,

    notes: document.notes ?? undefined,

    details: {

      airline: details.airline ?? undefined,

      flightNumber: details.flightNumber ?? undefined,

      departureTerminal: details.departureTerminal ?? undefined,

      arrivalTerminal: details.arrivalTerminal ?? undefined,

      gate: details.gate ?? undefined,

      seat: details.seat ?? undefined,

      trainCategory: details.trainCategory ?? undefined,

      serviceName: details.serviceName ?? undefined,

      trainNumber: details.trainNumber ?? undefined,

      carNumber: details.carNumber ?? undefined,

      seats: details.seats ?? undefined,

      operator: details.operator ?? undefined,

      serviceNumber: details.serviceNumber ?? undefined,

      vehicleOrServiceNotes: details.vehicleOrServiceNotes ?? undefined,

    },

    createdAt: document.createdAt.toISOString(),

  };

}



export function toTransportCardViewModel(

  tripId: string,

  record: TransportRecord,

  t: AppTranslator<"Transport">,

): TransportCardViewModel {

  const getTypeSingular = createTransportTypeSingularLabelResolver(t);



  return {

    id: record.id,

    type: record.type,

    typeLabel: getTypeSingular(record.type),

    routeLabel: buildRouteLabel(

      record.departure.locationName,

      record.arrival.locationName,

      record.departure.locationCode,

      record.arrival.locationCode,

    ),

    metaLabel: buildMetaLabel(record.type, record.details, t),

    dateLabel: formatCalendarDateDisplay(record.departure.date),

    timeRangeLabel: formatTransportTimeRangeLabel(record.departure, record.arrival),

    departureDate: record.departure.date,

    departureTime: record.departure.time,

    listTitle: buildTransportListTitle(record.type, record.arrival.locationName, t),

    visualSrc: resolveTransportVisualSrc(record.type),

    detailHref: buildTransportDetailHref(tripId, record.id),

    linkedCost: record.linkedCost,

  };

}



export function toTransportItineraryItemViewModel(

  tripId: string,

  record: TransportRecord,

  t: AppTranslator<"Transport">,

): TransportItineraryItemViewModel {

  const getTypeSingular = createTransportTypeSingularLabelResolver(t);



  return {

    id: record.id,

    type: record.type,

    typeLabel: getTypeSingular(record.type),

    routeLabel: buildRouteLabel(

      record.departure.locationName,

      record.arrival.locationName,

    ),

    metaLabel: buildMetaLabel(record.type, record.details, t),

    timeLabel: formatTransportTimeRangeLabel(record.departure, record.arrival),

    departureTime: record.departure.time,

    detailHref: buildTransportDetailHref(tripId, record.id),

    linkedCost: record.linkedCost,

  };

}



export function toTransportDetailViewModel(

  tripId: string,

  record: TransportRecord,

  linkedDocuments: TransportLinkedDocumentViewModel[] = [],

  t: AppTranslator<"Transport">,

): TransportDetailViewModel {

  const getType = createTransportTypeLabelResolver(t);
  const getTimezoneLabel = createTransportTimezoneLabelResolver(t);

  return {

    ...record,

    typeLabel: getType(record.type),

    routeLabel: buildRouteLabel(

      record.departure.locationName,

      record.arrival.locationName,

      record.departure.locationCode,

      record.arrival.locationCode,

    ),

    metaLabel: buildMetaLabel(record.type, record.details, t),

    departureTimeLabel: record.departure.time,

    arrivalTimeLabel: record.arrival.time,

    departureTimezoneLabel: getTimezoneLabel(record.departure.timezone),

    arrivalTimezoneLabel: getTimezoneLabel(record.arrival.timezone),

    linkedDocuments,

  };

}



export function getTransportListHref(tripId: string): string {

  return buildTransportHref(tripId);

}

