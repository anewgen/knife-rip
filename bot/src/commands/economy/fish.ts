import { randomInt } from "crypto";
import { ecoM } from "../../lib/economy/custom-emojis";
import {
  FISH_COOLDOWN_MS,
  GATHER_MAX,
  GATHER_MIN,
} from "../../lib/economy/economy-tuning";
import { isGuildTextEconomyChannel } from "../../lib/economy/guild-economy-context";
import { formatCash } from "../../lib/economy/money";
import type { LedgerReason } from "../../lib/economy/wallet";
import { getBotPrisma } from "../../lib/db-prisma";
import { errorEmbed, minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

export const fishCommand: KnifeCommand = {
  name: "fish",
  description: "Knife Cash — gathering: fish for small payouts (separate cooldown from `.mine`)",
  site: {
    categoryId: "gambling",
    categoryTitle: "Gambling & economy",
    categoryDescription:
      "Global Knife Cash — .gamble hub, shop, daily, work/crime/beg, bank & businesses, gathering (.mine / .fish), pets, pay, and guild .rob / .duel / .bounty. Virtual currency for fun.",
    usage: ".fish",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    if (!isGuildTextEconomyChannel(message)) {
      await message.reply({
        embeds: [
          errorEmbed("Run **`.fish`** in a **server text channel** (not DMs)."),
        ],
      });
      return;
    }

    const uid = message.author.id;
    const prisma = getBotPrisma();
    const now = Date.now();

    try {
      const { newCash, gain } = await prisma.$transaction(async (tx) => {
        const u = await tx.economyUser.upsert({
          where: { discordUserId: uid },
          create: { discordUserId: uid },
          update: {},
        });
        if (u.lastFishAt) {
          const elapsed = now - u.lastFishAt.getTime();
          if (elapsed < FISH_COOLDOWN_MS) {
            throw new Error(
              `COOLDOWN:${u.lastFishAt.getTime() + FISH_COOLDOWN_MS}`,
            );
          }
        }
        const gain = BigInt(
          randomInt(Number(GATHER_MIN), Number(GATHER_MAX) + 1),
        );
        const next = u.cash + gain;
        await tx.economyUser.update({
          where: { discordUserId: uid },
          data: { cash: next, lastFishAt: new Date(now) },
        });
        await tx.economyLedger.create({
          data: {
            discordUserId: uid,
            delta: gain,
            balanceAfter: next,
            reason: "gather" satisfies LedgerReason,
            meta: { kind: "fish" },
          },
        });
        return { newCash: next, gain };
      });

      await message.reply({
        embeds: [
          minimalEmbed({
            title: `${ecoM.cash} Knife Cash — gathering (fish)`,
            description:
              `You caught fish worth **${formatCash(gain)}**.\n` +
              `Balance: **${formatCash(newCash)}**.`,
          }),
        ],
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.startsWith("COOLDOWN:")) {
        const nextAt = Math.floor(Number(msg.split(":")[1]!) / 1000);
        await message.reply({
          embeds: [
            errorEmbed(
              `Waters need a rest — <t:${nextAt}:R> (<t:${nextAt}:f>).`,
            ),
          ],
        });
        return;
      }
      throw e;
    }
  },
};
