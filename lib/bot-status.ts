import { db } from "@/lib/db";

export const BOT_STATUS_SNAPSHOT_ID = "status" as const;

export type ShardSnapshot = {
  id: number;
  uptimeMs: number;
  latencyMs: number;
  guilds: number;
  users: number;
};

export type BotStatusSnapshot = {
  capturedAt: string;
  shardCount: number;
  shards: ShardSnapshot[];
};

function isValidSnapshot(raw: unknown): raw is BotStatusSnapshot {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  if (typeof o.capturedAt !== "string") return false;
  if (typeof o.shardCount !== "number" || !Number.isFinite(o.shardCount)) return false;
  if (!Array.isArray(o.shards)) return false;
  return o.shards.every((s) => {
    if (!s || typeof s !== "object") return false;
    const v = s as Record<string, unknown>;
    return (
      typeof v.id === "number" &&
      Number.isFinite(v.id) &&
      typeof v.uptimeMs === "number" &&
      Number.isFinite(v.uptimeMs) &&
      typeof v.latencyMs === "number" &&
      Number.isFinite(v.latencyMs) &&
      typeof v.guilds === "number" &&
      Number.isFinite(v.guilds) &&
      typeof v.users === "number" &&
      Number.isFinite(v.users)
    );
  });
}

export async function getBotStatusSnapshot(): Promise<{
  snapshot: BotStatusSnapshot | null;
  updatedAt: Date | null;
}> {
  try {
    const row = await db.botCommandSnapshot.findUnique({
      where: { id: BOT_STATUS_SNAPSHOT_ID },
    });
    if (!row || !isValidSnapshot(row.payload)) {
      return { snapshot: null, updatedAt: row?.updatedAt ?? null };
    }
    return { snapshot: row.payload, updatedAt: row.updatedAt };
  } catch {
    return { snapshot: null, updatedAt: null };
  }
}

