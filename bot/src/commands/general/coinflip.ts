import { minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

export const coinflipCommand: KnifeCommand = {
  name: "coinflip",
  aliases: ["flip", "cf"],
  description: "Flip a coin — Heads or Tails",
  site: {
    categoryId: "utility",
    categoryTitle: "Utility",
    categoryDescription: "Quick tools and light fun.",
    usage: ".coinflip",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    const heads = Math.random() < 0.5;
    const label = heads ? "Heads" : "Tails";
    await message.reply({
      embeds: [
        minimalEmbed({
          title: `🪙 ${label}`,
          description: `You got **${label}**.`,
        }),
      ],
    });
  },
};
