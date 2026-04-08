import type { ButtonInteraction } from "discord.js";
import { getBotPrisma } from "../db-prisma";
import { VANITY_BTN_PREFIX, VANITY_RECENT_PAGE_SIZE } from "./constants";
import { buildRecentVanitiesMessage } from "./recent-embed";

export async function handleVanityButton(
  interaction: ButtonInteraction,
): Promise<boolean> {
  if (!interaction.customId.startsWith(VANITY_BTN_PREFIX)) return false;

  const rest = interaction.customId.slice(VANITY_BTN_PREFIX.length);
  const parts = rest.split(":");
  if (parts.length !== 3) return false;
  const [ownerId, pageStr, action] = parts;
  if (!ownerId || !pageStr || !action) return false;

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: "Those buttons are not for you.",
      ephemeral: true,
    });
    return true;
  }

  let page = Number.parseInt(pageStr, 10);
  if (!Number.isFinite(page) || page < 0) page = 0;

  if (action === "x") {
    await interaction.deferUpdate();
    await interaction.message.delete().catch(() => {});
    return true;
  }

  const prisma = getBotPrisma();
  const totalCount = await prisma.vanityInviteObservation.count({
    where: { droppedAt: { not: null } },
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / VANITY_RECENT_PAGE_SIZE));

  if (action === "p") page = Math.max(0, page - 1);
  else if (action === "n") page = Math.min(totalPages - 1, page + 1);
  else {
    await interaction.reply({
      content: "Unknown action.",
      ephemeral: true,
    });
    return true;
  }

  page = Math.min(Math.max(0, page), totalPages - 1);

  const rows = await prisma.vanityInviteObservation.findMany({
    where: { droppedAt: { not: null } },
    orderBy: { droppedAt: "desc" },
    skip: page * VANITY_RECENT_PAGE_SIZE,
    take: VANITY_RECENT_PAGE_SIZE,
    select: { code: true, droppedAt: true },
  });

  const payload = buildRecentVanitiesMessage({
    user: interaction.user,
    rows: rows.map((r) => ({
      code: r.code,
      droppedAt: r.droppedAt!,
    })),
    page,
    totalCount,
  });

  await interaction.update({
    embeds: payload.embeds,
    components: payload.components,
  });
  return true;
}
