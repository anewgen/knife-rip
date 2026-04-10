import { randomInt } from "crypto";
import { ecoM } from "../../lib/economy/custom-emojis";
import {
  WORK_COOLDOWN_MS,
  WORK_MAX,
  WORK_MIN,
  WORK_TREASURY_FEE_PCT,
} from "../../lib/economy/economy-tuning";
import { isGuildTextEconomyChannel } from "../../lib/economy/guild-economy-context";
import { formatCash } from "../../lib/economy/money";
import {
  creditTreasuryInTx,
  type LedgerReason,
} from "../../lib/economy/wallet";
import { getBotPrisma } from "../../lib/db-prisma";
import { errorEmbed, minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

export const workCommand: KnifeCommand = {
  name: "work",
  description: "Work for a small Knife Cash payout (long cooldown, treasury skim)",
  site: {
    categoryId: "gambling",
    categoryTitle: "Gambling & economy",
    categoryDescription:
      "Knife Cash (global wallet), shop, house games, and transfers — virtual currency for fun.",
    usage: ".work",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    if (!isGuildTextEconomyChannel(message)) {
      await message.reply({
        embeds: [
          errorEmbed("Run **`.work`** in a **server text channel** (not DMs)."),
        ],
      });
      return;
    }

    const uid = message.author.id;
    const prisma = getBotPrisma();
    const now = Date.now();

    try {
      const gross = BigInt(
        randomInt(Number(WORK_MIN), Number(WORK_MAX) + 1),
      );
      const fee =
        (gross * BigInt(WORK_TREASURY_FEE_PCT) + 99n) / 100n;
      const net = gross - fee;

      const { newCash } = await prisma.$transaction(async (tx) => {
        const u = await tx.economyUser.upsert({
          where: { discordUserId: uid },
          create: { discordUserId: uid },
          update: {},
        });
        if (u.lastWorkAt) {
          const elapsed = now - u.lastWorkAt.getTime();
          if (elapsed < WORK_COOLDOWN_MS) {
            throw new Error(
              `COOLDOWN:${u.lastWorkAt.getTime() + WORK_COOLDOWN_MS}`,
            );
          }
        }
        const next = u.cash + net;
        await tx.economyUser.update({
          where: { discordUserId: uid },
          data: { cash: next, lastWorkAt: new Date(now) },
        });
        await tx.economyLedger.create({
          data: {
            discordUserId: uid,
            delta: net,
            balanceAfter: next,
            reason: "work" satisfies LedgerReason,
            meta: { gross: gross.toString(), fee: fee.toString() },
          },
        });
        if (fee > 0n) {
          await creditTreasuryInTx(tx, {
            delta: fee,
            reason: "treasury_fee",
            meta: { kind: "work_fee", userId: uid },
            actorUserId: uid,
          });
        }
        return { newCash: next };
      });

      await message.reply({
        embeds: [
          minimalEmbed({
            title: `${ecoM.cash} Knife Cash — work`,
            description:
              `You earned **${formatCash(net)}** (gross **${formatCash(gross)}**, **${WORK_TREASURY_FEE_PCT}%** treasury fee).\n` +
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
              `You're still on break. Next shift <t:${nextAt}:R> (<t:${nextAt}:f>).`,
            ),
          ],
        });
        return;
      }
      throw e;
    }
  },
};
