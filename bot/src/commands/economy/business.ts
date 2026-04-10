import { ecoM } from "../../lib/economy/custom-emojis";
import { applyBankInterestIfAny } from "../../lib/economy/bank-touch";
import { computeBusinessAccrued } from "../../lib/economy/business-accrual";
import {
  BUSINESS_BASE_PRICES,
  BUSINESS_KEYS,
  BUSINESS_PURCHASE_TAX_PCT,
  type BusinessKey,
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

function isBusinessKey(s: string): s is BusinessKey {
  return (BUSINESS_KEYS as readonly string[]).includes(s);
}

export const businessCommand: KnifeCommand = {
  name: "business",
  description:
    "Passive Knife Cash businesses — **`.business buy`**, **`.business collect`**, **`.business list`**",
  site: {
    categoryId: "gambling",
    categoryTitle: "Gambling & economy",
    categoryDescription:
      "Global Knife Cash — .gamble hub, shop, daily, work/crime/beg, bank & businesses, gathering (.mine / .fish), pets, pay, and guild .rob / .duel / .bounty. Virtual currency for fun.",
    usage: ".business buy <id> · .business collect · .business list",
    tier: "free",
    style: "prefix",
  },
  async run({ message, args }) {
    if (!isGuildTextEconomyChannel(message)) {
      await message.reply({
        embeds: [
          errorEmbed(
            "Run **`.business`** in a **server text channel** (not DMs).",
          ),
        ],
      });
      return;
    }

    const uid = message.author.id;
    const prisma = getBotPrisma();
    const now = Date.now();
    const sub = args[0]?.toLowerCase();

    if (!sub || sub === "list") {
      const slots = await prisma.economyBusinessSlot.findMany({
        where: { ownerId: uid },
      });
      const lines = BUSINESS_KEYS.map((k) => {
        const slot = slots.find((s) => s.businessKey === k);
        const base = BUSINESS_BASE_PRICES[k];
        return slot
          ? `• **${k}** — tier **${slot.tier}** (last collected <t:${Math.floor(slot.lastCollectedAt.getTime() / 1000)}:R>)`
          : `• **${k}** — _not owned_ (from **${formatCash(base)}**)`;
      });
      await message.reply({
        embeds: [
          minimalEmbed({
            title: `${ecoM.cash} Knife Cash — businesses`,
            description:
              lines.join("\n") +
              `\n\nRates accrue up to **48h** per collect. Keys: **${BUSINESS_KEYS.join("**, **")}**.`,
          }),
        ],
      });
      return;
    }

    if (sub === "buy") {
      const keyRaw = args[1]?.toLowerCase();
      if (!keyRaw || !isBusinessKey(keyRaw)) {
        await message.reply({
          embeds: [
            errorEmbed(
              `Specify a business: **${BUSINESS_KEYS.join("**, **")}**.`,
            ),
          ],
        });
        return;
      }

      try {
        const res = await prisma.$transaction(async (tx) => {
          await applyBankInterestIfAny(tx, uid, now);
          const existing = await tx.economyBusinessSlot.findUnique({
            where: {
              ownerId_businessKey: { ownerId: uid, businessKey: keyRaw },
            },
          });
          if (existing) throw new Error("OWNED");
          const tier = 1;
          const price =
            BUSINESS_BASE_PRICES[keyRaw] * BigInt(tier);
          const tax =
            (price * BigInt(BUSINESS_PURCHASE_TAX_PCT) + 99n) / 100n;
          const total = price + tax;
          const u = await tx.economyUser.findUnique({
            where: { discordUserId: uid },
          });
          if (!u || u.cash < total) throw new Error("POOR");
          const cashAfter = u.cash - total;
          await tx.economyUser.update({
            where: { discordUserId: uid },
            data: { cash: cashAfter },
          });
          await tx.economyLedger.create({
            data: {
              discordUserId: uid,
              delta: -total,
              balanceAfter: cashAfter,
              reason: "business" satisfies LedgerReason,
              meta: { op: "buy", key: keyRaw, price: price.toString(), tax: tax.toString() },
            },
          });
          if (tax > 0n) {
            await creditTreasuryInTx(tx, {
              delta: tax,
              reason: "treasury_fee",
              meta: { kind: "business_tax", userId: uid, key: keyRaw },
              actorUserId: uid,
            });
          }
          await tx.economyBusinessSlot.create({
            data: {
              ownerId: uid,
              businessKey: keyRaw,
              tier,
              lastCollectedAt: new Date(now),
            },
          });
          return { cashAfter, price, tax };
        });

        await message.reply({
          embeds: [
            minimalEmbed({
              title: `${ecoM.cash} Business purchased`,
              description:
                `You bought **${keyRaw}** for **${formatCash(res.price)}** + **${formatCash(res.tax)}** tax.\n` +
                `Balance: **${formatCash(res.cashAfter)}**.`,
            }),
          ],
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "OWNED") {
          await message.reply({
            embeds: [errorEmbed("You already own that business.")],
          });
          return;
        }
        if (msg === "POOR") {
          await message.reply({
            embeds: [errorEmbed("Not enough cash (price + purchase tax).")],
          });
          return;
        }
        throw e;
      }
      return;
    }

    if (sub === "collect") {
      try {
        const { total, lines } = await prisma.$transaction(async (tx) => {
          await applyBankInterestIfAny(tx, uid, now);
          const slots = await tx.economyBusinessSlot.findMany({
            where: { ownerId: uid },
          });
          let gain = 0n;
          const lines: string[] = [];
          const nowD = new Date(now);
          for (const s of slots) {
            if (!isBusinessKey(s.businessKey)) continue;
            const acc = computeBusinessAccrued(
              s.businessKey,
              s.tier,
              s.lastCollectedAt,
              now,
            );
            if (acc > 0n) {
              gain += acc;
              lines.push(`**${s.businessKey}** +**${formatCash(acc)}**`);
              await tx.economyBusinessSlot.update({
                where: { id: s.id },
                data: { lastCollectedAt: nowD },
              });
            }
          }
          if (gain <= 0n) return { total: 0n, lines: [] as string[] };
          const u = await tx.economyUser.findUnique({
            where: { discordUserId: uid },
          });
          if (!u) throw new Error("NOUSER");
          const cashAfter = u.cash + gain;
          await tx.economyUser.update({
            where: { discordUserId: uid },
            data: { cash: cashAfter },
          });
          await tx.economyLedger.create({
            data: {
              discordUserId: uid,
              delta: gain,
              balanceAfter: cashAfter,
              reason: "business" satisfies LedgerReason,
              meta: { op: "collect" },
            },
          });
          return { total: gain, lines };
        });

        await message.reply({
          embeds: [
            minimalEmbed({
              title: `${ecoM.cash} Business income`,
              description:
                total > 0n
                  ? `Collected **${formatCash(total)}**.\n${lines.join("\n")}`
                  : "Nothing accrued yet — wait a bit and try again.",
            }),
          ],
        });
      } catch (e) {
        throw e;
      }
      return;
    }

    await message.reply({
      embeds: [
        errorEmbed(
          "Unknown subcommand. Use **`.business list`**, **`.business buy <id>`**, or **`.business collect`**.",
        ),
      ],
    });
  },
};
