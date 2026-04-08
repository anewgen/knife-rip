/** Normalize a discord.gg / invite URL / raw slug for lookup. */
export function parseVanityInviteCode(raw: string): string | null {
  const t = raw.trim();
  const fromUrl =
    /(?:discord\.gg\/|discordapp\.com\/invite\/|discord\.com\/invite\/)([a-z0-9-]+)/i.exec(
      t,
    );
  if (fromUrl) return fromUrl[1]!.toLowerCase();
  if (/^[a-z0-9-]{1,32}$/i.test(t)) return t.toLowerCase();
  return null;
}
