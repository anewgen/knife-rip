import { PREFIX } from "../../config";
import { errorEmbed, minimalEmbed } from "../../lib/embeds";
import {
  joinVoiceForTts,
  leaveVoiceTts,
} from "../../lib/vc-tts/voice-player";
import type { KnifeCommand } from "../types";

export const ttsJoinCommand: KnifeCommand = {
  name: "ttsjoin",
  aliases: ["vcttsjoin", "vctts"],
  description:
    "Join your voice channel and read that channel’s built-in chat aloud (text-in-VC)",
  site: {
    categoryId: "utility",
    categoryTitle: "Utility",
    categoryDescription: "Quick tools and light fun.",
    usage:
      ".ttsjoin (while connected to a voice channel) · .vctts · .vcttsjoin",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    const guild = message.guild;
    const member = message.member;
    if (!guild || !member) {
      await message.reply({
        embeds: [errorEmbed("Use **.ttsjoin** in a server.")],
      });
      return;
    }

    const voice = member.voice.channel;
    if (!voice) {
      await message.reply({
        embeds: [
          errorEmbed(
            "Join a **voice channel** first, then run **.ttsjoin** again (from any channel).",
          ),
        ],
      });
      return;
    }

    const result = await joinVoiceForTts(guild, voice, member);
    if (!result.ok) {
      await message.reply({ embeds: [errorEmbed(result.error)] });
      return;
    }

    await message.reply({
      embeds: [
        minimalEmbed({
          title: "VC TTS live",
          description:
            `Connected to **${voice.name}**. Type in **this voice channel’s chat** (the text panel for that VC) — I’ll read messages aloud through voice (not lines starting with **${PREFIX}**). Use **.ttsleave** to disconnect.`,
        }),
      ],
    });
  },
};

export const ttsLeaveCommand: KnifeCommand = {
  name: "ttsleave",
  aliases: ["vcttsleave", "ttsdisconnect"],
  description: "Disconnect the bot from voice (VC TTS)",
  site: {
    categoryId: "utility",
    categoryTitle: "Utility",
    categoryDescription: "Quick tools and light fun.",
    usage: ".ttsleave · .vcttsleave · .ttsdisconnect",
    tier: "free",
    style: "prefix",
  },
  async run({ message }) {
    const guild = message.guild;
    if (!guild) {
      await message.reply({
        embeds: [errorEmbed("Use **.ttsleave** in a server.")],
      });
      return;
    }

    const gone = leaveVoiceTts(guild.id);
    if (!gone) {
      await message.reply({
        embeds: [
          minimalEmbed({
            title: "VC TTS",
            description: "I wasn’t in a voice session in this server.",
          }),
        ],
      });
      return;
    }

    await message.reply({
      embeds: [
        minimalEmbed({
          title: "VC TTS stopped",
          description:
            "Disconnected from voice. Run **.ttsjoin** again after joining a VC to resume.",
        }),
      ],
    });
  },
};
