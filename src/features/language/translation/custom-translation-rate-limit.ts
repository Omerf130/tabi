import "server-only";

const requestCounts = new Map<string, { count: number; windowStart: number }>();

export const CUSTOM_TRANSLATION_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const CUSTOM_TRANSLATION_RATE_LIMIT_MAX_REQUESTS = 30;

export function checkCustomTranslationRateLimit(userId: string): boolean {
  const now = Date.now();
  const current = requestCounts.get(userId);

  if (!current || now - current.windowStart > CUSTOM_TRANSLATION_RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (current.count >= CUSTOM_TRANSLATION_RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
}

export function resetCustomTranslationRateLimitForTests(): void {
  requestCounts.clear();
}
