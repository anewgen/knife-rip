const MENTION_COOLDOWN_MS = 5000;

/** `channelId:afkUserId` → last reply time */
const lastReplyAt = new Map<string, number>();

export function canReplyAfkMention(
  channelId: string,
  afkUserId: string,
): boolean {
  const key = `${channelId}:${afkUserId}`;
  const prev = lastReplyAt.get(key) ?? 0;
  return Date.now() - prev >= MENTION_COOLDOWN_MS;
}

export function markAfkMentionReplied(
  channelId: string,
  afkUserId: string,
): void {
  lastReplyAt.set(`${channelId}:${afkUserId}`, Date.now());
}
