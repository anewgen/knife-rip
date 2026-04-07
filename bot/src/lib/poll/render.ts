import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import type { PollState } from "./state";

const LABEL_MAX = 72;

function truncateLabel(label: string): string {
  const t = label.trim();
  if (t.length <= LABEL_MAX) return t || "…";
  return `${t.slice(0, LABEL_MAX - 1)}…`;
}

function voteCounts(state: PollState): number[] {
  const counts = new Array(state.options.length).fill(0);
  for (const idx of state.votes.values()) {
    if (idx >= 0 && idx < counts.length) counts[idx]!++;
  }
  return counts;
}

export function buildPollEmbed(state: PollState, final: boolean): EmbedBuilder {
  const counts = voteCounts(state);
  const total = counts.reduce((a, b) => a + b, 0);
  const lines = state.options.map((opt, i) => {
    const c = counts[i]!;
    const pct = total === 0 ? 0 : Math.round((c / total) * 100);
    return `**${i + 1}.** ${opt}\n— **${c}** vote${c === 1 ? "" : "s"} (${pct}%)`;
  });
  const title = final ? "Poll — closed" : "Poll";
  const desc = `**${state.question}**\n\n${lines.join("\n\n")}`.slice(0, 4096);
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(desc)
    .setColor(0x2b2d31)
    .setFooter({
      text: final
        ? "Final results — buttons disabled"
        : "Vote with the buttons below",
    });
}

export function buildPollRows(
  state: PollState,
  disabled: boolean,
): ActionRowBuilder<ButtonBuilder>[] {
  const row = new ActionRowBuilder<ButtonBuilder>();
  for (let i = 0; i < state.options.length; i++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`kpoll:${state.pollId}:${i}`)
        .setLabel(truncateLabel(state.options[i]!))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
    );
  }
  return [row];
}
