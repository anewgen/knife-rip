import { EmbedBuilder } from "discord.js";

/** Neutral embeds — no strong brand colors. */
export function minimalEmbed(params: {
  title: string;
  description: string;
  imageUrl?: string;
}): EmbedBuilder {
  const b = new EmbedBuilder()
    .setTitle(params.title)
    .setDescription(params.description)
    .setColor(0x2b2d31);
  if (params.imageUrl) {
    b.setImage(params.imageUrl);
  }
  return b;
}

export function errorEmbed(description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Something went wrong")
    .setDescription(description)
    .setColor(0xed4245);
}
