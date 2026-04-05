import { PermissionFlagsBits } from "discord.js";
import { errorEmbed, minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

const MAX_LEN = 2000;

function parseChannelSnowflake(raw: string | undefined): string | null {
  if (!raw) return null;
  const mention = raw.match(/^<#(\d{17,20})>$/);
  if (mention) return mention[1];
  if (/^\d{17,20}$/.test(raw)) return raw;
  return null;
}

export const sayCommand: KnifeCommand = {
  name: "say",
  description:
    "Post a message as the bot in a channel (requires Administrator)",
  site: {
    categoryId: "moderation",
    categoryTitle: "Moderation",
    categoryDescription: "Server staff tools.",
    usage: ".say #channel your message",
    tier: "free",
    style: "prefix",
  },
  async run({ message, args }) {
    if (!message.guild || !message.member) {
      await message.reply({
        embeds: [errorEmbed("**.say** only works in a server.")],
      });
      return;
    }

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply({
        embeds: [
          errorEmbed(
            "You need **Administrator** permission to use **.say**.",
          ),
        ],
      });
      return;
    }

    const channelId = parseChannelSnowflake(args[0]);
    const text = args.slice(1).join(" ").trim();

    if (!channelId || !text) {
      await message.reply({
        embeds: [
          errorEmbed(
            "Usage: **.say** `<#channel>` `message…` (or a channel ID)",
          ),
        ],
      });
      return;
    }

    if (text.length > MAX_LEN) {
      await message.reply({
        embeds: [
          errorEmbed(`Message is too long (max **${MAX_LEN}** characters).`),
        ],
      });
      return;
    }

    const ch = await message.guild.channels.fetch(channelId).catch(() => null);

    if (!ch?.isTextBased() || ch.isDMBased()) {
      await message.reply({
        embeds: [
          errorEmbed(
            "That channel was not found or is not a text-based channel in this server.",
          ),
        ],
      });
      return;
    }

    if (!ch.isSendable()) {
      await message.reply({
        embeds: [
          errorEmbed(
            "I cannot send messages there (permissions, forum parent, or archived thread).",
          ),
        ],
      });
      return;
    }

    const me = message.guild.members.me;
    const botPerms = me ? ch.permissionsFor(me) : null;
    if (!botPerms?.has(PermissionFlagsBits.SendMessages)) {
      await message.reply({
        embeds: [
          errorEmbed(
            `I do not have **Send Messages** in ${ch}.`,
          ),
        ],
      });
      return;
    }

    try {
      await ch.send({ content: text });
    } catch {
      await message.reply({
        embeds: [
          errorEmbed(
            "Failed to send the message. Check slow mode, age restrictions, and channel settings.",
          ),
        ],
      });
      return;
    }

    await message.reply({
      embeds: [
        minimalEmbed({
          title: "Sent",
          description: `Posted in ${ch}.`,
        }),
      ],
    });
  },
};
