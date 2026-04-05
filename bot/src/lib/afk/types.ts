export type AfkEntry = {
  userId: string;
  guildId: string | null;
  reason: string;
  /** `Date.now()` when AFK was set */
  setAt: number;
};
