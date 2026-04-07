import { db } from "@/lib/db";

/** First instant of the current calendar month (UTC). */
export function utcMonthStart(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

export function formatUtcMonthLabel(d: Date = utcMonthStart()): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Global top commands this month — **no guild identifiers** in the result
 * (suitable for public status / JSON API).
 */
export async function getPublicTopCommandsThisMonth(
  limit: number,
): Promise<{ commandKey: string; count: number }[] | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;
  const take = Math.max(1, Math.min(50, Math.floor(limit)));
  const since = utcMonthStart();

  try {
    const rows = await db.$queryRaw<{ commandKey: string; count: bigint }[]>`
      SELECT "commandKey", COUNT(*)::bigint AS count
      FROM "BotGuildCommandAudit"
      WHERE "createdAt" >= ${since}
        AND "success" = true
      GROUP BY "commandKey"
      ORDER BY count DESC
      LIMIT ${take}
    `;
    return rows.map((r) => ({
      commandKey: r.commandKey,
      count: Number(r.count),
    }));
  } catch {
    return null;
  }
}

export type GuildCommandUsageBreakdown = {
  /** Handler finished without throwing. */
  successes: number;
  /** Handler threw (bot-side error). */
  failures: number;
  /** Successes + failures (attempts recorded this month). */
  totalAttempts: number;
  /** 0–100, or null when there were no attempts. */
  failureRatePercent: number | null;
  top: { commandKey: string; count: number }[];
};

/**
 * Per-guild usage for the authenticated dashboard (includes guild id server-side only).
 */
export async function getGuildCommandUsageThisMonth(
  guildId: string,
  topLimit = 12,
): Promise<GuildCommandUsageBreakdown | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;
  const since = utcMonthStart();
  const take = Math.max(1, Math.min(50, Math.floor(topLimit)));

  try {
    const [agg, top] = await Promise.all([
      db.$queryRaw<{ successes: bigint; failures: bigint }[]>`
        SELECT
          COUNT(*) FILTER (WHERE "success" = true)::bigint AS successes,
          COUNT(*) FILTER (WHERE "success" = false)::bigint AS failures
        FROM "BotGuildCommandAudit"
        WHERE "guildId" = ${guildId}
          AND "createdAt" >= ${since}
      `,
      db.$queryRaw<{ commandKey: string; count: bigint }[]>`
        SELECT "commandKey", COUNT(*)::bigint AS count
        FROM "BotGuildCommandAudit"
        WHERE "guildId" = ${guildId}
          AND "createdAt" >= ${since}
          AND "success" = true
        GROUP BY "commandKey"
        ORDER BY count DESC
        LIMIT ${take}
      `,
    ]);

    const row = agg[0];
    const successes = Number(row?.successes ?? 0);
    const failures = Number(row?.failures ?? 0);
    const totalAttempts = successes + failures;
    const failureRatePercent =
      totalAttempts > 0
        ? Math.round((failures / totalAttempts) * 1000) / 10
        : null;

    return {
      successes,
      failures,
      totalAttempts,
      failureRatePercent,
      top: top.map((r) => ({
        commandKey: r.commandKey,
        count: Number(r.count),
      })),
    };
  } catch {
    return null;
  }
}
