import type { Message } from "discord.js";
import { PermissionFlagsBits } from "discord.js";
import {
  errorEmbed,
  minimalEmbed,
  missingPermissionEmbed,
} from "../../lib/embeds";
import type { KnifeCommand } from "../types";

/** Discord bulk-delete cap per request; also keeps abuse down */
const MAX_PURGE = 100;
const MIN_PURGE = 1;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

async function requireManageMessages(message: Message) {
  const g = message.guild;
  if (!g) return errorEmbed("Use this in a server channel.", { title: "Servers only" });
  const mem =
    message.member ??
    (await g.members.fetch(message.author.id).catch(() => null));
  if (!mem?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    return missingPermissionEmbed("you", "Manage Messages");
  }
  return null;
}

export const purgeCommand: KnifeCommand = {
  name: "purge",
  aliases: ["prune"],
  description:
    "Bulk-delete recent messages (max 100), skips pinned & messages older than 14 days",
  site: {
    categoryId: "moderation",
    categoryTitle: "Moderation",
    categoryDescription: "Server staff tools.",
    usage: ".purge · .prune — [number] [reason]",
    tier: "free",
    style: "prefix",
  },
  async run({ message, args }) {
    const deny = await requireManageMessages(message);
    if (deny) {
      await message.reply({ embeds: [deny] });
      return;
    }

    const ch = message.channel;
    if (!ch.isTextBased() || ch.isDMBased()) {
      await message.reply({
        embeds: [errorEmbed("Purge only works in server text channels.")],
      });
      return;
    }

    const rawN = args[0]?.trim();
    if (!rawN || !/^\d+$/.test(rawN)) {
      await message.reply({
        embeds: [
          errorEmbed(
            `Usage: **\`.purge\`** \`1–${MAX_PURGE}\` optional reason — e.g. \`.purge 25 spam\``,
          ),
        ],
      });
      return;
    }

    const n = parseInt(rawN, 10);
    if (n < MIN_PURGE || n > MAX_PURGE) {
      await message.reply({
        embeds: [
          errorEmbed(`Pick a number between **${MIN_PURGE}** and **${MAX_PURGE}**.`),
        ],
      });
      return;
    }

    const reasonNote = args.slice(1).join(" ").trim().slice(0, 200);

    const me = message.guild!.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageMessages)) {
      await message.reply({
        embeds: [missingPermissionEmbed("bot", "Manage Messages")],
      });
      return;
    }

    const cutoff = Date.now() - TWO_WEEKS_MS;

    let fetched;
    try {
      fetched = await ch.messages.fetch({ limit: 100 });
    } catch {
      await message.reply({
        embeds: [errorEmbed("Could not fetch messages.")],
      });
      return;
    }

    const candidates = [...fetched.values()]
      .filter(
        (m) =>
          m.id !== message.id &&
          !m.pinned &&
          m.createdTimestamp >= cutoff,
      )
      .slice(0, n);

    if (candidates.length === 0) {
      await message.reply({
        embeds: [
          errorEmbed(
            "Nothing to delete — messages may be pinned, too old (>14d), or already gone.",
          ),
        ],
      });
      return;
    }

    try {
      await ch.bulkDelete(candidates, true);
    } catch {
      await message.reply({
        embeds: [
          errorEmbed(
            "Bulk delete failed — ensure messages are under **14 days** old and I can delete them.",
          ),
        ],
      });
      return;
    }

    const notRemoved = n - candidates.length;
    const reasonLine = reasonNote
      ? `\n**Moderator note:** ${reasonNote}`
      : "";
    const skipNote =
      notRemoved > 0
        ? `\n_(Requested **${n}**, deleted **${candidates.length}** — rest skipped: command msg, pinned, or older than 14 days.)_`
        : "";

    await message.reply({
      embeds: [
        minimalEmbed({
          title: "Purge",
          description: `Deleted **${candidates.length}** message${candidates.length === 1 ? "" : "s"}.${reasonLine}${skipNote}\n\n_Audit log may show a bulk delete event._`,
        }),
      ],
    });
  },
};
