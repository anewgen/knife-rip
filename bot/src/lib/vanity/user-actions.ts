import { EmbedBuilder, type Client, type User } from "discord.js";
import { getBotPrisma } from "../db-prisma";
import { VANITY_RECENT_PAGE_SIZE } from "./constants";
import { parseVanityInviteCode } from "./parse-code";
import { recordVanityProbe } from "./observe";
import { buildRecentVanitiesMessage } from "./recent-embed";

export async function runVanityDropForUser(author: User): Promise<
  ReturnType<typeof buildRecentVanitiesMessage>
> {
  const prisma = getBotPrisma();
  const totalCount = await prisma.vanityInviteObservation.count({
    where: { droppedAt: { not: null } },
  });
  const rows = await prisma.vanityInviteObservation.findMany({
    where: { droppedAt: { not: null } },
    orderBy: { droppedAt: "desc" },
    skip: 0,
    take: VANITY_RECENT_PAGE_SIZE,
    select: { code: true, droppedAt: true },
  });

  return buildRecentVanitiesMessage({
    user: author,
    rows: rows.map((r) => ({
      code: r.code,
      droppedAt: r.droppedAt!,
    })),
    page: 0,
    totalCount,
  });
}

export async function runVanitySearchForUser(
  client: Client,
  _author: User,
  rawQuery: string,
): Promise<{ ok: true; embeds: EmbedBuilder[] } | { ok: false; message: string }> {
  const joined = rawQuery.trim();
  if (!joined) {
    return { ok: false, message: "Provide a **code** or **https://discord.gg/…** link." };
  }
  const code = parseVanityInviteCode(joined);
  if (!code) {
    return { ok: false, message: "That doesn’t look like a valid invite or slug." };
  }

  const prisma = getBotPrisma();
  const r = await recordVanityProbe(prisma, client, code);
  const embed = new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle("Vanity / invite slug")
    .addFields(
      { name: "Code", value: `\`${code}\``, inline: true },
      {
        name: "Status",
        value: r.valid ? "**In use** (invite resolves)" : "**Open** (no invite right now)",
        inline: true,
      },
      {
        name: "Server",
        value: r.valid && r.guildName ? r.guildName : "—",
        inline: false,
      },
    )
    .setFooter({
      text:
        "“Open” means Discord did not return a guild invite for this slug — not a guarantee you can claim it as a vanity.",
    });

  return { ok: true, embeds: [embed] };
}
