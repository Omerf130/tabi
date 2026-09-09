import type { TrainCategory, TransportType } from "./transport-types";

export type TransportEndpoint = {
  locationName: string;
  locationCode?: string;
  date: string;
  time: string;
  timezone: string;
};

export type FlightTransportDetails = {
  airline?: string;
  flightNumber?: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
  gate?: string;
  seat?: string;
};

export type TrainTransportDetails = {
  trainCategory?: TrainCategory;
  serviceName?: string;
  trainNumber?: string;
  carNumber?: string;
  seats?: string;
};

export type OperatorTransportDetails = {
  operator?: string;
  serviceNumber?: string;
  vehicleOrServiceNotes?: string;
};

export type TransportDetails =
  | FlightTransportDetails
  | TrainTransportDetails
  | OperatorTransportDetails;

/** Flat persisted details object (all keys optional; only relevant keys populated). */
export type FlatTransportDetails = FlightTransportDetails &
  TrainTransportDetails &
  OperatorTransportDetails;

export type TransportRecord = {
  id: string;
  tripId: string;
  type: TransportType;
  departure: TransportEndpoint;
  arrival: TransportEndpoint;
  bookingReference?: string;
  notes?: string;
  details: FlatTransportDetails;
  createdAt: string;
};

export type TransportCardViewModel = {
  id: string;
  type: TransportType;
  typeLabel: string;
  routeLabel: string;
  metaLabel?: string;
  dateLabel: string;
  timeRangeLabel: string;
  detailHref: string;
};

export type TransportDetailViewModel = TransportRecord & {
  typeLabel: string;
  routeLabel: string;
  metaLabel?: string;
  departureTimeLabel: string;
  arrivalTimeLabel: string;
  departureTimezoneLabel: string;
  arrivalTimezoneLabel: string;
  linkedDocuments: TransportLinkedDocumentViewModel[];
};

export type TransportLinkedDocumentViewModel = {
  id: string;
  title: string;
  categoryLabel: string;
  href: string;
};

export type TransportItineraryItemViewModel = {
  id: string;
  type: TransportType;
  typeLabel: string;
  routeLabel: string;
  metaLabel?: string;
  timeLabel: string;
  departureTime: string;
  detailHref: string;
};

export type TransportFormValues = {
  type: TransportType;
  departureLocationName: string;
  departureLocationCode: string;
  departureDate: string;
  departureTime: string;
  departureTimezone: string;
  arrivalLocationName: string;
  arrivalLocationCode: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalTimezone: string;
  bookingReference: string;
  notes: string;
  airline: string;
  flightNumber: string;
  departureTerminal: string;
  arrivalTerminal: string;
  gate: string;
  seat: string;
  trainCategory: TrainCategory | "";
  serviceName: string;
  trainNumber: string;
  carNumber: string;
  seats: string;
  operator: string;
  serviceNumber: string;
  vehicleOrServiceNotes: string;
};

export type TransportContextItem = {
  id: string;
  type: TransportType;
  typeLabel: string;
  departureDate: string;
  departureTime: string;
  routeLabel: string;
  label: string;
};
