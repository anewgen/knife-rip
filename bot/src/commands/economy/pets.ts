import {
  buildPetMenuEmbed,
  buildPetMenuRows,
  loadPetPage,
} from "../../lib/economy/pet-menu";
import { isGuildTextEconomyChannel } from "../../lib/economy/guild-economy-context";
import { errorEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

export const petsCommand: KnifeCommand = {
  name: "pets",
  description: "Knife Cash pets — button menu (equip / feed)",
  site: {
    categoryId: "gambling",
    categoryTitle: "Gambling & economy",
    categoryDescription:
      "Global Knife Cash — .gamble hub, shop, daily, work/crime/beg, bank & businesses, gathering (.mine / .fish), pets, pay, and guild .rob / .duel / .bounty. Virtual currency for fun.",
    usage: ".pets",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    if (!isGuildTextEconomyChannel(message)) {
      await message.reply({
        embeds: [
          errorEmbed("Run **`.pets`** in a **server text channel** (not DMs)."),
        ],
      });
      return;
    }

    const uid = message.author.id;
    const page = 0;
    const { pets, total } = await loadPetPage(uid, page);
    await message.reply({
      content: `<@${uid}>`,
      embeds: [buildPetMenuEmbed({ ownerId: uid, page, total, pets })],
      components: buildPetMenuRows({ ownerId: uid, page, total, pets }),
      allowedMentions: { users: [uid] },
    });
  },
};
