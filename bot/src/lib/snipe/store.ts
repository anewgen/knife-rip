/** In-memory only; entries expire after this TTL. */
export const SNIPE_TTL_MS = 10 * 60 * 1000;

export type DeleteSnipe = {
  kind: "delete";
  authorId: string;
  authorTag: string;
  content: string;
  attachmentCount: number;
  messageId: string;
  at: number;
};

export type EditSnipe = {
  kind: "edit";
  authorId: string;
  authorTag: string;
  before: string;
  after: string;
  messageId: string;
  at: number;
};

export type ReactionSnipe = {
  kind: "reaction";
  emojiDisplay: string;
  removerId: string;
  removerTag: string;
  messageId: string;
  messageAuthorTag: string;
  at: number;
};

function isFresh(at: number): boolean {
  return Date.now() - at < SNIPE_TTL_MS;
}

const deleteMap = new Map<string, DeleteSnipe>();
const editMap = new Map<string, EditSnipe>();
const reactionMap = new Map<string, ReactionSnipe>();

export function recordDeleteSnipe(channelId: string, data: Omit<DeleteSnipe, "kind">) {
  deleteMap.set(channelId, { kind: "delete", ...data });
}

export function recordEditSnipe(channelId: string, data: Omit<EditSnipe, "kind">) {
  editMap.set(channelId, { kind: "edit", ...data });
}

export function recordReactionSnipe(
  channelId: string,
  data: Omit<ReactionSnipe, "kind">,
) {
  reactionMap.set(channelId, { kind: "reaction", ...data });
}

export function getDeleteSnipe(channelId: string): DeleteSnipe | null {
  const v = deleteMap.get(channelId);
  if (!v || !isFresh(v.at)) {
    if (v) deleteMap.delete(channelId);
    return null;
  }
  return v;
}

export function getEditSnipe(channelId: string): EditSnipe | null {
  const v = editMap.get(channelId);
  if (!v || !isFresh(v.at)) {
    if (v) editMap.delete(channelId);
    return null;
  }
  return v;
}

export function getReactionSnipe(channelId: string): ReactionSnipe | null {
  const v = reactionMap.get(channelId);
  if (!v || !isFresh(v.at)) {
    if (v) reactionMap.delete(channelId);
    return null;
  }
  return v;
}
