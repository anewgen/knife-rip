import type { Message, User } from "discord.js";
import { minimalEmbed } from "../embeds";
import { formatAfkDuration } from "./format-duration";
import { canReplyAfkMention, markAfkMentionReplied } from "./mention-cooldown";
import { getAfkEntry, takeAfkEntry } from "./store";

function collectMentionedUsers(message: Message): User[] {
  const map = new Map<string, User>();
  for (const u of message.mentions.users.values()) {
    map.set(u.id, u);
  }
  const replied = message.mentions.repliedUser;
  if (replied) map.set(replied.id, replied);
  return [...map.values()];
}

/** If the author was AFK, clear and send “welcome back” with duration. */
export async function handleAfkAuthorReturn(message: Message): Promise<void> {
  if (!message.channel.isTextBased()) return;

  const guildId = message.guild?.id ?? null;
  const prev = takeAfkEntry(guildId, message.author.id);
  if (!prev) return;

  const duration = formatAfkDuration(Date.now() - prev.setAt);
  await message
    .reply({
      embeds: [
        minimalEmbed({
          title: "Welcome back",
          description: `You were away for **${duration}**.`,
        }),
      ],
      allowedMentions: { repliedUser: false },
    })
    .catch(() => {});
}

/**
 * Reply once per AFK user per channel cooldown when they’re mentioned / reply-pinged.
 */
export async function handleAfkMentionReplies(message: Message): Promise<void> {
  if (!message.channel.isTextBased()) return;
  if (!("id" in message.channel)) return;

  const channelId = message.channel.id;
  const guildId = message.guild?.id ?? null;

  const lines: string[] = [];

  for (const user of collectMentionedUsers(message)) {
    if (user.bot) continue;
    if (user.id === message.author.id) continue;

    const entry = getAfkEntry(guildId, user.id);
    if (!entry) continue;
    if (!canReplyAfkMention(channelId, user.id)) continue;

    markAfkMentionReplied(channelId, user.id);
    const duration = formatAfkDuration(Date.now() - entry.setAt);
    lines.push(
      `**${user.username}** is AFK — **${entry.reason}** (${duration})`,
    );
  }

  if (lines.length === 0) return;

  await message
    .reply({
      embeds: [
        minimalEmbed({
          title: "AFK",
          description: lines.join("\n").slice(0, 4096),
        }),
      ],
      allowedMentions: { repliedUser: false },
    })
    .catch(() => {});
}
