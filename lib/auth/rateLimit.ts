type Bucket = number[];

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;

function prune(timestamps: Bucket, now: number): Bucket {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

/** Sliding-window in-memory limiter. Resets on process restart. */
export function checkRateLimit(
  key: string,
  limit: number,
  now = Date.now()
): { allowed: boolean; remaining: number } {
  const next = prune(buckets.get(key) ?? [], now);
  if (next.length >= limit) {
    buckets.set(key, next);
    return { allowed: false, remaining: 0 };
  }
  next.push(now);
  buckets.set(key, next);
  return { allowed: true, remaining: Math.max(0, limit - next.length) };
}

export const OTP_EMAIL_LIMIT = 5;
export const OTP_IP_LIMIT = 20;
