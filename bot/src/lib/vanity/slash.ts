import {
  type Client,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { getDiscordToken } from "../../config";
import { errorEmbed } from "../embeds";
import { userCanUseKnifeProFeatures } from "../pro-entitlement";
import { runVanityDropForUser, runVanitySearchForUser } from "./user-actions";

const VANITIES_SLASH = new SlashCommandBuilder()
  .setName("vanities")
  .setDescription("Knife Pro — dictionary invite slug scanner")
  .addSubcommand((sub) =>
    sub
      .setName("drop")
      .setDescription("Recently dropped slugs (paginate with buttons)"),
  )
  .addSubcommand((sub) =>
    sub
      .setName("search")
      .setDescription("Look up one discord.gg slug")
      .addStringOption((opt) =>
        opt
          .setName("code")
          .setDescription("Invite code or https://discord.gg/… link")
          .setRequired(true),
      ),
  );

function applicationIdFromBotToken(token: string): string | null {
  const part = token.split(".")[0];
  if (!part) return null;
  try {
    const id = Buffer.from(part, "base64").toString("utf8");
    return /^\d{17,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function resolveDiscordApplicationId(): string | null {
  const fromEnv = process.env.DISCORD_CLIENT_ID?.trim();
  if (fromEnv && /^\d{17,20}$/.test(fromEnv)) return fromEnv;
  try {
    const token = getDiscordToken();
    return applicationIdFromBotToken(token);
  } catch {
    return null;
  }
}

/** Register global slash commands (may take up to ~1h to appear everywhere). */
export async function registerVanitySlashCommands(client: Client): Promise<void> {
  const appId = resolveDiscordApplicationId();
  if (!appId) {
    console.warn(
      "Slash /vanities: skipped — set DISCORD_CLIENT_ID or use a valid bot token.",
    );
    return;
  }

  const rest = new REST({ version: "10" }).setToken(getDiscordToken());
  try {
    await rest.put(Routes.applicationCommands(appId), {
      body: [VANITIES_SLASH.toJSON()],
    });
    console.log("Slash command registered: /vanities");
  } catch (e) {
    console.warn("Slash /vanities registration failed:", e);
  }
}

export async function handleVanitySlashCommand(
  interaction: ChatInputCommandInteraction,
): Promise<boolean> {
  if (interaction.commandName !== "vanities") return false;

  const access = await userCanUseKnifeProFeatures(interaction.user.id, {
    commandLabel: "/vanities",
  });
  if (!access.ok) {
    await interaction.reply({
      embeds: [errorEmbed(access.reason ?? "Knife Pro required.")],
      ephemeral: true,
    });
    return true;
  }

  const sub = interaction.options.getSubcommand(true);

  if (sub === "drop") {
    const payload = await runVanityDropForUser(interaction.user);
    await interaction.reply({
      ...payload,
      ephemeral: false,
    });
    return true;
  }

  if (sub === "search") {
    const raw = interaction.options.getString("code", true);
    const result = await runVanitySearchForUser(
      interaction.client,
      interaction.user,
      raw,
    );
    if (!result.ok) {
      await interaction.reply({
        embeds: [errorEmbed(result.message)],
        ephemeral: true,
      });
      return true;
    }
    await interaction.reply({ embeds: result.embeds, ephemeral: false });
    return true;
  }

  return false;
}
