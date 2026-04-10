import type { BusinessKey } from "./economy-tuning";
import {
  BUSINESS_MAX_ACCRUE_HOURS,
  BUSINESS_RATE_PER_HOUR,
} from "./economy-tuning";

export function computeBusinessAccrued(
  businessKey: BusinessKey,
  tier: number,
  lastCollectedAt: Date,
  nowMs: number,
): bigint {
  const elapsedMs = Math.max(0, nowMs - lastCollectedAt.getTime());
  const wholeHours = Math.floor(elapsedMs / 3_600_000);
  const hours = Math.min(wholeHours, BUSINESS_MAX_ACCRUE_HOURS);
  if (hours <= 0) return 0n;
  const rate = BUSINESS_RATE_PER_HOUR[businessKey];
  return rate * BigInt(tier) * BigInt(hours);
}
