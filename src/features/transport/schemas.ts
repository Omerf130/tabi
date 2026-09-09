import { z } from "zod";
import {
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "@/features/trips/calendar-date";
import { isValidWallClockTime } from "@/features/itinerary/time";
import { isValidObjectId } from "@/features/trips/object-id";
import {
  TRANSPORT_AIRLINE_MAX_LENGTH,
  TRANSPORT_BOOKING_REFERENCE_MAX_LENGTH,
  TRANSPORT_CAR_NUMBER_MAX_LENGTH,
  TRANSPORT_FLIGHT_NUMBER_MAX_LENGTH,
  TRANSPORT_GATE_MAX_LENGTH,
  TRANSPORT_LOCATION_CODE_MAX_LENGTH,
  TRANSPORT_LOCATION_NAME_MAX_LENGTH,
  TRANSPORT_NOTES_MAX_LENGTH,
  TRANSPORT_OPERATOR_MAX_LENGTH,
  TRANSPORT_SEAT_MAX_LENGTH,
  TRANSPORT_SERVICE_NAME_MAX_LENGTH,
  TRANSPORT_SERVICE_NUMBER_MAX_LENGTH,
  TRANSPORT_TERMINAL_MAX_LENGTH,
  TRANSPORT_TRAIN_NUMBER_MAX_LENGTH,
  TRANSPORT_VEHICLE_NOTES_MAX_LENGTH,
} from "./constants";
import { isSupportedTransportTimezone } from "./timezone-options";
import { TRAIN_CATEGORIES, TRANSPORT_TYPES } from "./transport-types";
import { isArrivalAfterDeparture } from "./transport-datetime";
import type { TransportEndpoint } from "./types";

const objectIdSchema = z.string().refine(isValidObjectId, { message: "Invalid id" });

const calendarDateSchema = z
  .string()
  .trim()
  .refine((value) => isValidCalendarDateString(value), {
    message: "invalid calendar date",
  })
  .transform((value) => normalizeCalendarDateInput(value)!);

const wallClockTimeSchema = z
  .string()
  .trim()
  .refine((value) => isValidWallClockTime(value), { message: "invalid time" });

const timezoneSchema = z
  .string()
  .trim()
  .refine((value) => isSupportedTransportTimezone(value), {
    message: "invalid timezone",
  });

const optionalTrimmed = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      const trimmed = String(value).trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.union([z.undefined(), z.string().max(maxLength)]),
  );

const endpointSchema = z.object({
  locationName: z.string().trim().min(1).max(TRANSPORT_LOCATION_NAME_MAX_LENGTH),
  locationCode: optionalTrimmed(TRANSPORT_LOCATION_CODE_MAX_LENGTH),
  date: calendarDateSchema,
  time: wallClockTimeSchema,
  timezone: timezoneSchema,
});

const sharedFieldsSchema = z.object({
  bookingReference: optionalTrimmed(TRANSPORT_BOOKING_REFERENCE_MAX_LENGTH),
  notes: optionalTrimmed(TRANSPORT_NOTES_MAX_LENGTH),
});

const flightDetailsSchema = z.object({
  airline: optionalTrimmed(TRANSPORT_AIRLINE_MAX_LENGTH),
  flightNumber: optionalTrimmed(TRANSPORT_FLIGHT_NUMBER_MAX_LENGTH),
  departureTerminal: optionalTrimmed(TRANSPORT_TERMINAL_MAX_LENGTH),
  arrivalTerminal: optionalTrimmed(TRANSPORT_TERMINAL_MAX_LENGTH),
  gate: optionalTrimmed(TRANSPORT_GATE_MAX_LENGTH),
  seat: optionalTrimmed(TRANSPORT_SEAT_MAX_LENGTH),
});

