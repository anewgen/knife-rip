import { PREFIX } from "../config";
import { getBotPrisma } from "./db-prisma";

const cache = new Map<string, { prefix: string; exp: number }>();
const CACHE_MS = 8000;

/**
 * Custom prefixes servers may pick (.prefix add). Default {@link PREFIX} is implicit.
 * Kept small to limit accidental triggers and confusion with normal text.
 */
export const ALLOWED_CUSTOM_PREFIXES = [
  "!",
  "?",
  "$",
  "%",
  "^",
  "&",
  "*",
  "~",
  "-",
  "+",
  "=",
  ";",
  ":",
  "|",
  "`",
  "k!",
  "kn!",
] as const;

const allowedSet = new Set<string>(ALLOWED_CUSTOM_PREFIXES);

export function isAllowedCustomPrefix(value: string): boolean {
  return allowedSet.has(value);
}

export function formatAllowedPrefixList(): string {
  return ALLOWED_CUSTOM_PREFIXES.map((p) => `\`${p}\``).join(", ");
}

export function invalidateGuildPrefixCache(guildId: string): void {
  cache.delete(guildId);
}

function normalizeStoredPrefix(raw: string | undefined): string {
  if (!raw || !allowedSet.has(raw)) return PREFIX;
  return raw;
}

/**
 * Effective command prefix for this guild. DMs and DB errors use {@link PREFIX}.
 */
export async function getGuildCommandPrefix(
  guildId: string | null,
): Promise<string> {
  if (!guildId) return PREFIX;

  const now = Date.now();
  const hit = cache.get(guildId);
  if (hit && hit.exp > now) return hit.prefix;

  try {
    const prisma = getBotPrisma();
    const row = await prisma.botGuildSettings.findUnique({
      where: { guildId },
    });
    const prefix = normalizeStoredPrefix(row?.commandPrefix);
    cache.set(guildId, { prefix, exp: now + CACHE_MS });
    return prefix;
  } catch {
    return PREFIX;
  }
}
