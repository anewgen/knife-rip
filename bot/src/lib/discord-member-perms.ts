import type { GuildMember, Message } from "discord.js";

/**
 * Guild permission checks **without** bot-owner bypass.
 * Owners and developers follow the same rules as everyone else in a server
 * (prevents cross-server abuse of owner status for prefix, audit, command
 * rules, or nicknames). Owner-only tools stay on **.access**, **.handout**, etc.
 */
export async function guildMemberOrFetch(
  message: Message,
): Promise<GuildMember | null> {
  const g = message.guild;
  if (!g) return null;
  return (
    message.member ??
    (await g.members.fetch(message.author.id).catch(() => null))
  );
}

export async function hasGuildPermission(
  message: Message,
  permission: bigint,
): Promise<boolean> {
  const m = await guildMemberOrFetch(message);
  return m?.permissions.has(permission) ?? false;
}
