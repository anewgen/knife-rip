import {
  EmbedBuilder,
  type ButtonInteraction,
  type Interaction,
  type ModalSubmitInteraction,
  type UserSelectMenuInteraction,
} from "discord.js";
import {
  applyGhost,
  applyLock,
  applyUnlock,
  applyUnghost,
  getTempByChannel,
  ownerCanControl,
  ownerStillInChannel,
  transferOwnership,
} from "./service";
import {
  buildPanelPayload,
  buildRenameModal,
  panelCustomId,
  VM_FIELD_RENAME,
  VM_MODAL_RENAME,
} from "./panel-ui";

async function requireVoiceTemp(interaction: Interaction) {
  if (!interaction.guild || !interaction.member) return null;
  if (!interaction.isRepliable()) return null;
  const member = await interaction.guild.members.fetch(interaction.user.id);
  const voice = member.voice.channel;
  if (!voice?.isVoiceBased()) {
    await interaction.reply({
      ephemeral: true,
      content: "Join your VoiceMaster channel first.",
    });
    return null;
  }
  const temp = await getTempByChannel(voice.id);
  if (!temp) {
    await interaction.reply({
      ephemeral: true,
      content: "This isn’t a VoiceMaster temporary channel.",
    });
    return null;
  }
  return { guild: interaction.guild, member, voice, temp };
}

function voiceInfoEmbed(
  voice: import("discord.js").VoiceBasedChannel,
  temp: { ownerId: string },
): EmbedBuilder {
  const lim = voice.userLimit;
  return new EmbedBuilder()
    .setTitle("Channel information")
    .setColor(0x2b2d31)
    .addFields(
      { name: "Name", value: voice.name.slice(0, 256), inline: true },
      { name: "Channel ID", value: `\`${voice.id}\``, inline: true },
      {
        name: "Members",
        value: String(voice.members.size),
        inline: true,
      },
      {
        name: "Bitrate",
        value: `${voice.bitrate}`,
        inline: true,
      },
      {
        name: "User limit",
        value: lim === 0 ? "No limit" : String(lim),
        inline: true,
      },
      {
        name: "Region",
        value: voice.rtcRegion ?? "Automatic",
        inline: true,
      },
      {
        name: "Owner ID",
        value: `\`${temp.ownerId}\``,
        inline: false,
      },
    );
}

export function isVoiceMasterInteraction(interaction: Interaction): boolean {
  if (interaction.isButton() || interaction.isUserSelectMenu()) {
    return interaction.customId.startsWith("vm:");
  }
  if (interaction.isModalSubmit()) {
    return interaction.customId === VM_MODAL_RENAME;
  }
  return false;
}

export async function handleVoiceMasterInteraction(
  interaction: Interaction,
): Promise<void> {
  if (!isVoiceMasterInteraction(interaction)) return;

  if (interaction.isUserSelectMenu()) {
    await handleDisconnectSelect(interaction);
    return;
  }

  if (interaction.isModalSubmit()) {
    await handleRenameModal(interaction);
    return;
  }

  if (interaction.isButton()) {
    await handleVmButton(interaction);
  }
}

