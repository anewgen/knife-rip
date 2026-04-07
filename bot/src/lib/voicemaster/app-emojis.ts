/**
 * Application emojis (Discord Developer Portal → your app → Emoji).
 * Used as <:name:id> in embeds and { id, name } on buttons.
 */
export const VmAppEmoji = {
  lock: { id: "1491168088929079608", name: "gridiconslock" },
  unlock: { id: "1491168087548887141", name: "siunlockfill" },
  info: { id: "1491168085414252696", name: "tablerinfosquarefilled" },
  limitUp: { id: "1491169577240101075", name: "icoutlineplus" },
  limitDown: { id: "1491169569866387546", name: "icroundminus" },
  reveal: { id: "1491168080825548820", name: "mdighostoff" },
  ghost: { id: "1491168079999140000", name: "mdighost" },
  claim: { id: "1491168078694842399", name: "materialsymbolscheckbox" },
  rename: { id: "1491168077751259176", name: "mdirenamebox" },
  disconnect: { id: "1491168076643696730", name: "fluentplugdisconnected16filled" },
  arrowLeft: { id: "1491168047057076336", name: "lucidearrowleft" },
  arrowRight: { id: "1491168045236752597", name: "lucidearrowright" },
} as const;

export function vmEmojiMention(emo: { id: string; name: string }): string {
  return `<:${emo.name}:${emo.id}>`;
}

export function vmEmojiButton(emo: { id: string; name: string }): {
  id: string;
  name: string;
} {
  return { id: emo.id, name: emo.name };
}
