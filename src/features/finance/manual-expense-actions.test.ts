import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createManualExpenseAction,
  deleteManualExpenseAction,
  updateManualExpenseAction,
} from "./actions";

const tripId = "507f1f77bcf86cd799439011";
const expenseId = "507f1f77bcf86cd799439012";

const {
  requireTripOwnerMock,
  createManualTripExpenseMock,
  updateManualTripExpenseMock,
  deleteManualTripExpenseMock,
} = vi.hoisted(() => ({
  requireTripOwnerMock: vi.fn(),
  createManualTripExpenseMock: vi.fn(),
  updateManualTripExpenseMock: vi.fn(),
  deleteManualTripExpenseMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("./finance-expense-domain", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./finance-expense-domain")>();
  return {
    ...actual,
    createManualTripExpense: createManualTripExpenseMock,
    updateManualTripExpense: updateManualTripExpenseMock,
    deleteManualTripExpense: deleteManualTripExpenseMock,
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("manual expense actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: tripId, role: "owner" });
    createManualTripExpenseMock.mockResolvedValue(expenseId);
    updateManualTripExpenseMock.mockResolvedValue(undefined);
    deleteManualTripExpenseMock.mockResolvedValue(undefined);
  });

  it("allows owners to create manual expenses", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("title", "Sushi Dai");
    formData.set("category", "food");
    formData.set("expenseDate", "2026-10-26");
    formData.set("amount", "8400");
    formData.set("currency", "JPY");

    const result = await createManualExpenseAction({}, formData);

    expect(result.ok).toBe(true);
    expect(createManualTripExpenseMock).toHaveBeenCalled();
  });

  it("rejects member create mutations", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("not found"));

    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("title", "Sushi Dai");
    formData.set("category", "food");
    formData.set("expenseDate", "2026-10-26");
    formData.set("amount", "8400");
    formData.set("currency", "JPY");

    const result = await createManualExpenseAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(createManualTripExpenseMock).not.toHaveBeenCalled();
  });

  it("allows owners to update manual expenses", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("expenseId", expenseId);
    formData.set("title", "Sushi Dai");
    formData.set("category", "food");
    formData.set("expenseDate", "2026-10-26");
    formData.set("amount", "8400");
    formData.set("currency", "JPY");

    const result = await updateManualExpenseAction({}, formData);

    expect(result.ok).toBe(true);
    expect(updateManualTripExpenseMock).toHaveBeenCalled();
  });

  it("allows owners to delete manual expenses", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("expenseId", expenseId);

    const result = await deleteManualExpenseAction({}, formData);

    expect(result.ok).toBe(true);
    expect(deleteManualTripExpenseMock).toHaveBeenCalledWith(tripId, expenseId);
  });
});
