const DISCORD_API = "https://discord.com/api/v10";

export type KnifeRipPrivilegeSyncEnv = {
  guildId: string;
  ownerRoleId: string;
  premiumRoleId: string;
};

/**
 * knife.rip community: sync Discord roles with site entitlement (Stripe + handouts + static lists).
 * Set all three on Vercel and on the bot host. Bot role must sit above these roles in the hierarchy.
 */
export function getKnifeRipPrivilegeSyncEnv(): KnifeRipPrivilegeSyncEnv | null {
  const guildId = process.env.KNIFE_RIP_GUILD_ID?.trim();
  const ownerRoleId = process.env.KNIFE_RIP_OWNER_ROLE_ID?.trim();
  const premiumRoleId = process.env.KNIFE_RIP_PREMIUM_ROLE_ID?.trim();
  if (!guildId || !ownerRoleId || !premiumRoleId) return null;
  if (!/^\d{17,20}$/.test(guildId)) return null;
  if (!/^\d{17,20}$/.test(ownerRoleId)) return null;
  if (!/^\d{17,20}$/.test(premiumRoleId)) return null;
  return { guildId, ownerRoleId, premiumRoleId };
}

/**
 * Owners get the owner role only (hoisted “staff” tag). Everyone else with Pro gets the premium role.
 */
export function computePrivilegeRoleDelta(
  ent: { owner: boolean; premium: boolean },
  env: KnifeRipPrivilegeSyncEnv,
  currentRoleIds: readonly string[],
): { add: string[]; remove: string[] } {
  const { ownerRoleId, premiumRoleId } = env;
  const wantOwner = ent.owner;
  const wantPremium = ent.premium && !ent.owner;

  const hasOwner = currentRoleIds.includes(ownerRoleId);
  const hasPremium = currentRoleIds.includes(premiumRoleId);

  const add: string[] = [];
  const remove: string[] = [];

  if (wantOwner) {
    if (!hasOwner) add.push(ownerRoleId);
    if (hasPremium) remove.push(premiumRoleId);
  } else {
    if (hasOwner) remove.push(ownerRoleId);
    if (wantPremium) {
      if (!hasPremium) add.push(premiumRoleId);
    } else if (hasPremium) {
      remove.push(premiumRoleId);
    }
  }

  return { add, remove };
}

export type GuildMemberRolesFetch =
  | { ok: true; roleIds: string[] }
  | { ok: false; kind: "not_member" }
  | { ok: false; kind: "http_error"; status: number };

export async function fetchGuildMemberRoleIds(
  botToken: string,
  guildId: string,
  userId: string,
): Promise<GuildMemberRolesFetch> {
  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}`,
    {
      headers: { Authorization: `Bot ${botToken.trim()}` },
    },
  );
  if (res.status === 404) return { ok: false, kind: "not_member" };
  if (!res.ok) return { ok: false, kind: "http_error", status: res.status };
  const j = (await res.json()) as { roles?: string[] };
  const roleIds = Array.isArray(j.roles) ? j.roles : [];
  return { ok: true, roleIds };
}

async function discordMemberRoleRequest(
  method: "PUT" | "DELETE",
  botToken: string,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<Response> {
  return fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    {
      method,
      headers: { Authorization: `Bot ${botToken.trim()}` },
    },
  );
}

export async function applyPrivilegeRoleDelta(
  botToken: string,
  guildId: string,
  userId: string,
  delta: { add: string[]; remove: string[] },
): Promise<{ ok: boolean; detail?: string }> {
  for (const roleId of delta.remove) {
    const res = await discordMemberRoleRequest(
      "DELETE",
      botToken,
      guildId,
      userId,
      roleId,
    );
    if (!res.ok && res.status !== 404) {
      return {
        ok: false,
        detail: `remove role ${roleId}: HTTP ${res.status}`,
      };
    }
  }
  for (const roleId of delta.add) {
    const res = await discordMemberRoleRequest(
      "PUT",
      botToken,
      guildId,
      userId,
      roleId,
    );
    if (!res.ok) {
      return {
        ok: false,
        detail: `add role ${roleId}: HTTP ${res.status}`,
      };
    }
  }
  return { ok: true };
}

export async function syncKnifeRipPrivilegeRolesFromEntitlement(
  botToken: string,
  env: KnifeRipPrivilegeSyncEnv,
  discordUserId: string,
  ent: { owner: boolean; premium: boolean },
): Promise<
  { ok: true; skipped?: "not_member" | "no_change" } | { ok: false; detail: string }
> {
  const fetched = await fetchGuildMemberRoleIds(
    botToken,
    env.guildId,
    discordUserId,
  );
  if (!fetched.ok) {
    if (fetched.kind === "not_member") {
      return { ok: true, skipped: "not_member" };
    }
    return {
      ok: false,
      detail: `Discord API GET member failed (HTTP ${fetched.status})`,
    };
  }

  const delta = computePrivilegeRoleDelta(ent, env, fetched.roleIds);
  if (delta.add.length === 0 && delta.remove.length === 0) {
    return { ok: true, skipped: "no_change" };
  }

  const applied = await applyPrivilegeRoleDelta(
    botToken,
    env.guildId,
    discordUserId,
    delta,
  );
  if (!applied.ok) {
    return { ok: false, detail: applied.detail ?? "apply failed" };
  }
  return { ok: true };
}
