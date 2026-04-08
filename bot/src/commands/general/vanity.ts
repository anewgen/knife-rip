import { getGuildCommandPrefix } from "../../lib/guild-prefix";
import { errorEmbed, minimalEmbed } from "../../lib/embeds";
import { userCanUseKnifeProFeatures } from "../../lib/pro-entitlement";
import { runVanityDropForUser, runVanitySearchForUser } from "../../lib/vanity/user-actions";
import type { KnifeCommand } from "../types";

async function firstTokenAfterPrefix(message: {
  content: string;
  guildId: string | null;
}): Promise<string> {
  const prefix = await getGuildCommandPrefix(message.guildId);
  const rest = message.content.trimStart();
  if (!rest.toLowerCase().startsWith(prefix.toLowerCase())) return "";
  const after = rest.slice(prefix.length).trim();
  return after.split(/\s+/)[0]?.toLowerCase() ?? "";
}

export const vanityCommand: KnifeCommand = {
  name: "vanity",
  aliases: ["vanities"],
  description:
    "Knife Pro — look up a discord.gg slug or browse recently released dictionary codes (from background scans)",
  site: {
    categoryId: "pro",
    categoryTitle: "Pro",
    categoryDescription: "Knife Pro billing and perks.",
    usage:
      ".vanity search <code> · .vanity drop · .vanities · /vanities drop · /vanities search",
    tier: "pro",
    style: "prefix",
  },
  async run({ message, args }) {
    const access = await userCanUseKnifeProFeatures(message.author.id, {
      commandLabel: ".vanity",
    });
    if (!access.ok) {
      await message.reply({
        embeds: [errorEmbed(access.reason ?? "Knife Pro required.")],
      });
      return;
    }

    const head = await firstTokenAfterPrefix(message);
    const sub = args[0]?.toLowerCase();

    const wantDrop =
      head === "vanities" ||
      sub === "drop" ||
      sub === "list" ||
      sub === "recent";

    if (wantDrop) {
      await message.reply(await runVanityDropForUser(message.author));
      return;
    }

    if (sub === "search") {
      const joined = args.slice(1).join(" ").trim();
      if (!joined) {
        await message.reply({
          embeds: [
            errorEmbed(
              "Usage: **.vanity search** `code` or `https://discord.gg/…`",
            ),
          ],
        });
        return;
      }
      const result = await runVanitySearchForUser(
        message.client,
        message.author,
        joined,
      );
      if (!result.ok) {
        await message.reply({ embeds: [errorEmbed(result.message)] });
        return;
      }
      await message.reply({ embeds: result.embeds });
      return;
    }

    await message.reply({
      embeds: [
        minimalEmbed({
          title: "Vanity",
          description:
            "**Knife Pro** — track dictionary slugs against Discord invites.\n\n" +
            "• **.vanity search** `code` — one slug lookup\n" +
            "• **.vanity drop** — recent releases (paginate with buttons)\n" +
            "• **.vanities** — same as **drop**\n" +
            "• **`/vanities search`** — slash lookup\n" +
            "• **`/vanities drop`** — slash recent list\n\n" +
            "_Background scans need **`VANITY_SCANNER_ENABLED=1`** in the bot environment._",
        }),
      ],
    });
  },
};
