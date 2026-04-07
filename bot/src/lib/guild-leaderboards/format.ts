const MEDALS = ["🥇", "🥈", "🥉"] as const;

export function medalForRank(rankIndex: number): string {
  return MEDALS[rankIndex] ?? `**${rankIndex + 1}.**`;
}

export function formatVoiceSeconds(total: bigint): string {
  if (total <= BigInt(0)) return "0s";
  let remaining = total;
  const d = remaining / BigInt(86400);
  remaining %= BigInt(86400);
  const h = remaining / BigInt(3600);
  remaining %= BigInt(3600);
  const m = remaining / BigInt(60);
  const s = remaining % BigInt(60);
  const parts: string[] = [];
  if (d > BigInt(0)) parts.push(`${d}d`);
  if (h > BigInt(0)) parts.push(`${h}h`);
  if (m > BigInt(0)) parts.push(`${m}m`);
  if (s > BigInt(0)) parts.push(`${s}s`);
  return parts.join(" ") || "0s";
}

export function formatMessageCount(n: number): string {
  return n.toLocaleString("en-US");
}
