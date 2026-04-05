import type { Message, User } from "discord.js";
import { minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

async function resolveTargetUser(
  message: Message,
  args: string[],
): Promise<User> {
  const mentioned = message.mentions.users.first();
  if (mentioned) return mentioned;

  const raw = args[0]?.trim();
  if (raw && /^\d{17,20}$/.test(raw)) {
    try {
      return await message.client.users.fetch(raw);
    } catch {
      /* fall through */
    }
  }

  return message.author;
}

export const avatarCommand: KnifeCommand = {
  name: "avatar",
  aliases: ["av"],
  description: "Show a user’s avatar (mention, ID, or yourself)",
  site: {
    categoryId: "core",
    categoryTitle: "Core",
    categoryDescription: "Essential prefix commands.",
    usage: ".avatar [@user | user ID]",
    tier: "free",
    style: "prefix",
  },
  async run({ message, args }) {
    const user = await resolveTargetUser(message, args);
    const url = user.displayAvatarURL({ size: 512, extension: "png" });
    const embed = minimalEmbed({
      title: `Avatar — ${user.username}`,
      description: `**[Open full size](${url})**`,
      imageUrl: url,
    });
    await message.reply({ embeds: [embed] });
  },
};
