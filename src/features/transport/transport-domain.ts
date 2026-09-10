import "server-only";

import type { EntityCostInput } from "@/features/finance/finance-linked-expense-domain";
import {
  deleteLinkedTripExpenseForSource,
  resolveTransportExpenseCategory,
  syncLinkedTripExpense,
} from "@/features/finance/finance-linked-expense-domain";
import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { Transport } from "@/models/Transport";
import { TRANSPORT_MESSAGES } from "./constants";
import type { CreateTransportInput, UpdateTransportInput } from "./schemas";
import { isArrivalAfterDeparture } from "./transport-datetime";

export class TransportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransportValidationError";
  }
}

export class TransportNotFoundError extends Error {
  constructor() {
    super(TRANSPORT_MESSAGES.notFound);
    this.name = "TransportNotFoundError";
  }
}

function normalizeDetails(input: CreateTransportInput) {
  if (input.type === "flight") {
    return {
      airline: input.details.airline ?? null,
      flightNumber: input.details.flightNumber ?? null,
      departureTerminal: input.details.departureTerminal ?? null,
      arrivalTerminal: input.details.arrivalTerminal ?? null,
      gate: input.details.gate ?? null,
      seat: input.details.seat ?? null,
      trainCategory: null,
      serviceName: null,
      trainNumber: null,
      carNumber: null,
      seats: null,
      operator: null,
      serviceNumber: null,
      vehicleOrServiceNotes: null,
    };
  }

  if (input.type === "train") {
    return {
      airline: null,
      flightNumber: null,
      departureTerminal: null,
      arrivalTerminal: null,
      gate: null,
      seat: null,
      trainCategory: input.details.trainCategory ?? null,
      serviceName: input.details.serviceName ?? null,
      trainNumber: input.details.trainNumber ?? null,
      carNumber: input.details.carNumber ?? null,
      seats: input.details.seats ?? null,
      operator: null,
      serviceNumber: null,
      vehicleOrServiceNotes: null,
    };
  }

  return {
    airline: null,
    flightNumber: null,
    departureTerminal: null,
    arrivalTerminal: null,
    gate: null,
    seat: null,
    trainCategory: null,
    serviceName: null,
    trainNumber: null,
    carNumber: null,
    seats: null,
    operator: input.details.operator ?? null,
    serviceNumber: input.details.serviceNumber ?? null,
    vehicleOrServiceNotes: input.details.vehicleOrServiceNotes ?? null,
  };
}

function assertValidChronology(input: CreateTransportInput): void {
  if (!isArrivalAfterDeparture(input.departure, input.arrival)) {
    throw new TransportValidationError(TRANSPORT_MESSAGES.invalidChronology);
  }
}

export async function createTransport(
  tripId: string,
  input: CreateTransportInput,
  cost?: EntityCostInput | null,
): Promise<string> {
  assertValidChronology(input);

  return withTransaction(async (session) => {
    await connectDb();

    const [created] = await Transport.create(
      [
        {
          tripId,
          type: input.type,
          departure: {
            ...input.departure,
            locationCode: input.departure.locationCode ?? null,
          },
          arrival: {
            ...input.arrival,
            locationCode: input.arrival.locationCode ?? null,
          },
          bookingReference: input.bookingReference ?? null,
          notes: input.notes ?? null,
          details: normalizeDetails(input),
        },
      ],
      { session },
    );

    const transportId = created._id.toString();

    if (cost) {
      await syncLinkedTripExpense({
        tripId,
        sourceType: "transport",
        sourceId: transportId,
        category: resolveTransportExpenseCategory(input.type),
        expenseDate: input.departure.date,
        cost,
        session,
      });
    }

    return transportId;
  });
}

export async function updateTransport(
  tripId: string,
  input: UpdateTransportInput,
  costSync?: EntityCostInput | null,
): Promise<void> {
  assertValidChronology(input);

  await withTransaction(async (session) => {
    await connectDb();

    const updated = await Transport.findOneAndUpdate(
      { _id: input.transportId, tripId },
      {
        type: input.type,
        departure: {
          ...input.departure,
          locationCode: input.departure.locationCode ?? null,
        },
        arrival: {
          ...input.arrival,
          locationCode: input.arrival.locationCode ?? null,
        },
        bookingReference: input.bookingReference ?? null,
        notes: input.notes ?? null,
        details: normalizeDetails(input),
      },
      { new: true, session },
    ).lean();

    if (!updated) {
      throw new TransportNotFoundError();
    }

    if (costSync !== undefined) {
      await syncLinkedTripExpense({
        tripId,
        sourceType: "transport",
        sourceId: input.transportId,
        category: resolveTransportExpenseCategory(input.type),
        expenseDate: input.departure.date,
        cost: costSync,
        session,
      });
    }
  });
}

export async function deleteTransport(tripId: string, transportId: string): Promise<void> {
  await withTransaction(async (session) => {
    await connectDb();
    const deleted = await Transport.findOneAndDelete({ _id: transportId, tripId })
      .session(session)
      .lean();
    if (!deleted) {
      throw new TransportNotFoundError();
    }

    await deleteLinkedTripExpenseForSource(tripId, "transport", transportId, session);
  });
}
