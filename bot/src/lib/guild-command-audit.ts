import { getBotPrisma } from "./db-prisma";

export type GuildCommandAuditRow = {
  actorUserId: string;
  commandKey: string;
  success: boolean;
  createdAt: Date;
};

/** Best-effort; never throws. No message content or arguments stored. */
export function recordGuildCommandAudit(entry: {
  guildId: string;
  actorUserId: string;
  commandKey: string;
  success: boolean;
}): void {
  void (async () => {
    try {
      const prisma = getBotPrisma();
      await prisma.botGuildCommandAudit.create({ data: entry });
    } catch {
      /* ignore */
    }
  })();
}

export async function fetchRecentGuildCommandAudit(
  guildId: string,
  limit: number,
): Promise<GuildCommandAuditRow[]> {
  const prisma = getBotPrisma();
  return prisma.botGuildCommandAudit.findMany({
    where: { guildId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      actorUserId: true,
      commandKey: true,
      success: true,
      createdAt: true,
    },
  });
}
