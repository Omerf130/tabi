import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TransportNotFoundError,
  TransportValidationError,
  createTransport,
  deleteTransport,
  updateTransport,
} from "./transport-domain";

const { transportCreateMock, transportFindOneAndUpdateMock, transportFindOneAndDeleteMock } =
  vi.hoisted(() => ({
    transportCreateMock: vi.fn(),
    transportFindOneAndUpdateMock: vi.fn(),
    transportFindOneAndDeleteMock: vi.fn(),
  }));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/lib/db/transaction", () => ({
  withTransaction: vi.fn(async (fn: (session: unknown) => Promise<unknown>) => fn({})),
}));

vi.mock("@/features/finance/finance-linked-expense-domain", () => ({
  deleteLinkedTripExpenseForSource: vi.fn(),
  resolveTransportExpenseCategory: vi.fn(() => "transport"),
  syncLinkedTripExpense: vi.fn(),
}));

vi.mock("@/models/Transport", () => ({
  Transport: {
    create: transportCreateMock,
    findOneAndUpdate: transportFindOneAndUpdateMock,
    findOneAndDelete: transportFindOneAndDeleteMock,
  },
}));

const tripId = "507f1f77bcf86cd799439011";
const transportId = "507f1f77bcf86cd799439012";

const validInput = {
  type: "train" as const,
  departure: {
    locationName: "Tokyo",
    locationCode: undefined,
    date: "2026-10-25",
    time: "09:00",
    timezone: "Asia/Tokyo",
  },
  arrival: {
    locationName: "Kyoto",
    locationCode: undefined,
    date: "2026-10-25",
    time: "11:00",
    timezone: "Asia/Tokyo",
  },
  bookingReference: undefined,
  notes: undefined,
  details: {
    trainCategory: undefined,
    serviceName: undefined,
    trainNumber: undefined,
    carNumber: undefined,
    seats: undefined,
  },
};

describe("transport domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transportCreateMock.mockResolvedValue([
      { _id: { toString: () => transportId } },
    ]);
    transportFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: transportId }),
    });
    transportFindOneAndDeleteMock.mockReturnValue({
      session: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ _id: transportId }),
      }),
    });
  });

  it("creates transport", async () => {
    const id = await createTransport(tripId, validInput);
    expect(id).toBe(transportId);
    expect(transportCreateMock).toHaveBeenCalled();
  });

  it("rejects invalid chronology", async () => {
    await expect(
      createTransport(tripId, {
        ...validInput,
        arrival: { ...validInput.arrival, time: "08:00" },
      }),
    ).rejects.toBeInstanceOf(TransportValidationError);
  });

  it("updates transport", async () => {
    await updateTransport(tripId, { ...validInput, transportId });
    expect(transportFindOneAndUpdateMock).toHaveBeenCalled();
  });

  it("throws when transport is missing on update", async () => {
    transportFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(
      updateTransport(tripId, { ...validInput, transportId }),
    ).rejects.toBeInstanceOf(TransportNotFoundError);
  });

  it("deletes transport", async () => {
    await deleteTransport(tripId, transportId);
    expect(transportFindOneAndDeleteMock).toHaveBeenCalled();
  });
});
