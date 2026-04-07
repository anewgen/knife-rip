import { COMMAND_CATALOG_VERSION, getSiteApiBase } from "../../config";
import { minimalEmbed } from "../../lib/embeds";
import type { KnifeCommand } from "../types";

type LatestPayload = {
  title: string;
  summary: string;
  url: string;
  date?: string;
  catalogVersion?: number;
};

const FALLBACK_CHANGELOG = "https://knife.rip/changelog";

export const newsCommand: KnifeCommand = {
  name: "news",
  aliases: ["whatsnew", "updates"],
  description:
    "Latest release note from knife.rip (one-line summary + changelog link)",
  site: {
    categoryId: "core",
    categoryTitle: "Core",
    categoryDescription: "Essential prefix commands.",
    usage: ".news · .whatsnew · .updates",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    const base = getSiteApiBase();
    let payload: LatestPayload | null = null;

    try {
      const res = await fetch(`${base}/api/public/changelog-latest`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        payload = (await res.json()) as LatestPayload;
      }
    } catch {
      /* site unreachable */
    }

    if (
      !payload?.title ||
      !payload.summary ||
      typeof payload.url !== "string"
    ) {
      await message.reply({
        embeds: [
          minimalEmbed({
            title: "What's new",
            description:
              `Couldn't reach the Knife site from the bot host.\n\n` +
              `**Changelog:** ${FALLBACK_CHANGELOG}\n` +
              `**This bot:** command catalog **v${COMMAND_CATALOG_VERSION}**`,
          }),
        ],
      });
      return;
    }

    const datePart = payload.date ? ` · ${payload.date}` : "";
    const cat =
      payload.catalogVersion != null
        ? ` · catalog v${payload.catalogVersion}`
        : "";

    const footer = `${payload.summary.slice(0, 240)}${payload.summary.length > 240 ? "…" : ""}`;

    await message.reply({
      embeds: [
        minimalEmbed({
          title: "What's new",
          description:
            `**${payload.title}**${datePart}${cat}\n\n` +
            `[Read changelog →](${payload.url})`,
          footerText: footer.slice(0, 2048),
        }),
      ],
    });
  },
};
