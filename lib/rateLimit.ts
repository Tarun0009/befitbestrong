const requests = new Map<string, { count: number; resetAt: number }>();

/**
 * Token bucket rate limiter stored in a module-level Map.
 * Returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(
  ip: string,
  limit = 60,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
