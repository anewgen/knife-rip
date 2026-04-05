import type { AfkEntry } from "./types";

const MAX_REASON_LEN = 200;

const store = new Map<string, AfkEntry>();

function storeKey(guildId: string | null, userId: string): string {
  return `${guildId ?? "dm"}:${userId}`;
}

export function setAfkEntry(
  guildId: string | null,
  userId: string,
  reason: string,
): void {
  const trimmed = reason.trim().slice(0, MAX_REASON_LEN) || "AFK";
  store.set(storeKey(guildId, userId), {
    userId,
    guildId,
    reason: trimmed,
    setAt: Date.now(),
  });
}

export function getAfkEntry(
  guildId: string | null,
  userId: string,
): AfkEntry | undefined {
  return store.get(storeKey(guildId, userId));
}

/** Remove and return the entry if it existed. */
export function takeAfkEntry(
  guildId: string | null,
  userId: string,
): AfkEntry | undefined {
  const k = storeKey(guildId, userId);
  const v = store.get(k);
  if (v) store.delete(k);
  return v;
}

export function clearAfkEntry(
  guildId: string | null,
  userId: string,
): boolean {
  return store.delete(storeKey(guildId, userId));
}
