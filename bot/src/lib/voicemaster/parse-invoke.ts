/**
 * Glue-style invocations: `.voicemastersetup`, `.vmjoinrole`, `.vmnamehello`, …
 * Anything after the matched subcommand tokens is one trailing argument string (for `name`, etc.).
 */

const COMPOUND_GLUES: { glue: string; tokens: string[] }[] = [
  { glue: "categoryprivate", tokens: ["category", "private"] },
  { glue: "joinrole", tokens: ["join", "role"] },
  { glue: "defaultinterface", tokens: ["default", "interface"] },
  { glue: "defaultrole", tokens: ["default", "role"] },
  { glue: "defaultbitrate", tokens: ["default", "bitrate"] },
  { glue: "defaultname", tokens: ["default", "name"] },
  { glue: "defaultregion", tokens: ["default", "region"] },
  { glue: "sendinterface", tokens: ["sendinterface"] },
].sort((a, b) => b.glue.length - a.glue.length);

const SINGLE_GLUES: string[] = [
  "configuration",
  "transfer",
  "limit",
  "bitrate",
  "status",
  "permit",
  "reject",
  "category",
  "default",
  "unlock",
  "unghost",
  "ghost",
  "claim",
  "music",
  "lock",
  "setup",
  "reset",
  "help",
  "join",
  "role",
  "name",
].sort((a, b) => b.length - a.length);

function parseGluedBody(gluedLower: string, gluedOriginal: string): string[] {
  const out: string[] = [];
  let pos = 0;
  const n = gluedLower.length;

  while (pos < n) {
    let matched = false;
    const sliceLower = gluedLower.slice(pos);
    const sliceOrig = gluedOriginal.slice(pos);

    for (const c of COMPOUND_GLUES) {
      if (sliceLower.startsWith(c.glue)) {
        out.push(...c.tokens);
        pos += c.glue.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const s of SINGLE_GLUES) {
      if (sliceLower.startsWith(s)) {
        out.push(s);
        pos += s.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const rest = sliceOrig.trim();
    if (rest.length > 0) {
      out.push(rest);
    }
    break;
  }

  return out;
}

/**
 * If `without` is a glued `.voicemaster*` / `.vm*` single token, return args for the voicemaster command.
 * Otherwise return `null` (use normal split).
 */
export function tryExpandGluedVoicemaster(without: string): string[] | null {
  const trimmed = without.trim();
  if (!trimmed.includes(" ") && trimmed.length > 0) {
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("voicemaster") && lower.length > "voicemaster".length) {
      const gluedOrig = trimmed.slice("voicemaster".length);
      const gluedLower = gluedOrig.toLowerCase();
      return parseGluedBody(gluedLower, gluedOrig);
    }
    if (lower.startsWith("vm") && lower.length > 2) {
      const gluedOrig = trimmed.slice(2);
      const gluedLower = gluedOrig.toLowerCase();
      return parseGluedBody(gluedLower, gluedOrig);
    }
  }
  return null;
}
