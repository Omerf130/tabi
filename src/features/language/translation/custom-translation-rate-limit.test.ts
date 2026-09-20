import { describe, expect, it, beforeEach } from "vitest";
import {
  checkCustomTranslationRateLimit,
  CUSTOM_TRANSLATION_RATE_LIMIT_MAX_REQUESTS,
  resetCustomTranslationRateLimitForTests,
} from "./custom-translation-rate-limit";

describe("custom translation rate limit", () => {
  beforeEach(() => {
    resetCustomTranslationRateLimitForTests();
  });

  it("allows up to the configured maximum per window", () => {
    const userId = "user-rate-limit";
    for (let index = 0; index < CUSTOM_TRANSLATION_RATE_LIMIT_MAX_REQUESTS; index += 1) {
      expect(checkCustomTranslationRateLimit(userId)).toBe(true);
    }
    expect(checkCustomTranslationRateLimit(userId)).toBe(false);
  });
});
