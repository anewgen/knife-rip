/**
 * Web mines — same grid and payout curve as Discord `mines-flow.ts`.
 */
import { randomInt } from "node:crypto";

import {
  WEB_MINES_COUNT,
  WEB_MINES_SAFE,
  WEB_MINES_TOTAL,
} from "./web-mines-constants";

export {
  WEB_MINES_COUNT,
  WEB_MINES_SAFE,
  WEB_MINES_TOTAL,
} from "./web-mines-constants";

/** Hub mult in hundredths (1.00 → 100). Web uses flat 1.0× like other site house games. */
export const WEB_MINES_MULT_CENTS = BigInt(100);

export const WEB_MINES_SESSION_TTL_MS = 20 * 60 * 1000;

/** Basis points for payout multiplier after `gems` safe reveals (Discord `payoutBps`). */
export function webMinesPayoutBps(gems: number): number {
  return 10000 + gems * 1400 + gems * gems * 80;
}

export function webMinesPlaceMines(): number[] {
  const s = new Set<number>();
  while (s.size < WEB_MINES_COUNT) {
    s.add(randomInt(WEB_MINES_TOTAL));
  }
  return [...s].sort((a, b) => a - b);
}

export function webMinesPayout(
  bet: bigint,
  gems: number,
  mc: bigint,
): bigint {
  if (gems < 1) return BigInt(0);
  const bps = BigInt(webMinesPayoutBps(gems));
  return (bet * bps * mc) / BigInt(1_000_000);
}

export type WebMinesStoredState = {
  bet: string;
  mines: number[];
  safeRevealed: number[];
  createdAt: number;
};

function isIndexArray(raw: unknown): raw is number[] {
  if (!Array.isArray(raw)) return false;
  for (const x of raw) {
    if (typeof x !== "number" || !Number.isInteger(x)) return false;
  }
  return true;
}

export function parseWebMinesState(raw: unknown): WebMinesStoredState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.bet !== "string") return null;
  if (typeof o.createdAt !== "number") return null;
  if (!isIndexArray(o.mines) || !isIndexArray(o.safeRevealed)) return null;
  if (o.mines.length !== WEB_MINES_COUNT) return null;
  const mineSet = new Set(o.mines);
  if (mineSet.size !== WEB_MINES_COUNT) return null;
  for (const m of o.mines) {
    if (m < 0 || m >= WEB_MINES_TOTAL) return null;
  }
  for (const r of o.safeRevealed) {
    if (r < 0 || r >= WEB_MINES_TOTAL) return null;
    if (mineSet.has(r)) return null;
  }
  const safeSet = new Set(o.safeRevealed);
  if (safeSet.size !== o.safeRevealed.length) return null;
  return {
    bet: o.bet,
    mines: [...o.mines].sort((a, b) => a - b),
    safeRevealed: o.safeRevealed as number[],
    createdAt: o.createdAt,
  };
}

export function serializeWebMinesState(
  s: WebMinesStoredState,
): Record<string, unknown> {
  return {
    bet: s.bet,
    mines: s.mines,
    safeRevealed: s.safeRevealed,
    createdAt: s.createdAt,
  };
}
