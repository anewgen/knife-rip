import { isDeveloperDiscordId } from "../../../lib/bot-developers";
import { getBotInternalSecret } from "../config";
import { fetchEntitlementFromSite } from "./site-client";

/**
 * **Developers** and **owners**: skip Discord **Administrator** + **Knife Pro** gates (e.g. `.say`),
 * and prefix cooldown — same effective bypass. Developers are checked first (no site call).
 *
 * Owners: resolved only via the site entitlement API (static list, DB handouts, and bootstrap revocations).
 */
export async function isCommandOwnerBypass(
  userId: string,
): Promise<boolean> {
  if (isDeveloperDiscordId(userId)) return true;

  const secret = getBotInternalSecret();
  if (!secret) return false;

  try {
    const ent = await fetchEntitlementFromSite(userId);
    return ent.owner;
  } catch {
    return false;
  }
}
