import type { Interaction } from "discord.js";
import { buildPollEmbed, buildPollRows } from "./render";
import { getPollByPollId } from "./state";

const PREFIX = "kpoll:";

export async function handlePollInteraction(
  interaction: Interaction,
): Promise<void> {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith(PREFIX)) return;

  const rest = interaction.customId.slice(PREFIX.length);
  const match = /^([a-f0-9]{8}):(\d+)$/.exec(rest);
  if (!match) return;

  const pollId = match[1]!;
  const optIdx = parseInt(match[2]!, 10);
  const state = getPollByPollId(pollId);

  if (!state || state.closed) {
    await interaction.reply({
      ephemeral: true,
      content: "This poll is closed or no longer active.",
    });
    return;
  }

  if (interaction.message?.id !== state.messageId) {
    await interaction.reply({
      ephemeral: true,
      content: "This poll message is out of date.",
    });
    return;
  }

  if (optIdx < 0 || optIdx >= state.options.length) return;

  state.votes.set(interaction.user.id, optIdx);
  await interaction.deferUpdate();
  await interaction.message.edit({
    embeds: [buildPollEmbed(state, false)],
    components: buildPollRows(state, false),
  });
}
