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
      "Knife Cash (global wallet), shop, house games, and transfers — virtual currency for fun.",
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
