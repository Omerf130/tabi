import { describe, expect, it } from "vitest";
import {
  pushSubscriptionEndpointSchema,
  pushSubscriptionInputSchema,
} from "./schemas";

const validInput = {
  endpoint: "https://push.example.com/send/user-1",
  keys: {
    p256dh: "BNcRdreALRFXTkOuoPKHSEncBsp7_nISoq7v683CC654bS0lDrMZHnr7n8_1dYx8fhvYDes3U3nT3SpDIi6KI7c",
    auth: "tBHItJI5svbpez7KI4CCXg",
  },
};

describe("pushSubscriptionInputSchema", () => {
  it("accepts a valid subscription payload", () => {
    expect(pushSubscriptionInputSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects missing endpoint", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validInput,
        endpoint: "",
      }).success,
    ).toBe(false);
  });

  it("rejects missing p256dh", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        endpoint: validInput.endpoint,
        keys: { ...validInput.keys, p256dh: "" },
      }).success,
    ).toBe(false);
  });

  it("rejects missing auth", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        endpoint: validInput.endpoint,
        keys: { ...validInput.keys, auth: "" },
      }).success,
    ).toBe(false);
  });

  it("rejects unexpected fields", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validInput,
        userId: "507f1f77bcf86cd799439011",
      }).success,
    ).toBe(false);
  });

  it("rejects oversized endpoint values", () => {
    expect(
      pushSubscriptionInputSchema.safeParse({
        ...validInput,
        endpoint: `https://push.example.com/${"a".repeat(2048)}`,
      }).success,
    ).toBe(false);
  });
});

describe("pushSubscriptionEndpointSchema", () => {
  it("accepts endpoint-only unsubscribe payload", () => {
    expect(
      pushSubscriptionEndpointSchema.safeParse({
        endpoint: validInput.endpoint,
      }).success,
    ).toBe(true);
  });
});
