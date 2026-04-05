import type { Message, User } from "discord.js";

export async function resolveTargetUser(
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
