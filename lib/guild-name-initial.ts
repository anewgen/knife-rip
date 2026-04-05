/**
 * Fallback “icon” when a guild has no image: first letter of the name (or first char if no letters).
 */
export function guildNameInitial(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const letter = t.match(/\p{L}/u)?.[0];
  if (letter) return letter.toLocaleUpperCase();
  const first = [...t][0];
  return first ?? "?";
}
