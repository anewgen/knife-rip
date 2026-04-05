import { getBotInternalSecret, getSiteApiBase } from "../config";

export type EntitlementResponse = {
  premium: boolean;
  discordUserId: string;
};

/**
 * Ask the site whether this Discord user has Pro (HTTP path).
 * Uses GET /api/internal/entitlement — same secret as documented in the site README.
 */
export async function fetchPremiumFromSite(
  discordUserId: string,
): Promise<boolean> {
  const secret = getBotInternalSecret();
  if (!secret) {
    throw new Error(
      "BOT_INTERNAL_SECRET is not set — add it to .env for site-linked premium checks",
    );
  }

  const base = getSiteApiBase();
  const url = new URL("/api/internal/entitlement", `${base}/`);
  url.searchParams.set("discord_user_id", discordUserId);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (res.status === 503) {
    throw new Error("Site entitlement API unavailable (BOT_INTERNAL_SECRET not configured on server)");
  }
  if (res.status === 401) {
    throw new Error("Entitlement API rejected token — check BOT_INTERNAL_SECRET matches site .env");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Entitlement API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as EntitlementResponse;
  return Boolean(data.premium);
}

/**
 * Push the public command list to the site (POST /api/internal/commands).
 * No-op if BOT_INTERNAL_SECRET is unset.
 */
export async function postCommandRegistry(payload: object): Promise<void> {
  const secret = getBotInternalSecret();
  if (!secret) {
    console.warn(
      "BOT_INTERNAL_SECRET not set — skipping command catalog sync to site",
    );
    return;
  }

  const base = getSiteApiBase();
  const url = new URL("/api/internal/commands", `${base}/`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 503) {
    throw new Error(
      "Command registry API unavailable (BOT_INTERNAL_SECRET missing on site)",
    );
  }
  if (res.status === 401) {
    throw new Error(
      "Command registry rejected token — BOT_INTERNAL_SECRET must match site .env",
    );
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Command registry sync failed ${res.status}: ${text.slice(0, 300)}`,
    );
  }
}
