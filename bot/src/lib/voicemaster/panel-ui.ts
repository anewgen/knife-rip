import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { minimalEmbed } from "../embeds";

export const VM_PANEL_PAGES = 3;

export function panelCustomId(kind: string, extra = ""): string {
  return `vm:${kind}${extra ? `:${extra}` : ""}`.slice(0, 100);
}

export function buildPanelPayload(page: number) {
  const p = Math.max(0, Math.min(VM_PANEL_PAGES - 1, page));
  const titles = ["VoiceMaster — Controls", "VoiceMaster — Channel", "VoiceMaster — Help"];
  const bodies = [
    "Use the buttons below while you are inside **your** VoiceMaster channel (the one you created from the hub). Admins bypass owner checks.\n\n**Page 1:** Lock and visibility.",
    "**Page 2:** Music mode and interface.\n\n**Page 3:** Command hints — `.voicemaster` is the main command; `.vm` is a short alias.",
    "Key commands: `.voicemaster name`, `.voicemaster limit`, `.voicemaster bitrate`, `.voicemaster permit @member`, `.voicemaster reject @role`, `.voicemaster transfer @member`, `.voicemaster configuration`, `.voicemaster reset` (Administrator). Glued: `.vmsetup`, `.vmlock`, …",
  ];

  const embed = minimalEmbed({
    title: titles[p] ?? titles[0],
    description: `${bodies[p] ?? bodies[0]}\n\n_Page ${p + 1} of ${VM_PANEL_PAGES}_`,
  });

  const nx = (parts: MessageActionRowComponentBuilder[]) =>
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      ...parts,
    );

  const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

  if (p === 0) {
    rows.push(
      nx([
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "lock"))
          .setLabel("Lock")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "unlock"))
          .setLabel("Unlock")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "ghost"))
          .setLabel("Ghost")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "unghost"))
          .setLabel("Unghost")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "claim"))
          .setLabel("Claim")
          .setStyle(ButtonStyle.Primary),
      ]),
    );
  } else if (p === 1) {
    rows.push(
      nx([
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "musicon"))
          .setLabel("Music on")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "musicoff"))
          .setLabel("Music off")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "iface"))
          .setLabel("Send interface")
          .setStyle(ButtonStyle.Secondary),
      ]),
    );
  }

  rows.push(
    nx([
      new ButtonBuilder()
        .setCustomId(panelCustomId("nav", String(Math.max(0, p - 1))))
        .setLabel("◀")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(p <= 0),
      new ButtonBuilder()
        .setCustomId(panelCustomId("nav", String(Math.min(VM_PANEL_PAGES - 1, p + 1))))
        .setLabel("▶")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(p >= VM_PANEL_PAGES - 1),
    ]),
  );

  return { embeds: [embed], components: rows };
}
