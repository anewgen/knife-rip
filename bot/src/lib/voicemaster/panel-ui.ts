import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { getSiteApiBase } from "../../config";
import {
  VmAppEmoji,
  vmEmojiButton,
  vmEmojiMention,
} from "./app-emojis";

export const VM_PANEL_PAGES = 2;

/** Shown on ephemeral disconnect picker (`vm:sel:disconnectctx:<channelId>`). */
export const VM_SEL_DISCONNECT_CTX = panelCustomId("sel", "disconnectctx");

export function panelCustomId(kind: string, extra = ""): string {
  return `vm:${kind}${extra ? `:${extra}` : ""}`.slice(0, 100);
}

export function getVmPanelIconUrl(): string {
  return `${getSiteApiBase()}/voicemaster-panel.png`;
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

function buildPanelEmbed(page: number, iconUrl: string): EmbedBuilder {
  const p = Math.max(0, Math.min(VM_PANEL_PAGES - 1, page));
  const base = getSiteApiBase();
  const e = vmEmojiMention;

  const lock = e(VmAppEmoji.lock);
  const unlock = e(VmAppEmoji.unlock);
  const ghost = e(VmAppEmoji.ghost);
  const reveal = e(VmAppEmoji.reveal);
  const claim = e(VmAppEmoji.claim);
  const plug = e(VmAppEmoji.disconnect);
  const info = e(VmAppEmoji.info);
  const up = e(VmAppEmoji.limitUp);
  const down = e(VmAppEmoji.limitDown);
  const rename = e(VmAppEmoji.rename);

  const usage =
    `**Button Usage**\n` +
    `${lock} — [**Lock**](${base}/commands) the voice channel\n` +
    `${unlock} — [**Unlock**](${base}/commands) the voice channel\n` +
    `${ghost} — [**Hide**](${base}/commands) the voice channel\n` +
    `${reveal} — [**Reveal**](${base}/commands) the voice channel\n` +
    `${claim} — [**Claim**](${base}/commands) the voice channel\n` +
    `${plug} — [**Disconnect**](${base}/commands) a member from the voice channel\n` +
    `${info} — [**Information**](${base}/commands) about the voice channel\n` +
    `${up} / ${down} — [**Increase**](${base}/commands) / [**Decrease**](${base}/commands) user limit\n` +
    `${rename} — [**Rename**](${base}/commands) the voice channel`;

  const descriptions: Record<number, string> = {
    0:
      `Use the buttons below to control your voice channel.\n\n` +
      `${usage}\n\n` +
      `_Page ${p + 1} of ${VM_PANEL_PAGES}_`,
    1:
      `**Commands**\n` +
      `Prefix: **\`.voicemaster\`** (alias **\`.vm\`**).\n\n` +
      `• \`.vm name\`, \`.vm limit\`, \`.vm bitrate\`, \`.vm transfer @user\`, \`.vm configuration\`\n` +
      `• Admins: \`.vm setup\`, \`.vm sendinterface\`, \`.vm reset\`\n\n` +
      `_Page ${p + 1} of ${VM_PANEL_PAGES}_`,
  };

  return new EmbedBuilder()
    .setColor(0xffffff)
    .setAuthor({
      name: "VoiceMaster Interface",
      iconURL: iconUrl,
      url: base,
    })
    .setThumbnail(iconUrl)
    .setDescription(descriptions[p] ?? descriptions[0]);
}

export function buildPanelPayload(page: number) {
  const p = Math.max(0, Math.min(VM_PANEL_PAGES - 1, page));
  const iconUrl = getVmPanelIconUrl();
  const embed = buildPanelEmbed(p, iconUrl);
  const be = vmEmojiButton;

  const rowButtons = (parts: MessageActionRowComponentBuilder[]) =>
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      ...parts,
    );

  const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

  rows.push(
    rowButtons([
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "lock"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.lock)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "unlock"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.unlock)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "ghost"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.ghost)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "unghost"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.reveal)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "claim"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.claim)),
    ]),
  );

  rows.push(
    rowButtons([
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "disconnect"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.disconnect)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "info"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.info)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "liminc"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.limitUp)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "limdec"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.limitDown)),
      new ButtonBuilder()
        .setCustomId(panelCustomId("act", "rename"))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.rename)),
    ]),
  );

  rows.push(
    rowButtons([
      new ButtonBuilder()
        .setCustomId(panelCustomId("nav", String(Math.max(0, p - 1))))
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.arrowLeft))
        .setDisabled(p <= 0),
      new ButtonBuilder()
        .setCustomId(
          panelCustomId("nav", String(Math.min(VM_PANEL_PAGES - 1, p + 1))),
        )
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(be(VmAppEmoji.arrowRight))
        .setDisabled(p >= VM_PANEL_PAGES - 1),
    ]),
  );

  return { embeds: [embed], components: rows };
}
