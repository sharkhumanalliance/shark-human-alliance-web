type RateLimitBucket = {
  timestamps: number[];
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

declare global {
  var __shaRateLimitStore: Map<string, RateLimitBucket> | undefined;
}

function getStore() {
  if (!globalThis.__shaRateLimitStore) {
    globalThis.__shaRateLimitStore = new Map<string, RateLimitBucket>();
  }
  return globalThis.__shaRateLimitStore;
}

export function getRateLimitKey(ip: string | null | undefined, scope: string) {
  return `${scope}:${ip?.trim() || "unknown"}`;
}

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const store = getStore();
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp > windowStart);

  if (bucket.timestamps.length >= limit) {
    const retryAfterMs = bucket.timestamps[0] + windowMs - now;
    store.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}
