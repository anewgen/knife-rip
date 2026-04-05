import { db } from "@/lib/db";
import { hasPremiumAccess } from "@/lib/premium";

/**
 * User-scoped premium: lifetime purchase or active subscription (legacy).
 * Use from the discord.js bot (shared DB) or call GET /api/internal/entitlement.
 */
export async function getPremiumForDiscordUserId(
  discordUserId: string,
): Promise<boolean> {
  const account = await db.account.findFirst({
    where: { provider: "discord", providerAccountId: discordUserId },
    include: {
      user: { include: { subscription: true } },
    },
  });

  return hasPremiumAccess(account?.user ?? null);
}
