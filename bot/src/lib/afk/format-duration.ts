/**
 * Human-readable duration (e.g. "5 seconds", "2 hours", "1 day").
 */
export function formatAfkDuration(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) {
    return `${sec} second${sec === 1 ? "" : "s"}`;
  }
  const min = Math.floor(sec / 60);
  if (min < 60) {
    return `${min} minute${min === 1 ? "" : "s"}`;
  }
  const hr = Math.floor(min / 60);
  if (hr < 48) {
    const remMin = min % 60;
    if (remMin > 0) {
      return `${hr} hour${hr === 1 ? "" : "s"} ${remMin} minute${remMin === 1 ? "" : "s"}`;
    }
    return `${hr} hour${hr === 1 ? "" : "s"}`;
  }
  const days = Math.floor(hr / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}
