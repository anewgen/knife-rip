import type { Client } from "discord.js";
import type { PrismaClient } from "@prisma/client";

function isRateLimited(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  if ("status" in e && Number((e as { status: unknown }).status) === 429) {
    return true;
  }
  if ("code" in e && Number((e as { code: unknown }).code) === 429) {
    return true;
  }
  const name = "name" in e ? String((e as { name: unknown }).name) : "";
  return name.includes("RateLimit") || name.includes("TooManyRequests");
}

export type VanityProbeResult = {
  valid: boolean;
  guildName: string | null;
  guildId: string | null;
};

/**
 * Fetch invite for `code` and merge into `VanityInviteObservation` (valid → invalid sets `droppedAt`).
 */
export async function recordVanityProbe(
  prisma: PrismaClient,
  client: Client,
  code: string,
): Promise<VanityProbeResult> {
  const normalized = code.trim().toLowerCase();
  const prev = await prisma.vanityInviteObservation.findUnique({
    where: { code: normalized },
  });
  const wasValid = prev?.wasValid ?? false;

  let valid = false;
  let guildId: string | null = null;
  let guildName: string | null = null;

  try {
    const inv = await client.fetchInvite(normalized);
    valid = Boolean(inv.guild);
    guildId = inv.guild?.id ?? null;
    guildName = inv.guild?.name ?? null;
  } catch (e) {
    if (isRateLimited(e)) throw e;
    valid = false;
  }

  if (valid) {
    await prisma.vanityInviteObservation.upsert({
      where: { code: normalized },
      create: {
        code: normalized,
        wasValid: true,
        guildId,
        guildName,
        lastCheckedAt: new Date(),
        firstSeenValidAt: new Date(),
        droppedAt: null,
      },
      update: {
        wasValid: true,
        guildId,
        guildName,
        lastCheckedAt: new Date(),
        firstSeenValidAt: prev?.firstSeenValidAt ?? new Date(),
        droppedAt: null,
      },
    });
  } else {
    const transitioned = wasValid === true;
    await prisma.vanityInviteObservation.upsert({
      where: { code: normalized },
      create: {
        code: normalized,
        wasValid: false,
        guildId: null,
        guildName: null,
        lastCheckedAt: new Date(),
        firstSeenValidAt: null,
        droppedAt: null,
      },
      update: {
        wasValid: false,
        guildId: null,
        guildName: null,
        lastCheckedAt: new Date(),
        firstSeenValidAt: prev?.firstSeenValidAt ?? null,
        droppedAt: transitioned ? new Date() : (prev?.droppedAt ?? null),
      },
    });
  }

  return { valid, guildName, guildId };
}
