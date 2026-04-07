import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  type Client,
  type Guild,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { getBotPrisma } from "../db-prisma";
import { ECON_INTERACTION_PREFIX, HUB_PAGE_COUNT } from "./config";
import { ecoBtn, ecoM, economyHubPageTitle } from "./custom-emojis";
import { formatCash, maxBetForBalance } from "./money";
import { getCash } from "./wallet";

const HUB_COLOR = 0x57f287;

function btnId(uid: string, ...parts: string[]): string {
  return `${ECON_INTERACTION_PREFIX}${uid}:${parts.join(":")}`;
}

export async function buildGambleHubPayload(params: {
  client: Client;
  userId: string;
  page: number;
  guild: Guild | null;
}): Promise<{ embeds: EmbedBuilder[]; components: ActionRowBuilder<MessageActionRowComponentBuilder>[] }> {
  const { client, userId, page, guild } = params;
  const p = Math.max(0, Math.min(HUB_PAGE_COUNT - 1, page));
  const cash = await getCash(userId);
  const maxBet = maxBetForBalance(cash);
  const user = await client.users.fetch(userId).catch(() => null);
  const tag = user ? `${user.username}` : userId;

  let description = `👋 **${tag}**\n\n${ecoM.cash} **Balance:** **${formatCash(cash)}**\n${ecoM.stats} **Max bet (games):** **${formatCash(maxBet)}**\n\n`;

  const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

  const navRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(btnId(userId, "pg", String(p), "prev"))
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(ecoBtn.lucidearrowleft),
    new ButtonBuilder()
      .setCustomId(btnId(userId, "pg", String(p), "next"))
      .setLabel("Next")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(ecoBtn.lucidearrowright),
  );
  rows.push(navRow);

  if (p === 0) {
    const prisma = getBotPrisma();
    const items = await prisma.economyShopItem.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      take: 25,
    });
    if (items.length === 0) {
      description +=
        `${ecoM.shop} **Shop**\nNo items are on sale yet — check back later.\n\n_Roles are granted in the Knife hub server._`;
    } else {
      description += `${ecoM.shop} **Shop** — pick an item below, then confirm.\n\n`;
      for (const it of items) {
        description += `${it.emoji} **${it.name}** — **${formatCash(BigInt(it.price))}**\n`;
      }
      const select = new StringSelectMenuBuilder()
        .setCustomId(btnId(userId, "pg", String(p), "shop", "sel"))
        .setPlaceholder(`${ecoM.shop} Choose an item to buy…`)
        .addOptions(
          items.map((it) => ({
            label: it.name.slice(0, 100),
            description: `${formatCash(BigInt(it.price))} cash`,
            value: it.id,
            emoji: it.emoji?.match(/^<a?:\w+:\d+>$/)
              ? undefined
              : it.emoji || ecoBtn.shop,
          })),
        );
      rows.push(
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          select,
        ),
      );
    }
  } else if (p === 1) {
    description +=
      `${ecoM.slots} **Games** — fair odds vs the house.\n\n` +
      `${ecoM.coinflip} **Coinflip** — double or nothing\n` +
      `${ecoM.dice} **Dice** — beat the house (ties refund)\n` +
      `${ecoM.slots} **Slots** — triple / pair pays\n\n` +
      `${ecoM.tablerinfosquarefilled} _Use the buttons and enter your bet._`;
    rows.push(
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(btnId(userId, "pg", String(p), "g", "cf"))
          .setLabel("Coinflip")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(ecoBtn.coinflip),
        new ButtonBuilder()
          .setCustomId(btnId(userId, "pg", String(p), "g", "dc"))
          .setLabel("Dice")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(ecoBtn.dice),
        new ButtonBuilder()
          .setCustomId(btnId(userId, "pg", String(p), "g", "sl"))
          .setLabel("Slots")
          .setStyle(ButtonStyle.Primary)
          .setEmoji(ecoBtn.slots),
      ),
    );
  } else if (p === 2) {
    description +=
      `${ecoM.stats} **Stats** — your global Knife Cash profile.\n\n` +
      `${ecoM.toplb} Use the buttons for leaderboards or a fresh balance read.`;
    rows.push(
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(btnId(userId, "pg", String(p), "st", "me"))
          .setLabel("My stats")
          .setStyle(ButtonStyle.Success)
          .setEmoji(ecoBtn.msgs),
        new ButtonBuilder()
          .setCustomId(btnId(userId, "pg", String(p), "st", "topc"))
          .setLabel("Richest")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(ecoBtn.toplb),
        new ButtonBuilder()
          .setCustomId(btnId(userId, "pg", String(p), "st", "topg"))
          .setLabel("Top gamblers")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(ecoBtn.slots),
      ),
    );
  } else {
    description +=
      `${ecoM.pay} **Pay** — send cash to another Discord user.\n\n` +
      `${ecoM.icroundminus} A small **tax** applies. You cannot pay yourself.\n\n` +
      `${ecoM.tablerinfosquarefilled} Use the button to open the secure form.`;
    rows.push(
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(btnId(userId, "pg", String(p), "pay", "open"))
          .setLabel("Send cash…")
          .setStyle(ButtonStyle.Success)
          .setEmoji(ecoBtn.pay),
      ),
    );
  }

  const embed = new EmbedBuilder()
    .setColor(HUB_COLOR)
    .setTitle(economyHubPageTitle(p))
    .setDescription(description)
    .setFooter({
      text: `${guild?.name ? `${guild.name} · ` : ""}Page ${p + 1}/${HUB_PAGE_COUNT} · Not real money`,
    });

  return { embeds: [embed], components: rows };
}