const trainDetailsSchema = z.object({
  trainCategory: z.preprocess(
    (value) => {
      const trimmed = String(value ?? "").trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.union([z.undefined(), z.enum(TRAIN_CATEGORIES)]),
  ),
  serviceName: optionalTrimmed(TRANSPORT_SERVICE_NAME_MAX_LENGTH),
  trainNumber: optionalTrimmed(TRANSPORT_TRAIN_NUMBER_MAX_LENGTH),
  carNumber: optionalTrimmed(TRANSPORT_CAR_NUMBER_MAX_LENGTH),
  seats: optionalTrimmed(TRANSPORT_SEAT_MAX_LENGTH),
});

const operatorDetailsSchema = z.object({
  operator: optionalTrimmed(TRANSPORT_OPERATOR_MAX_LENGTH),
  serviceNumber: optionalTrimmed(TRANSPORT_SERVICE_NUMBER_MAX_LENGTH),
  vehicleOrServiceNotes: optionalTrimmed(TRANSPORT_VEHICLE_NOTES_MAX_LENGTH),
});

function validateChronology(
  departure: TransportEndpoint,
  arrival: TransportEndpoint,
  ctx: z.RefinementCtx,
): void {
  if (
    !isSupportedTransportTimezone(departure.timezone) ||
    !isSupportedTransportTimezone(arrival.timezone)
  ) {
    return;
  }

  if (!isArrivalAfterDeparture(departure, arrival)) {
    ctx.addIssue({
      code: "custom",
      message: "invalid chronology",
      path: ["arrival", "time"],
    });
  }
}

const transportBaseSchema = z
  .object({
    departure: endpointSchema,
    arrival: endpointSchema,
  })
  .merge(sharedFieldsSchema);

function chronologyRefinement(
  value: {
    departure: TransportEndpoint;
    arrival: TransportEndpoint;
  },
  ctx: z.RefinementCtx,
): void {
  validateChronology(value.departure, value.arrival, ctx);
}

export const createFlightTransportSchema = transportBaseSchema
  .merge(
    z.object({
      type: z.literal("flight"),
      details: flightDetailsSchema,
    }),
  )
  .superRefine(chronologyRefinement);

export const createTrainTransportSchema = transportBaseSchema
  .merge(
    z.object({
      type: z.literal("train"),
      details: trainDetailsSchema,
    }),
  )
  .superRefine(chronologyRefinement);

export const createOperatorTransportSchema = (type: "bus" | "ferry" | "car" | "taxi") =>
  transportBaseSchema
    .merge(
      z.object({
        type: z.literal(type),
        details: operatorDetailsSchema,
      }),
    )
    .superRefine(chronologyRefinement);

export const createTransportSchema = z.discriminatedUnion("type", [
  createFlightTransportSchema,
  createTrainTransportSchema,
  createOperatorTransportSchema("bus"),
  createOperatorTransportSchema("ferry"),
  createOperatorTransportSchema("car"),
  createOperatorTransportSchema("taxi"),
]);

export const updateTransportSchema = z.intersection(
  createTransportSchema,
  z.object({ transportId: objectIdSchema }),
);

export const deleteTransportSchema = z.object({
  tripId: objectIdSchema,
  transportId: objectIdSchema,
});

export type CreateTransportInput = z.infer<typeof createTransportSchema>;
export type UpdateTransportInput = z.infer<typeof updateTransportSchema>;

export function parseTransportTypeParam(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  return (TRANSPORT_TYPES as readonly string[]).includes(trimmed)
    ? (trimmed as (typeof TRANSPORT_TYPES)[number])
    : null;
}

export function parseTransportFromFormData(formData: FormData) {
  const type = parseTransportTypeParam(String(formData.get("type") ?? ""));
  if (!type) {
    return { type: null };
  }

  const base = {
    type,
    tripId: formData.get("tripId"),
    transportId: formData.get("transportId"),
    departure: {
      locationName: formData.get("departureLocationName"),
      locationCode: formData.get("departureLocationCode"),
      date: formData.get("departureDate"),
      time: formData.get("departureTime"),
      timezone: formData.get("departureTimezone"),
    },
    arrival: {
      locationName: formData.get("arrivalLocationName"),
      locationCode: formData.get("arrivalLocationCode"),
      date: formData.get("arrivalDate"),
      time: formData.get("arrivalTime"),
      timezone: formData.get("arrivalTimezone"),
    },
    bookingReference: formData.get("bookingReference"),
    notes: formData.get("notes"),
  };

  if (type === "flight") {
    return {
      ...base,
      details: {
        airline: formData.get("airline"),
        flightNumber: formData.get("flightNumber"),
        departureTerminal: formData.get("departureTerminal"),
        arrivalTerminal: formData.get("arrivalTerminal"),
        gate: formData.get("gate"),
        seat: formData.get("seat"),
      },
    };
  }

  if (type === "train") {
    return {
      ...base,
      details: {
        trainCategory: formData.get("trainCategory"),
        serviceName: formData.get("serviceName"),
        trainNumber: formData.get("trainNumber"),
        carNumber: formData.get("carNumber"),
        seats: formData.get("seats"),
      },
    };
  }

  return {
    ...base,
    details: {
      operator: formData.get("operator"),
      serviceNumber: formData.get("serviceNumber"),
      vehicleOrServiceNotes: formData.get("vehicleOrServiceNotes"),
    },
  };
}
