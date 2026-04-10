import type { Prisma } from "@prisma/client";
import { getBotPrisma } from "../db-prisma";
import { DUEL_RAKE_BPS } from "./economy-tuning";
import type { Tx } from "./wallet";
import { creditTreasuryInTx } from "./wallet";

export type SettleDuelResult = {
  winnerId: string;
  loserId: string;
  stake: bigint;
  rake: bigint;
  challengerId: string;
  opponentId: string;
};

async function ledgerDuel(
  tx: Tx,
  userId: string,
  delta: bigint,
  balanceAfter: bigint,
  meta: Prisma.InputJsonValue,
): Promise<void> {
  await tx.economyLedger.create({
    data: {
      discordUserId: userId,
      delta,
      balanceAfter,
      reason: "duel",
      meta,
    },
  });
}

/**
 * Both must have cash ≥ stake; winner receives 2×stake − rake, treasury gets rake.
 */
export async function settleEconomyDuel(duelId: string): Promise<SettleDuelResult> {
  const prisma = getBotPrisma();
  return prisma.$transaction(async (tx) => {
    const d = await tx.economyDuel.findUnique({ where: { id: duelId } });
    if (!d) throw new Error("NOT_FOUND");
    if (d.status !== "pending") throw new Error("NOT_PENDING");
    if (d.expiresAt.getTime() < Date.now()) {
      await tx.economyDuel.update({
        where: { id: duelId },
        data: { status: "expired" },
      });
      throw new Error("EXPIRED");
    }

    const { challengerDiscordId: cId, opponentDiscordId: oId, stake } = d;
    const cRow = await tx.economyUser.upsert({
      where: { discordUserId: cId },
      create: { discordUserId: cId },
      update: {},
    });
    const oRow = await tx.economyUser.upsert({
      where: { discordUserId: oId },
      create: { discordUserId: oId },
      update: {},
    });
    if (cRow.cash < stake) throw new Error("INSUFFICIENT_CHALLENGER");
    if (oRow.cash < stake) throw new Error("INSUFFICIENT_OPPONENT");

    const pot = stake * 2n;
    const rake = (pot * BigInt(DUEL_RAKE_BPS)) / 10000n;
    const winnerPrize = pot - rake;

    const challengerWins = Math.random() < 0.5;
    const winnerId = challengerWins ? cId : oId;
    const loserId = challengerWins ? oId : cId;

    const loserBefore = loserId === cId ? cRow.cash : oRow.cash;
    const winnerBefore = winnerId === cId ? cRow.cash : oRow.cash;

    const loserAfter = loserBefore - stake;
    const winnerAfter = winnerBefore - stake + winnerPrize;
    if (loserAfter < 0n || winnerAfter < 0n) throw new Error("INSUFFICIENT_FUNDS");

    await tx.economyUser.update({
      where: { discordUserId: loserId },
      data: { cash: loserAfter },
    });
    await tx.economyUser.update({
      where: { discordUserId: winnerId },
      data: { cash: winnerAfter },
    });

    await ledgerDuel(tx, loserId, -stake, loserAfter, {
      duelId,
      role: "loser",
      challengerId: cId,
      opponentId: oId,
    });
    await ledgerDuel(tx, winnerId, winnerPrize - stake, winnerAfter, {
      duelId,
      role: "winner",
      challengerId: cId,
      opponentId: oId,
      rake: rake.toString(),
    });

    await creditTreasuryInTx(tx, {
      delta: rake,
      reason: "treasury_fee",
      meta: { kind: "duel_rake", duelId },
    });

    await tx.economyDuel.update({
      where: { id: duelId },
      data: { status: "completed", winnerDiscordId: winnerId },
    });

    return {
      winnerId,
      loserId,
      stake,
      rake,
      challengerId: cId,
      opponentId: oId,
    };
  });
}
