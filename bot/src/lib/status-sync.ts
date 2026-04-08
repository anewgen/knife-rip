import type { Client } from "discord.js";
import { postStatusSnapshot } from "./site-client";

type ShardRow = {
  id: number;
  uptimeMs: number;
  latencyMs: number;
  guilds: number;
  users: number;
};

function isPrimaryShard(client: Client): boolean {
  if (!client.shard) return true;
  return client.shard.ids.includes(0);
}

async function collectShardRows(client: Client): Promise<ShardRow[]> {
  if (!client.shard) {
    const users = client.guilds.cache.reduce((n, g) => n + (g.memberCount ?? 0), 0);
    return [
      {
        id: 0,
        uptimeMs: client.uptime ?? 0,
        latencyMs: client.ws.ping,
        guilds: client.guilds.cache.size,
        users,
      },
    ];
  }

  const rows = await client.shard.broadcastEval((c) => {
    const users = c.guilds.cache.reduce((n, g) => n + (g.memberCount ?? 0), 0);
    const shardId = c.shard?.ids?.[0] ?? 0;
    return {
      id: shardId,
      uptimeMs: c.uptime ?? 0,
      latencyMs: c.ws.ping,
      guilds: c.guilds.cache.size,
      users,
    };
  });

  return rows.sort((a, b) => a.id - b.id);
}

export async function syncStatusToSite(client: Client): Promise<void> {
  if (!isPrimaryShard(client)) return;
  const shards = await collectShardRows(client);
  await postStatusSnapshot({
    capturedAt: new Date().toISOString(),
    shardCount: shards.length,
    shards,
  });
}

