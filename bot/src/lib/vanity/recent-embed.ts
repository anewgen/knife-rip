import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import type { User } from "discord.js";
import { VANITY_BTN_PREFIX, VANITY_RECENT_PAGE_SIZE } from "./constants";
import { formatVanityRelativeTime } from "./relative-time";

export type VanityDropRow = { code: string; droppedAt: Date };

export function buildRecentVanitiesMessage(options: {
  user: User;
  rows: VanityDropRow[];
  page: number;
  totalCount: number;
}): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  const { user, rows, totalCount } = options;
  const pageSize = VANITY_RECENT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(
    Math.max(0, options.page),
    totalPages - 1,
  );
  const startRank = safePage * pageSize;

  const lines = rows.map((row, i) => {
    const n = startRank + i + 1;
    const when = formatVanityRelativeTime(row.droppedAt);
    return `${n}. \`${row.code}\` - ${when}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({
      name: user.username,
      iconURL: user.displayAvatarURL({ size: 128 }) ?? undefined,
    })
    .setTitle("Recent vanities")
    .setDescription(
      lines.length ? lines.join("\n") : "_No drops recorded yet._\n_Enable **`VANITY_SCANNER_ENABLED=1`** and run migrations so the bot can fill this list._",
    )
    .setFooter({
      text: `Vanities are available instantly — Page ${safePage + 1}/${totalPages}`,
    });

  const uid = user.id;
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${VANITY_BTN_PREFIX}${uid}:${safePage}:p`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel("\u200b")
      .setEmoji("⬅️")
      .setDisabled(safePage <= 0),
    new ButtonBuilder()
      .setCustomId(`${VANITY_BTN_PREFIX}${uid}:${safePage}:n`)
      .setStyle(ButtonStyle.Secondary)
      .setLabel("\u200b")
      .setEmoji("➡️")
      .setDisabled(safePage >= totalPages - 1),
    new ButtonBuilder()
      .setCustomId(`${VANITY_BTN_PREFIX}${uid}:${safePage}:x`)
      .setStyle(ButtonStyle.Danger)
      .setLabel("\u200b")
      .setEmoji("🗑️"),
  );

  return { embeds: [embed], components: [row] };
}
