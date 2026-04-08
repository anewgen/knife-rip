/** @internal package is JSON array */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const rawWords = require("an-array-of-english-words") as string[];

const MAX_WORDS = 50_000;
const LEN_MIN = 1;
const LEN_MAX = 8;

let cached: string[] | null = null;

/**
 * Up to 50k unique slugs: a–z/0–9 only, length 1–8, shorter words first.
 */
export function getVanityWordList(): string[] {
  if (cached) return cached;
  const set = new Set<string>();
  for (const w of rawWords) {
    const s = String(w).toLowerCase().trim();
    if (s.length < LEN_MIN || s.length > LEN_MAX) continue;
    if (!/^[a-z0-9]+$/.test(s)) continue;
    set.add(s);
  }
  cached = [...set]
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .slice(0, MAX_WORDS);
  return cached;
}
