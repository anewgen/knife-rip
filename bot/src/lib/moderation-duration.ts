/** Discord max communication disable: 28 days */
export const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

/**
 * Parse duration like `10`, `10m`, `90s`, `2h`, `1d`, `1w`. Bare number = minutes.
 * Clamped to {@link MAX_TIMEOUT_MS}.
 */
export function parseModerationDuration(raw: string): number | null {
  const t = raw.trim().toLowerCase();
  const m = /^(\d+)\s*([smhdw])?$/i.exec(t);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = (m[2] ?? "m").toLowerCase();
  let ms: number;
  switch (unit) {
    case "s":
      ms = n * 1000;
      break;
    case "m":
      ms = n * 60 * 1000;
      break;
    case "h":
      ms = n * 60 * 60 * 1000;
      break;
    case "d":
      ms = n * 24 * 60 * 60 * 1000;
      break;
    case "w":
      ms = n * 7 * 24 * 60 * 60 * 1000;
      break;
    default:
      return null;
  }
  return Math.min(ms, MAX_TIMEOUT_MS);
}

export function describeDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86400_000) return `${Math.round(ms / 3600_000)}h`;
  return `${Math.round(ms / 86400_000)}d`;
}
