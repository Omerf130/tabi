import { afterEach, describe, expect, it } from "vitest";
import {
  extractBearerToken,
  isPushSchedulerAuthorized,
  timingSafeEqualUtf8,
} from "./verify-push-scheduler-authorization";

describe("verifyPushSchedulerAuthorization", () => {
  afterEach(() => {
    delete process.env.PUSH_SCHEDULER_SECRET;
  });

  it("fails closed when PUSH_SCHEDULER_SECRET is missing", () => {
    delete process.env.PUSH_SCHEDULER_SECRET;
    expect(
      isPushSchedulerAuthorized("Bearer anything"),
    ).toBe(false);
  });

  it("rejects missing Authorization", () => {
    process.env.PUSH_SCHEDULER_SECRET = "scheduler-secret";
    expect(isPushSchedulerAuthorized(null)).toBe(false);
  });

  it("rejects malformed Authorization", () => {
    process.env.PUSH_SCHEDULER_SECRET = "scheduler-secret";
    expect(isPushSchedulerAuthorized("Token scheduler-secret")).toBe(false);
    expect(isPushSchedulerAuthorized("Bearer")).toBe(false);
  });

  it("rejects wrong secret", () => {
    process.env.PUSH_SCHEDULER_SECRET = "scheduler-secret";
    expect(isPushSchedulerAuthorized("Bearer wrong")).toBe(false);
  });

  it("accepts correct Bearer secret", () => {
    process.env.PUSH_SCHEDULER_SECRET = "scheduler-secret";
    expect(isPushSchedulerAuthorized("Bearer scheduler-secret")).toBe(true);
  });

  it("compares secrets with timingSafeEqualUtf8", () => {
    expect(timingSafeEqualUtf8("abc", "abc")).toBe(true);
    expect(timingSafeEqualUtf8("abc", "abd")).toBe(false);
    expect(timingSafeEqualUtf8("abc", "abcd")).toBe(false);
  });

  it("extracts bearer token", () => {
    expect(extractBearerToken("Bearer token-value")).toBe("token-value");
    expect(extractBearerToken("bearer token-value")).toBe("token-value");
  });
});
