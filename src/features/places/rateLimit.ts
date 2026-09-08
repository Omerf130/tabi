import "server-only";

const requestCounts = new Map<string, { count: number; windowStart: number }>();

export function checkPlacesRateLimit(
  userId: string,
  windowMs: number,
  maxRequests: number,
): boolean {
  const now = Date.now();
  const current = requestCounts.get(userId);

  if (!current || now - current.windowStart > windowMs) {
    requestCounts.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += 1;
  return true;
}

export function resetPlacesRateLimitForTests(): void {
  requestCounts.clear();
}
