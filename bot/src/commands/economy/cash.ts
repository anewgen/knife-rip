import { resolvePayoutMultiplier } from "../../lib/economy/payout-multiplier";
import { ecoM } from "../../lib/economy/custom-emojis";
import { formatCash } from "../../lib/economy/money";
import { getCash } from "../../lib/economy/wallet";
import { minimalEmbed } from "../../lib/embeds";
import { resolveTargetUser } from "../../lib/resolve-target-user";
import type { KnifeCommand } from "../types";

export const cashCommand: KnifeCommand = {
  name: "cash",
  aliases: ["bal", "balance", "wallet"],
  description: "Show Knife Cash balance for you or another user (global wallet)",
  site: {
    categoryId: "gambling",
    categoryTitle: "Gambling & economy",
    categoryDescription:
      "Knife Cash (global wallet), shop, house games, and transfers — virtual currency for fun.",
    usage: ".cash · .bal [@user | ID]",
    tier: "free",
    style: "prefix",
  },
  async run({ message, args }) {
    const target = await resolveTargetUser(message, args);
    const bal = await getCash(target.id);
    const member =
      message.guild?.members.cache.get(target.id) ??
      (await message.guild?.members.fetch(target.id).catch(() => null));
    const mult = await resolvePayoutMultiplier({
      userId: target.id,
      member: member ?? null,
      client: message.client,
    });
    const bonus = mult > 1.001;
    const title =
      target.id === message.author.id
        ? `${ecoM.wallet} Your wallet`
        : `${ecoM.wallet} ${target.username}`;
    await message.reply({
      embeds: [
        minimalEmbed({
          title,
          description:
            `${ecoM.wallet} **Balance:** **${formatCash(bal)}** cash\n` +
            (bonus
              ? `${ecoM.booster} **×${mult.toFixed(2)}** payout on wins & milestones (boost / Pro / equipped pet, capped).`
              : `${ecoM.tablerinfosquarefilled} Boost, **Knife Pro**, or an equipped **pet** raise payouts (capped).`),
        }),
      ],
    });
  },
};
