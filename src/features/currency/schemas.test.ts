import { describe, expect, it } from "vitest";
import { currencyPairQuerySchema } from "./schemas";

describe("currencyPairQuerySchema", () => {
  it("accepts valid supported-style pairs", () => {
    expect(currencyPairQuerySchema.safeParse({ from: "JPY", to: "ILS" }).success).toBe(
      true,
    );
    expect(currencyPairQuerySchema.safeParse({ from: "usd", to: "eur" }).success).toBe(
      true,
    );
  });

  it("rejects invalid or identical pairs", () => {
    expect(currencyPairQuerySchema.safeParse({ from: "JP", to: "ILS" }).success).toBe(
      false,
    );
    expect(currencyPairQuerySchema.safeParse({ from: "USD", to: "USD" }).success).toBe(
      false,
    );
  });
});
