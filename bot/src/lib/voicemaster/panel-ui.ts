import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { minimalEmbed } from "../embeds";

export const VM_PANEL_PAGES = 3;

export function panelCustomId(kind: string, extra = ""): string {
  return `vm:${kind}${extra ? `:${extra}` : ""}`.slice(0, 100);
}

/** Modal + field ids (must stay stable for submit handler). */
export const VM_MODAL_RENAME = panelCustomId("modal", "rename");
export const VM_FIELD_RENAME = panelCustomId("field", "name");

export function buildRenameModal() {
  const modal = new ModalBuilder()
    .setCustomId(VM_MODAL_RENAME)
    .setTitle("Rename voice channel");
  const nameInput = new TextInputBuilder()
    .setCustomId(VM_FIELD_RENAME)
    .setLabel("New channel name")
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(100)
    .setRequired(true);
  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
  modal.addComponents(row);
  return modal;
}

export function buildPanelPayload(page: number) {
  const p = Math.max(0, Math.min(VM_PANEL_PAGES - 1, page));
  const titles = [
    "VoiceMaster — Access",
    "VoiceMaster — Channel tools",
    "VoiceMaster — Help",
  ];
  const bodies = [
    "**Button guide (page 1)**\n" +
      "🔒 Lock — only permitted users can connect\n" +
      "🔓 Unlock — allow everyone to connect again\n" +
      "👻 Ghost — hide the channel\n" +
      "👁️ Unghost — show the channel again\n" +
      "📌 Claim — take over an empty owner slot\n\n" +
      "_Stay in **your** VoiceMaster channel while using these._",
    "**Page 2**\n" +
      "Use the **Disconnect** menu to remove someone from voice.\n" +
      "ℹ️ **Info** — channel details (ephemeral)\n" +
      "➕ **Increase limit** / ➖ **Decrease limit** — user cap (0 = no limit)\n" +
      "✏️ **Rename** — opens a popup to set the name\n\n" +
      "_Owner or Administrator._",
    "Prefix: **`.voicemaster`** (alias **`.vm`**). Examples: `.voicemaster name`, `.voicemaster limit`, `.voicemaster bitrate`, `.voicemaster transfer @user`, `.voicemaster configuration`.\n\n" +
      "Admins: `.voicemaster setup`, `.voicemaster sendinterface`, `.voicemaster reset`.",
  ];

  const embed = minimalEmbed({
    title: titles[p] ?? titles[0],
    description: `${bodies[p] ?? bodies[0]}\n\n_Page ${p + 1} of ${VM_PANEL_PAGES}_`,
  });

  const rowButtons = (parts: MessageActionRowComponentBuilder[]) =>
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      ...parts,
    );

  const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

  if (p === 0) {
    rows.push(
      rowButtons([
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "lock"))
          .setLabel("Lock")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🔒"),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "unlock"))
          .setLabel("Unlock")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("🔓"),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "ghost"))
          .setLabel("Ghost")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("👻"),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "unghost"))
          .setLabel("Unghost")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("👁️"),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "claim"))
          .setLabel("Claim")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("📌"),
      ]),
    );
  } else if (p === 1) {
    const disconnectRow =
      new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
        new UserSelectMenuBuilder()
          .setCustomId(panelCustomId("sel", "disconnect"))
          .setPlaceholder("Disconnect a member…")
          .setMinValues(1)
          .setMaxValues(1),
      );
    rows.push(disconnectRow);

    rows.push(
      rowButtons([
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "info"))
          .setLabel("Info")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("ℹ️"),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "liminc"))
          .setLabel("Increase limit")
          .setStyle(ButtonStyle.Success)
          .setEmoji("➕"),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "limdec"))
          .setLabel("Decrease limit")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("➖"),
        new ButtonBuilder()
          .setCustomId(panelCustomId("act", "rename"))
          .setLabel("Rename")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("✏️"),
      ]),
    );
  }

  rows.push(
    rowButtons([
      new ButtonBuilder()
        .setCustomId(panelCustomId("nav", String(Math.max(0, p - 1))))
        .setLabel("◀")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(p <= 0),
      new ButtonBuilder()
        .setCustomId(
          panelCustomId("nav", String(Math.min(VM_PANEL_PAGES - 1, p + 1))),
        )
        .setLabel("▶")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(p >= VM_PANEL_PAGES - 1),
    ]),
  );

  return { embeds: [embed], components: rows };
}
