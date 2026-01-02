type Bucket = { tokens: number; lastRefill: number };

const BUCKETS = new Map<string, Bucket>();
const MAX_TOKENS = 60; // e.g., 60 requests
const REFILL_INTERVAL_MS = 60_000; // refill per minute

export function allowRequest(ip: string): boolean {
  const now = Date.now();
  const bucket = BUCKETS.get(ip) ?? { tokens: MAX_TOKENS, lastRefill: now };
  const elapsed = now - bucket.lastRefill;
  const refillTokens = Math.floor(elapsed / REFILL_INTERVAL_MS) * MAX_TOKENS;

  if (refillTokens > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refillTokens);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    BUCKETS.set(ip, bucket);
    return false;
  }

  bucket.tokens -= 1;
  BUCKETS.set(ip, bucket);
  return true;
}
