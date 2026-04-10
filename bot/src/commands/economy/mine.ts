import { randomInt } from "crypto";
import { ecoM } from "../../lib/economy/custom-emojis";
import {
  GATHER_MAX,
  GATHER_MIN,
  MINE_COOLDOWN_MS,
} from "../../lib/economy/economy-tuning";
import { isGuildTextEconomyChannel } from "../../lib/economy/guild-economy-context";
import { formatCash } from "../../lib/economy/money";
import type { LedgerReason } from "../../lib/economy/wallet";
import { getBotPrisma } from "../../lib/db-prisma";
import { errorEmbed, minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

export const mineCommand: KnifeCommand = {
  name: "mine",
  description:
    "Knife Cash — gathering: mine ore (not the casino Mines game — use `.gamble` for that)",
  site: {
    categoryId: "gambling",
    categoryTitle: "Gambling & economy",
    categoryDescription:
      "Global Knife Cash — .gamble hub, shop, daily, work/crime/beg, bank & businesses, gathering (.mine / .fish), pets, pay, and guild .rob / .duel / .bounty. Virtual currency for fun.",
    usage: ".mine",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    if (!isGuildTextEconomyChannel(message)) {
      await message.reply({
        embeds: [
          errorEmbed("Run **`.mine`** in a **server text channel** (not DMs)."),
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
        if (u.lastMineAt) {
          const elapsed = now - u.lastMineAt.getTime();
          if (elapsed < MINE_COOLDOWN_MS) {
            throw new Error(
              `COOLDOWN:${u.lastMineAt.getTime() + MINE_COOLDOWN_MS}`,
            );
          }
        }
        const gain = BigInt(
          randomInt(Number(GATHER_MIN), Number(GATHER_MAX) + 1),
        );
        const next = u.cash + gain;
        await tx.economyUser.update({
          where: { discordUserId: uid },
          data: { cash: next, lastMineAt: new Date(now) },
        });
        await tx.economyLedger.create({
          data: {
            discordUserId: uid,
            delta: gain,
            balanceAfter: next,
            reason: "gather" satisfies LedgerReason,
            meta: { kind: "mine" },
          },
        });
        return { newCash: next, gain };
      });

      await message.reply({
        embeds: [
          minimalEmbed({
            title: `${ecoM.cash} Knife Cash — gathering (mine)`,
            description:
              `You mined **${formatCash(gain)}** ore.\n` +
              `_This is **not** the **Mines** casino game — open **\`.gamble\`** for that._\n` +
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
              `Pickaxe cooling down — <t:${nextAt}:R> (<t:${nextAt}:f>).`,
            ),
          ],
        });
        return;
      }
      throw e;
    }
  },
};
