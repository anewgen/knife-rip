import type { Client, VoiceState } from "discord.js";
import {
  createHubTempChannel,
  deleteTempVoice,
  getGuildConfig,
  getTempByChannel,
} from "./service";

export async function handleVoiceMasterVoiceState(
  client: Client,
  oldS: VoiceState,
  newS: VoiceState,
): Promise<void> {
  const guild = newS.guild ?? oldS.guild;
  if (!guild) return;

  const config = await getGuildConfig(guild.id);
  const prismaConfig = config;

  const oldId = oldS.channelId;
  const newId = newS.channelId;

  if (oldId) {
    const temp = await getTempByChannel(oldId);
    if (temp) {
      if (prismaConfig?.joinRoleId && oldS.member) {
        await oldS.member.roles.remove(prismaConfig.joinRoleId).catch(() => {});
      }
      const ch = await guild.channels.fetch(oldId).catch(() => null);
      if (ch?.isVoiceBased() && ch.members.size === 0) {
        await deleteTempVoice(guild, oldId);
      }
    }
  }

  if (!prismaConfig) return;

  if (
    newId === prismaConfig.hubChannelId &&
    oldId !== prismaConfig.hubChannelId &&
    newS.member
  ) {
    try {
      const voice = await createHubTempChannel(
        guild,
        prismaConfig,
        newS.member,
      );
      await newS.member.voice.setChannel(voice).catch(async (e) => {
        console.warn("VoiceMaster move failed:", e);
        const { getBotPrisma } = await import("../db-prisma");
        await getBotPrisma().voiceMasterTempChannel
          .delete({ where: { channelId: voice.id } })
          .catch(() => {});
        await voice.delete("VoiceMaster move failed").catch(() => {});
      });
    } catch (e) {
      console.warn("VoiceMaster hub create failed:", e);
    }
  }
}
