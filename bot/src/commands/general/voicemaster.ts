import { dispatchVoicemaster } from "../../lib/voicemaster/dispatch";
import type { KnifeCommand } from "../types";

export const voicemasterCommand: KnifeCommand = {
  name: "voicemaster",
  aliases: ["vm"],
  description:
    "VoiceMaster — join-to-create temporary voice channels; lock, ghost, permit, and more",
  site: {
    categoryId: "utility",
    categoryTitle: "Utility",
    categoryDescription: "Quick tools and light fun.",
    usage:
      ".voicemaster help · .voicemaster setup · .vmsetup · .vm lock · .voicemaster join",
    tier: "free",
    style: "prefix",
  },
  async run(ctx) {
    await dispatchVoicemaster(ctx.message, ctx.args);
  },
};
