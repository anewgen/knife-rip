import type { Client, GuildMember } from "discord.js";
import { getBotPrisma } from "../db-prisma";
import { economyPayoutMultiplier } from "./boost";
import {
  GAMBLE_MULT_MAX,
  PET_GAMBLE_BONUS_MAX,
  PET_GAMBLE_BONUS_PER_STEP,
  PET_GAMBLE_BONUS_XP_STEP,
} from "./economy-tuning";

function petGambleBonusFromXp(xp: number): number {
  const steps = Math.floor(xp / PET_GAMBLE_BONUS_XP_STEP);
  return Math.min(PET_GAMBLE_BONUS_MAX, steps * PET_GAMBLE_BONUS_PER_STEP);
}

/**
 * House-game payout multiplier: Nitro/Pro boost eligibility + equipped pet bonus, hard-clamped.
 */
export async function resolvePayoutMultiplier(params: {
  userId: string;
  member: GuildMember | null;
  client: Client;
}): Promise<number> {
  const { userId, member, client } = params;
  const base = await economyPayoutMultiplier(member, userId, client);

  const prisma = getBotPrisma();
  const equipped = await prisma.economyPet.findFirst({
    where: { ownerId: userId, equipped: true },
    select: { xp: true },
  });
  const petBonus = equipped ? petGambleBonusFromXp(equipped.xp) : 0;
  const combined = base + petBonus;
  return Math.min(GAMBLE_MULT_MAX, combined);
}
