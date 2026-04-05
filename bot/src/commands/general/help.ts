import { minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

const COMMANDS_PAGE_URL = "https://knife.rip/commands";

export const helpCommand: KnifeCommand = {
  name: "help",
  aliases: ["h"],
  description: "Link to the full command list on the Knife site",
  site: {
    categoryId: "core",
    categoryTitle: "Core",
    categoryDescription: "Essential prefix commands.",
    usage: ".help",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    const commandsUrl = COMMANDS_PAGE_URL;
    const embed = minimalEmbed({
      title: "Knife commands",
      description:
        `Browse every documented command on the site:\n\n` +
        `**[Command list](${commandsUrl})**`,
    });
    await message.reply({ embeds: [embed] });
  },
};
