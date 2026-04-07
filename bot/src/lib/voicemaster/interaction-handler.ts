import { PermissionFlagsBits, type Interaction } from "discord.js";
import {
  applyGhost,
  applyLock,
  applyMusicMode,
  applyUnlock,
  applyUnghost,
  getGuildConfig,
  getTempByChannel,
  ownerCanControl,
  ownerStillInChannel,
  savePanelMessageId,
  transferOwnership,
} from "./service";
import { buildPanelPayload } from "./panel-ui";

export async function handleVoiceMasterButton(
  interaction: Interaction,
): Promise<boolean> {
  if (!interaction.isButton()) return false;
  if (!interaction.customId.startsWith("vm:")) return false;
  if (!interaction.guild || !interaction.member) return true;
  if (interaction.user.bot) return true;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const parts = interaction.customId.split(":");
  const kind = parts[1];

  if (kind === "nav") {
    const page = Math.min(2, Math.max(0, Number(parts[2] ?? 0) || 0));
    await interaction.update(buildPanelPayload(page));
    return true;
  }

  if (kind !== "act") {
    await interaction.reply({
      ephemeral: true,
      content: "Unknown VoiceMaster control.",
    });
    return true;
  }

  const action = parts[2];
  const voice = member.voice.channel;

  if (action === "iface") {
    const cfg = await getGuildConfig(interaction.guild.id);
    if (!cfg || !member.permissions.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        ephemeral: true,
        content:
          "Only a server Administrator can refresh the panel from here, or VoiceMaster isn’t set up.",
      });
      return true;
    }
    const ch = await interaction.guild.channels
      .fetch(cfg.panelChannelId)
      .catch(() => null);
    if (!ch?.isTextBased()) {
      await interaction.reply({
        ephemeral: true,
        content: "Panel channel is missing.",
      });
      return true;
    }
    if (cfg.panelMessageId) {
      const old = await ch.messages.fetch(cfg.panelMessageId).catch(() => null);
      await old?.delete().catch(() => {});
    }
    const msg = await ch.send(buildPanelPayload(0));
    await savePanelMessageId(interaction.guild.id, msg.id);
    await interaction.reply({
      ephemeral: true,
      content: "Posted a new panel message.",
    });
    return true;
  }

  if (!voice?.isVoiceBased()) {
    await interaction.reply({
      ephemeral: true,
      content: "Join your VoiceMaster channel first.",
    });
    return true;
  }

  const temp = await getTempByChannel(voice.id);
  if (!temp) {
    await interaction.reply({
      ephemeral: true,
      content: "This isn’t a VoiceMaster temporary channel.",
    });
    return true;
  }

  if (action === "claim") {
    if (ownerStillInChannel(voice, temp.ownerId)) {
      await interaction.reply({
        ephemeral: true,
        content: "The owner is still in this channel.",
      });
      return true;
    }
    await transferOwnership(voice.id, member.id);
    await interaction.guild.channels
      .fetch(voice.id)
      .then(async (ch) => {
        if (!ch?.isVoiceBased()) return;
        const everyone = interaction.guild!.roles.everyone;
        await ch.permissionOverwrites.edit(temp.ownerId, {
          ManageChannels: null,
          Connect: null,
          ViewChannel: null,
        });
        await ch.permissionOverwrites.edit(member.id, {
          ManageChannels: true,
          Connect: true,
          ViewChannel: true,
        });
        await ch.permissionOverwrites.edit(everyone, {
          Connect: null,
          ViewChannel: null,
        });
      })
      .catch(() => {});
    await interaction.reply({
      ephemeral: true,
      content: "You are now the channel owner.",
    });
    return true;
  }

  if (!ownerCanControl(member, temp.ownerId)) {
    await interaction.reply({
      ephemeral: true,
      content: "You don’t control this channel.",
    });
    return true;
  }

  try {
    switch (action) {
      case "lock":
        await applyLock(voice, temp.ownerId);
        break;
      case "unlock":
        await applyUnlock(voice, temp.ownerId);
        break;
      case "ghost":
        await applyGhost(voice, temp.ownerId);
        break;
      case "unghost":
        await applyUnghost(voice, temp.ownerId);
        break;
      case "musicon":
        await applyMusicMode(interaction.guild, voice, temp.ownerId, true);
        break;
      case "musicoff":
        await applyMusicMode(interaction.guild, voice, temp.ownerId, false);
        break;
      default:
        await interaction.reply({
          ephemeral: true,
          content: "Unknown action.",
        });
        return true;
    }
    await interaction.reply({
      ephemeral: true,
      content: "Updated your voice channel.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await interaction.reply({
      ephemeral: true,
      content: `Couldn’t update: ${msg.slice(0, 500)}`,
    });
  }
  return true;
}
