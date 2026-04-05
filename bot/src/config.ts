import { config as dotenv } from "dotenv";
import { resolve } from "path";

/**
 * Load repo-root `.env` first, then optional `bot/.env` overrides.
 * Run bot scripts with cwd = `bot/` (e.g. `npm run dev` inside `bot/`).
 */
function loadEnvFiles() {
  const cwd = process.cwd();
  dotenv({ path: resolve(cwd, "..", ".env") });
  dotenv({ path: resolve(cwd, ".env") });
}

loadEnvFiles();

export const PREFIX = "." as const;

/** Must match site `lib/commands.ts` → `COMMAND_CATALOG_VERSION`. */
export const COMMAND_CATALOG_VERSION = 1 as const;

export function getDiscordToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is required (same bot app as the site)");
  }
  return token;
}

/**
 * Base URL for calling the Next.js app (entitlement API). No trailing slash.
 */
export function getSiteApiBase(): string {
  const raw =
    process.env.SITE_API_BASE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function getBotInternalSecret(): string | undefined {
  const s = process.env.BOT_INTERNAL_SECRET?.trim();
  return s || undefined;
}
