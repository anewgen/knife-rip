import type { Message } from "discord.js";
import { PREFIX } from "../../config";
import {
  enqueueVoiceTts,
  getVoiceTtsListenChannelId,
  isVoiceTtsActiveInGuild,
} from "./voice-player";
import { sanitizeTextForTts } from "./sanitize";

/**
 * When the bot is in a VC TTS session and the message is in that voice channel’s
 * built-in chat, queue TTS (prefix lines are commands, not read aloud).
 * @returns true if this message was consumed for TTS (skip further handling).
 */
export function handleVcTtsMessage(message: Message): boolean {
  if (!message.guild) return false;
  if (!isVoiceTtsActiveInGuild(message.guild.id)) return false;
  const listenId = getVoiceTtsListenChannelId(message.guild.id);
  if (!listenId || message.channel.id !== listenId) return false;
  if (message.author.bot) return false;

  const raw = message.content.trim();
  if (!raw) return false;
  if (raw.startsWith(PREFIX)) return false;

  const text = sanitizeTextForTts(raw);
  if (!text) return false;

  enqueueVoiceTts(message.guild.id, text);
  return true;
}
