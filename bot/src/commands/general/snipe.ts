import { EmbedBuilder } from "discord.js";
import { errorEmbed } from "../../lib/embeds";
import {
  SNIPE_TTL_MS,
  getDeleteSnipe,
  getEditSnipe,
  getReactionSnipe,
} from "../../lib/snipe/store";
import type { KnifeCommand } from "../types";

const DESC_MAX = 3800;

function relTs(ms: number): string {
  return `<t:${Math.floor(ms / 1000)}:R>`;
}

function clipText(s: string, max = 1000): string {
  const t = s.trim();
  if (!t) return "*[empty]*";
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function footer(): string {
  return `Snipes expire after ${SNIPE_TTL_MS / 60000} minutes · Bots ignored · Not stored on disk`;
}

export const snipeCommand: KnifeCommand = {
  name: "snipe",
  aliases: ["s"],
  description: "Show the last deleted message in this channel (if the bot saw it)",
  site: {
    categoryId: "utility",
    categoryTitle: "Utility",
    categoryDescription: "Quick tools and light fun.",
    usage: ".snipe · .s",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    if (!message.guild) {
      await message.reply({
        embeds: [errorEmbed("Use **.snipe** in a server channel.")],
      });
      return;
    }

    const data = getDeleteSnipe(message.channel.id);
    if (!data) {
      await message.reply({
        embeds: [
          errorEmbed(
            "Nothing to snipe — no recent deletes here, or the bot didn’t cache that message.",
          ),
        ],
      });
      return;
    }

    const attach =
      data.attachmentCount > 0
        ? `\n**Attachments:** ${data.attachmentCount} (not shown)`
        : "";

    const desc = (
      `**Author:** ${data.authorTag} (<@${data.authorId}>)\n` +
      `**Deleted** ${relTs(data.at)}\n\n` +
      `${clipText(data.content, 1800)}${attach}`
    ).slice(0, DESC_MAX);

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Last deleted message")
          .setDescription(desc)
          .setColor(0x2b2d31)
          .setFooter({ text: footer() }),
      ],
    });
  },
};

export const esnipeCommand: KnifeCommand = {
  name: "esnipe",
  aliases: ["es", "editsnipe"],
  description: "Show the last edited message (before → after) in this channel",
  site: {
    categoryId: "utility",
    categoryTitle: "Utility",
    categoryDescription: "Quick tools and light fun.",
    usage: ".esnipe · .es · .editsnipe",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    if (!message.guild) {
      await message.reply({
        embeds: [errorEmbed("Use **.esnipe** in a server channel.")],
      });
      return;
    }

    const data = getEditSnipe(message.channel.id);
    if (!data) {
      await message.reply({
        embeds: [errorEmbed("Nothing to esnipe — no recent edits recorded here.")],
      });
      return;
    }

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Last edited message")
          .setDescription(
            `**Author:** ${data.authorTag} (<@${data.authorId}>)\n` +
              `**Message ID:** \`${data.messageId}\` · **Edited** ${relTs(data.at)}`,
          )
          .addFields(
            {
              name: "Before",
              value: clipText(data.before, 1024),
            },
            {
              name: "After",
              value: clipText(data.after, 1024),
            },
          )
          .setColor(0x2b2d31)
          .setFooter({ text: footer() }),
      ],
    });
  },
};

export const rsnipeCommand: KnifeCommand = {
  name: "rsnipe",
  aliases: ["rs", "reactionsnipe"],
  description: "Show the last reaction removed in this channel (emoji + who removed it)",
  site: {
    categoryId: "utility",
    categoryTitle: "Utility",
    categoryDescription: "Quick tools and light fun.",
    usage: ".rsnipe · .rs · .reactionsnipe",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    if (!message.guild) {
      await message.reply({
        embeds: [errorEmbed("Use **.rsnipe** in a server channel.")],
      });
      return;
    }

    const data = getReactionSnipe(message.channel.id);
    if (!data) {
      await message.reply({
        embeds: [
          errorEmbed(
            "Nothing to rsnipe — no reaction removals recorded (enable **Message Content** + **Message Reactions** intent if missing).",
          ),
        ],
      });
      return;
    }

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Last reaction removed")
          .setDescription(
            `**Emoji:** ${data.emojiDisplay}\n` +
              `**Removed by:** ${data.removerTag} (<@${data.removerId}>)\n` +
              `**Message author:** ${data.messageAuthorTag}\n` +
              `**Message ID:** \`${data.messageId}\`\n` +
              `**When:** ${relTs(data.at)}`,
          )
          .setColor(0x2b2d31)
          .setFooter({ text: footer() }),
      ],
    });
  },
};
