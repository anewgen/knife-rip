import type { Message } from "discord.js";

/** PvP / expansion economy commands: guild text channels only (not DMs). */
export function isGuildTextEconomyChannel(message: Message): boolean {
  const ch = message.channel;
  return Boolean(
    message.guild &&
      ch.isTextBased() &&
      !ch.isDMBased() &&
      "id" in ch,
  );
}
