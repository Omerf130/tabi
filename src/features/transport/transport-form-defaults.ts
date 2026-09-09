import { getDefaultJapanTransportTimezone } from "./timezone-options";
import type { TransportFormValues, TransportRecord } from "./types";
import type { TransportType } from "./transport-types";

export function createEmptyTransportFormValues(type: TransportType): TransportFormValues {
  const defaultTimezone = getDefaultJapanTransportTimezone();

  return {
    type,
    departureLocationName: "",
    departureLocationCode: "",
    departureDate: "",
    departureTime: "",
    departureTimezone: defaultTimezone,
    arrivalLocationName: "",
    arrivalLocationCode: "",
    arrivalDate: "",
    arrivalTime: "",
    arrivalTimezone: defaultTimezone,
    bookingReference: "",
    notes: "",
    airline: "",
    flightNumber: "",
    departureTerminal: "",
    arrivalTerminal: "",
    gate: "",
    seat: "",
    trainCategory: "",
    serviceName: "",
    trainNumber: "",
    carNumber: "",
    seats: "",
    operator: "",
    serviceNumber: "",
    vehicleOrServiceNotes: "",
  };
}

export function toTransportFormValues(record: TransportRecord): TransportFormValues {
  return {
    type: record.type,
    departureLocationName: record.departure.locationName,
    departureLocationCode: record.departure.locationCode ?? "",
    departureDate: record.departure.date,
    departureTime: record.departure.time,
    departureTimezone: record.departure.timezone,
    arrivalLocationName: record.arrival.locationName,
    arrivalLocationCode: record.arrival.locationCode ?? "",
    arrivalDate: record.arrival.date,
    arrivalTime: record.arrival.time,
    arrivalTimezone: record.arrival.timezone,
    bookingReference: record.bookingReference ?? "",
    notes: record.notes ?? "",
    airline: "airline" in record.details ? record.details.airline ?? "" : "",
    flightNumber:
      "flightNumber" in record.details ? record.details.flightNumber ?? "" : "",
    departureTerminal:
      "departureTerminal" in record.details
        ? record.details.departureTerminal ?? ""
        : "",
    arrivalTerminal:
      "arrivalTerminal" in record.details ? record.details.arrivalTerminal ?? "" : "",
    gate: "gate" in record.details ? record.details.gate ?? "" : "",
    seat: "seat" in record.details ? record.details.seat ?? "" : "",
    trainCategory:
      "trainCategory" in record.details ? record.details.trainCategory ?? "" : "",
    serviceName:
      "serviceName" in record.details ? record.details.serviceName ?? "" : "",
    trainNumber:
      "trainNumber" in record.details ? record.details.trainNumber ?? "" : "",
    carNumber: "carNumber" in record.details ? record.details.carNumber ?? "" : "",
    seats: "seats" in record.details ? record.details.seats ?? "" : "",
    operator: "operator" in record.details ? record.details.operator ?? "" : "",
    serviceNumber:
      "serviceNumber" in record.details ? record.details.serviceNumber ?? "" : "",
    vehicleOrServiceNotes:
      "vehicleOrServiceNotes" in record.details
        ? record.details.vehicleOrServiceNotes ?? ""
        : "",
  };
}
