/**
 * Simple in-memory sliding-window rate limiter.
 * NOTE: This is per-process. For multi-instance deployments, use a shared
 * store (e.g. Upstash Redis with @upstash/ratelimit) instead.
 */

const store = new Map<string, number[]>();

/**
 * @param identifier  A unique key per client (e.g. IP address, user ID)
 * @param limit       Max requests allowed in the window
 * @param windowMs    Window duration in milliseconds (default: 60 seconds)
 * @returns { allowed, remaining, resetMs }
 */
export function rateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Prune expired timestamps
  const timestamps = (store.get(identifier) ?? []).filter(
    (t) => t > windowStart
  );

  if (timestamps.length >= limit) {
    store.set(identifier, timestamps);
    const oldest = timestamps[0];
    return { allowed: false, remaining: 0, resetMs: oldest + windowMs - now };
  }

  timestamps.push(now);
  store.set(identifier, timestamps);

  // Periodic cleanup to prevent unbounded memory growth
  if (store.size > 5000) {
    for (const [key, ts] of store.entries()) {
      if (ts.every((t) => t <= windowStart)) {
        store.delete(key);
      }
    }
  }

  return {
    allowed: true,
    remaining: limit - timestamps.length,
    resetMs: windowMs,
  };
}
