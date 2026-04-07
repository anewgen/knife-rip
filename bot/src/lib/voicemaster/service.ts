import {
  ChannelType,
  type Client,
  type Guild,
  type GuildMember,
  type VoiceBasedChannel,
  type VoiceChannel,
  PermissionFlagsBits,
} from "discord.js";
import type { VoiceMasterGuildConfig } from "@prisma/client";
import { getBotPrisma } from "../db-prisma";

export const VM_CATEGORY_NAME = "Voice Master";
export const VM_HUB_NAME = "➕ Join to create";
export const VM_PANEL_NAME = "voice-master";

export async function getGuildConfig(
  guildId: string,
): Promise<VoiceMasterGuildConfig | null> {
  return getBotPrisma().voiceMasterGuildConfig.findUnique({
    where: { guildId },
  });
}

export async function deleteGuildConfigRow(guildId: string): Promise<void> {
  await getBotPrisma().voiceMasterTempChannel.deleteMany({ where: { guildId } });
  await getBotPrisma().voiceMasterGuildConfig.deleteMany({
    where: { guildId },
  });
}

export async function savePanelMessageId(
  guildId: string,
  messageId: string,
): Promise<void> {
  await getBotPrisma().voiceMasterGuildConfig.updateMany({
    where: { guildId },
    data: { panelMessageId: messageId },
  });
}

