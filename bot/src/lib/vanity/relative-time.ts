/** Discord-style relative labels matching common “vanity drop” UIs. */
export function formatVanityRelativeTime(at: Date): string {
  const sec = Math.floor((Date.now() - at.getTime()) / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? "a minute ago" : `${min} minutes ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? "an hour ago" : `${hr} hours ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return days === 1 ? "a day ago" : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
}