async function handleRenameModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId !== VM_MODAL_RENAME) return;
  if (!interaction.guild) return;

  const ctx = await requireVoiceTemp(interaction);
  if (!ctx) return;
  if (!ownerCanControl(ctx.member, ctx.temp.ownerId)) {
    await interaction.reply({
      ephemeral: true,
      content: "You don’t control this channel.",
    });
    return;
  }

  const newName = interaction.fields
    .getTextInputValue(VM_FIELD_RENAME)
    .trim()
    .slice(0, 100);
  if (!newName) {
    await interaction.reply({
      ephemeral: true,
      content: "Name can’t be empty.",
    });
    return;
  }

  try {
    await ctx.voice.setName(newName);
    await interaction.reply({
      ephemeral: true,
      content: `Renamed to **${newName}**.`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await interaction.reply({
      ephemeral: true,
      content: `Couldn’t rename: ${msg.slice(0, 400)}`,
    });
  }
}

async function handleDisconnectSelect(interaction: UserSelectMenuInteraction) {
  if (interaction.customId !== panelCustomId("sel", "disconnect")) return;
  if (!interaction.guild) return;

  const ctx = await requireVoiceTemp(interaction);
  if (!ctx) return;
  if (!ownerCanControl(ctx.member, ctx.temp.ownerId)) {
    await interaction.reply({
      ephemeral: true,
      content: "You don’t control this channel.",
    });
    return;
  }

  const targetId = interaction.values[0];
  if (targetId === ctx.member.id) {
    await interaction.reply({
      ephemeral: true,
      content: "Pick someone else to disconnect.",
    });
    return;
  }

  const target = await interaction.guild.members.fetch(targetId).catch(() => null);
  if (!target?.voice.channel || target.voice.channelId !== ctx.voice.id) {
    await interaction.reply({
      ephemeral: true,
      content: "That member isn’t in this voice channel.",
    });
    return;
  }

  try {
    await target.voice.disconnect("Disconnected by VoiceMaster owner");
    await interaction.reply({
      ephemeral: true,
      content: `Disconnected **${target.user.tag}**.`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await interaction.reply({
      ephemeral: true,
      content: `Couldn’t disconnect: ${msg.slice(0, 400)}`,
    });
  }
}

async function handleVmButton(interaction: ButtonInteraction) {
  if (!interaction.customId.startsWith("vm:")) return;
  if (!interaction.guild || !interaction.member) return;
  if (interaction.user.bot) return;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const parts = interaction.customId.split(":");
  const kind = parts[1];

  if (kind === "nav") {
    const page = Math.min(2, Math.max(0, Number(parts[2] ?? 0) || 0));
    await interaction.update(buildPanelPayload(page));
    return;
  }

  if (kind !== "act") {
    await interaction.reply({
      ephemeral: true,
      content: "Unknown VoiceMaster control.",
    });
    return;
  }

  const action = parts[2];
  const voice = member.voice.channel;

  if (!voice?.isVoiceBased()) {
    await interaction.reply({
      ephemeral: true,
      content: "Join your VoiceMaster channel first.",
    });
    return;
  }

  const temp = await getTempByChannel(voice.id);
  if (!temp) {
    await interaction.reply({
      ephemeral: true,
      content: "This isn’t a VoiceMaster temporary channel.",
    });
    return;
  }

  if (action === "claim") {
    if (ownerStillInChannel(voice, temp.ownerId)) {
      await interaction.reply({
        ephemeral: true,
        content: "The owner is still in this channel.",
      });
      return;
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
    return;
  }

  if (action === "rename") {
    if (!ownerCanControl(member, temp.ownerId)) {
      await interaction.reply({
        ephemeral: true,
        content: "You don’t control this channel.",
      });
      return;
    }
    await interaction.showModal(buildRenameModal());
    return;
  }

  if (action === "info") {
    if (!ownerCanControl(member, temp.ownerId)) {
      await interaction.reply({
        ephemeral: true,
        content: "You don’t control this channel.",
      });
      return;
    }
    await interaction.reply({
      ephemeral: true,
      embeds: [voiceInfoEmbed(voice, temp)],
    });
    return;
  }

  if (action === "liminc" || action === "limdec") {
    if (!ownerCanControl(member, temp.ownerId)) {
      await interaction.reply({
        ephemeral: true,
        content: "You don’t control this channel.",
      });
      return;
    }
    try {
      let u = voice.userLimit;
      if (action === "liminc") {
        if (u === 0) u = 1;
        else u = Math.min(99, u + 1);
      } else {
        if (u <= 1) u = 0;
        else u -= 1;
      }
      await voice.setUserLimit(u);
      await interaction.reply({
        ephemeral: true,
        content:
          u === 0
            ? "User limit cleared (no limit)."
            : `User limit set to **${u}**.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await interaction.reply({
        ephemeral: true,
        content: `Couldn’t update limit: ${msg.slice(0, 400)}`,
      });
    }
    return;
  }

  if (!ownerCanControl(member, temp.ownerId)) {
    await interaction.reply({
      ephemeral: true,
      content: "You don’t control this channel.",
    });
    return;
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
      default:
        await interaction.reply({
          ephemeral: true,
          content: "Unknown action.",
        });
        return;
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
}
