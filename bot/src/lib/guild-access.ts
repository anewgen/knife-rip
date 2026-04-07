import { getBotPrisma } from "./db-prisma";

const cache = new Map<string, { blocked: boolean; exp: number }>();
const CACHE_MS = 8000;

export function invalidateGuildAccessCache(guildId: string): void {
  cache.delete(guildId);
}

/**
 * True when the guild is on the owner-managed denylist (bot should stay idle).
 * Fail-open if DATABASE_URL / DB is unavailable.
 */
export async function isGuildAccessBlocked(guildId: string): Promise<boolean> {
  const now = Date.now();
  const hit = cache.get(guildId);
  if (hit && hit.exp > now) return hit.blocked;

  try {
    const prisma = getBotPrisma();
    const row = await prisma.botGuildDenylist.findUnique({
      where: { guildId },
    });
    const blocked = row != null;
    cache.set(guildId, { blocked, exp: now + CACHE_MS });
    return blocked;
  } catch {
    return false;
  }
}
