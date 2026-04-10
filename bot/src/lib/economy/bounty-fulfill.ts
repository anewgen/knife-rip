import type { Prisma } from "@prisma/client";
import type { Tx } from "./wallet";
import { creditTreasuryInTx } from "./wallet";

/**
 * If an open bounty exists for `targetId` in `guildId`, pay `robberId` from treasury escrow
 * (treasury was credited `amount` + fee when the bounty was posted).
 */
export async function tryFulfillBountyOnRobSuccess(
  tx: Tx,
  params: {
    guildId: string;
    robberId: string;
    targetId: string;
  },
): Promise<{ paid: bigint; bountyId: string } | null> {
  const { guildId, robberId, targetId } = params;

  const bounty = await tx.economyBounty.findFirst({
    where: {
      guildId,
      targetDiscordId: targetId,
      status: "open",
    },
    orderBy: { createdAt: "asc" },
  });
  if (!bounty) return null;

  const amount = bounty.amount;

  await creditTreasuryInTx(tx, {
    delta: -amount,
    reason: "bounty",
    meta: { kind: "bounty_payout", bountyId: bounty.id, to: robberId },
  });

  const robber = await tx.economyUser.upsert({
    where: { discordUserId: robberId },
    create: { discordUserId: robberId },
    update: {},
  });
  const robberNext = robber.cash + amount;
  await tx.economyUser.update({
    where: { discordUserId: robberId },
    data: { cash: robberNext },
  });

  const meta: Prisma.InputJsonValue = {
    bountyId: bounty.id,
    targetId,
    guildId,
  };
  await tx.economyLedger.create({
    data: {
      discordUserId: robberId,
      delta: amount,
      balanceAfter: robberNext,
      reason: "bounty",
      meta,
    },
  });

  await tx.economyBounty.update({
    where: { id: bounty.id },
    data: {
      status: "claimed",
      claimerDiscordId: robberId,
      fulfilledAt: new Date(),
    },
  });

  return { paid: amount, bountyId: bounty.id };
}
