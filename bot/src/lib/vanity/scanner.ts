import type { Client } from "discord.js";
import { getBotPrisma } from "../db-prisma";
import { recordVanityProbe } from "./observe";
import { getVanityWordList } from "./wordlist";

const CHECKPOINT_ID = 1;

function envFlag(name: string, defaultVal: boolean): boolean {
  const v = process.env[name]?.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no") return false;
  return defaultVal;
}

/** Opt-in: set `VANITY_SCANNER_ENABLED=1` so the bot does not spam Discord until you want it. */
export function isVanityScannerEnabled(): boolean {
  return envFlag("VANITY_SCANNER_ENABLED", false);
}

function parsePositiveInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function vanityScannerBatchSize(): number {
  return Math.min(25, Math.max(1, parsePositiveInt("VANITY_SCANNER_BATCH", 6)));
}

export function vanityScannerTickSpacingMs(): number {
  return Math.max(250, parsePositiveInt("VANITY_SCANNER_ITEM_GAP_MS", 650));
}

/** Delay between each full scanner batch (entire batch of codes + checkpoint write). */
export function vanityScannerTickPeriodMs(): number {
  return Math.max(5000, parsePositiveInt("VANITY_SCANNER_TICK_MS", 15_000));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Process a small batch of dictionary codes (circular cursor), spacing probes to reduce 429s.
 */
export async function tickVanityScanner(client: Client): Promise<void> {
  if (!isVanityScannerEnabled()) return;

  const prisma = getBotPrisma();
  const list = getVanityWordList();
  if (list.length === 0) return;

  await prisma.vanityScannerCheckpoint.upsert({
    where: { id: CHECKPOINT_ID },
    create: { id: CHECKPOINT_ID, nextIndex: 0 },
    update: {},
  });

  const cp = await prisma.vanityScannerCheckpoint.findUnique({
    where: { id: CHECKPOINT_ID },
  });
  let idx = cp?.nextIndex ?? 0;
  if (idx >= list.length) idx = 0;

  const batch = vanityScannerBatchSize();
  const gap = vanityScannerTickSpacingMs();
  let backoff = 0;

  for (let i = 0; i < batch; ) {
    const code = list[idx]!;
    try {
      await recordVanityProbe(prisma, client, code);
      backoff = Math.max(0, backoff - 50);
    } catch (e: unknown) {
      const name =
        e && typeof e === "object" && "name" in e
          ? String((e as { name: unknown }).name)
          : "";
      const status =
        e && typeof e === "object" && "status" in e
          ? Number((e as { status: unknown }).status)
          : NaN;
      if (status === 429 || name.includes("Rate")) {
        backoff = Math.min(backoff + 2500, 35_000);
        await sleep(backoff);
        continue;
      }
    }

    idx = (idx + 1) % list.length;
    i++;
    await sleep(gap);
  }

  await prisma.vanityScannerCheckpoint.update({
    where: { id: CHECKPOINT_ID },
    data: { nextIndex: idx },
  });
}
