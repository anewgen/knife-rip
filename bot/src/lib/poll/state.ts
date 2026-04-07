export type PollState = {
  pollId: string;
  messageId: string;
  channelId: string;
  guildId: string;
  authorId: string;
  question: string;
  options: string[];
  /** Discord user id → option index */
  votes: Map<string, number>;
  closed: boolean;
};

const byPollId = new Map<string, PollState>();
const byMessageId = new Map<string, PollState>();

export function registerPollState(state: PollState): void {
  byPollId.set(state.pollId, state);
  byMessageId.set(state.messageId, state);
}

export function getPollByPollId(id: string): PollState | undefined {
  return byPollId.get(id);
}

export function getPollByMessageId(id: string): PollState | undefined {
  return byMessageId.get(id);
}