export function isAdministrator(member: GuildMember): boolean {
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

export function applyNameTemplate(template: string, member: GuildMember): string {
  const name = member.displayName.replace(/[^\w\d\-_.\s]/g, "").slice(0, 40);
  const base = template.replace(/\{user\}/gi, name || "user").slice(0, 100);
  return base.trim() || "Voice";
}

export async function reconcileOrphanTemps(client: Client): Promise<void> {
  const prisma = getBotPrisma();
  const rows = await prisma.voiceMasterTempChannel.findMany();
  for (const row of rows) {
    try {
      const ch = await client.guilds.cache
        .get(row.guildId)
        ?.channels.fetch(row.channelId)
        .catch(() => null);
      if (!ch || !ch.isVoiceBased()) {
        await prisma.voiceMasterTempChannel.delete({
          where: { channelId: row.channelId },
        });
      }
    } catch {
      /* ignore */
    }
  }

  const configs = await prisma.voiceMasterGuildConfig.findMany();
  for (const cfg of configs) {
    const g = client.guilds.cache.get(cfg.guildId);
    if (!g) continue;
    for (const id of [cfg.hubChannelId, cfg.panelChannelId]) {
      const ch = await g.channels.fetch(id).catch(() => null);
      if (!ch) {
        await prisma.voiceMasterGuildConfig.delete({
          where: { guildId: cfg.guildId },
        });
        await prisma.voiceMasterTempChannel.deleteMany({
          where: { guildId: cfg.guildId },
        });
        break;
      }
    }
  }
}

export async function getTempByChannel(
  channelId: string,
): Promise<{ channelId: string; guildId: string; ownerId: string } | null> {
  return getBotPrisma().voiceMasterTempChannel.findUnique({
    where: { channelId },
    select: { channelId: true, guildId: true, ownerId: true },
  });
}

export async function getOwnerTempInGuild(
  guildId: string,
  ownerId: string,
): Promise<{ channelId: string } | null> {
  return getBotPrisma().voiceMasterTempChannel.findFirst({
    where: { guildId, ownerId },
    select: { channelId: true },
  });
}

export async function transferOwnership(
  channelId: string,
  newOwnerId: string,
): Promise<void> {
  await getBotPrisma().voiceMasterTempChannel.update({
    where: { channelId },
    data: { ownerId: newOwnerId },
  });
}

export async function setTempStatus(
  channelId: string,
  status: string | null,
): Promise<void> {
  await getBotPrisma().voiceMasterTempChannel.update({
    where: { channelId },
    data: { statusLabel: status },
  });
}

export async function applyLock(
  voice: VoiceBasedChannel,
  ownerId: string,
): Promise<void> {
  const everyone = voice.guild.roles.everyone;
  await voice.permissionOverwrites.edit(everyone, {
    Connect: false,
  });
  await voice.permissionOverwrites.edit(ownerId, {
    Connect: true,
  });
}

export async function applyUnlock(
  voice: VoiceBasedChannel,
  ownerId: string,
): Promise<void> {
  const everyone = voice.guild.roles.everyone;
  await voice.permissionOverwrites.edit(everyone, {
    Connect: null,
  });
  await voice.permissionOverwrites.edit(ownerId, {
    Connect: null,
  });
}

export async function applyGhost(
  voice: VoiceBasedChannel,
  ownerId: string,
): Promise<void> {
  const everyone = voice.guild.roles.everyone;
  await voice.permissionOverwrites.edit(everyone, {
    ViewChannel: false,
  });
  await voice.permissionOverwrites.edit(ownerId, {
    ViewChannel: true,
  });
}

export async function applyUnghost(
  voice: VoiceBasedChannel,
  ownerId: string,
): Promise<void> {
  const everyone = voice.guild.roles.everyone;
  await voice.permissionOverwrites.edit(everyone, {
    ViewChannel: null,
  });
  await voice.permissionOverwrites.edit(ownerId, {
    ViewChannel: null,
  });
}

export async function permitTarget(
  voice: VoiceBasedChannel,
  id: string,
): Promise<void> {
  await voice.permissionOverwrites.edit(id, {
    ViewChannel: true,
    Connect: true,
  });
}

export async function rejectTarget(
  voice: VoiceBasedChannel,
  id: string,
): Promise<void> {
  await voice.permissionOverwrites.edit(id, {
    Connect: false,
  });
}

export function ownerCanControl(
  member: GuildMember,
  ownerId: string,
): boolean {
  return member.id === ownerId || isAdministrator(member);
}

export function ownerStillInChannel(
  voice: VoiceBasedChannel,
  ownerId: string,
): boolean {
  return voice.members.has(ownerId);
}

export async function deleteTempVoice(
  guild: Guild,
  channelId: string,
): Promise<void> {
  await getBotPrisma().voiceMasterTempChannel
    .delete({ where: { channelId } })
    .catch(() => {});
  const ch = await guild.channels.fetch(channelId).catch(() => null);
  if (ch?.isVoiceBased()) {
    await ch.delete("VoiceMaster empty").catch(() => {});
  }
}

export async function createHubTempChannel(
  guild: Guild,
  config: VoiceMasterGuildConfig,
  member: GuildMember,
): Promise<VoiceChannel> {
  const name = applyNameTemplate(config.defaultNameTemplate, member);
  const everyone = guild.roles.everyone.id;
  const permissionOverwrites: {
    id: string;
    allow?: bigint;
    deny?: bigint;
  }[] = [
    {
      id: everyone,
      allow: PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Connect,
    },
    {
      id: member.id,
      allow:
        PermissionFlagsBits.ViewChannel |
        PermissionFlagsBits.Connect |
        PermissionFlagsBits.ManageChannels,
    },
  ];

  if (config.defaultRoleId) {
    permissionOverwrites.push({
      id: config.defaultRoleId,
      allow: PermissionFlagsBits.ViewChannel | PermissionFlagsBits.Connect,
    });
  }

  const voice = await guild.channels.create({
    name: name.slice(0, 100),
    type: ChannelType.GuildVoice,
    parent: config.categoryId,
    bitrate: Math.min(
      Math.max(config.defaultBitrate, 8000),
      guild.maximumBitrate,
    ),
    rtcRegion: config.defaultRegion?.trim() || undefined,
    permissionOverwrites,
  });

  await getBotPrisma().voiceMasterTempChannel.create({
    data: {
      channelId: voice.id,
      guildId: guild.id,
      ownerId: member.id,
    },
  });

  if (config.joinRoleId) {
    await member.roles.add(config.joinRoleId).catch(() => {});
  }

  if (config.defaultInterface) {
    /* stub — panel + commands only in v1 */
  }

  return voice;
}

export function clampBitrate(guild: Guild, raw: number): number {
  const tier = guild.premiumTier;
  let max = guild.maximumBitrate;
  if (tier === 0) max = Math.min(max, 96000);
  else if (tier === 1) max = Math.min(max, 128000);
  else if (tier === 2) max = Math.min(max, 256000);
  else max = Math.min(max, 384000);
  return Math.min(Math.max(Math.round(raw / 1000) * 1000, 8000), max);
}
