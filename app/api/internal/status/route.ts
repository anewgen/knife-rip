import { BOT_STATUS_SNAPSHOT_ID } from "@/lib/bot-status";
import { db } from "@/lib/db";
import { API } from "@/lib/safe-api-message";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 24_000;

type IncomingShard = {
  id: number;
  uptimeMs: number;
  latencyMs: number;
  guilds: number;
  users: number;
};

function isValidBody(body: unknown): body is {
  capturedAt: string;
  shardCount: number;
  shards: IncomingShard[];
} {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  if (typeof o.capturedAt !== "string") return false;
  if (typeof o.shardCount !== "number" || !Number.isFinite(o.shardCount)) return false;
  if (!Array.isArray(o.shards)) return false;
  for (const s of o.shards) {
    if (!s || typeof s !== "object") return false;
    const v = s as Record<string, unknown>;
    if (
      typeof v.id !== "number" ||
      typeof v.uptimeMs !== "number" ||
      typeof v.latencyMs !== "number" ||
      typeof v.guilds !== "number" ||
      typeof v.users !== "number"
    ) {
      return false;
    }
    if (
      !Number.isFinite(v.id) ||
      !Number.isFinite(v.uptimeMs) ||
      !Number.isFinite(v.latencyMs) ||
      !Number.isFinite(v.guilds) ||
      !Number.isFinite(v.users)
    ) {
      return false;
    }
  }
  return true;
}

export async function POST(req: NextRequest) {
  const expected = process.env.BOT_INTERNAL_SECRET;
  if (!expected) {
    return NextResponse.json(API.unavailable, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Body too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(API.badRequest, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json(API.badRequest, { status: 400 });
  }

  const payload = {
    capturedAt: body.capturedAt,
    shardCount: body.shardCount,
    shards: body.shards
      .map((s) => ({
        id: Math.floor(s.id),
        uptimeMs: Math.max(0, Math.floor(s.uptimeMs)),
        latencyMs: Math.max(0, Math.round(s.latencyMs * 100) / 100),
        guilds: Math.max(0, Math.floor(s.guilds)),
        users: Math.max(0, Math.floor(s.users)),
      }))
      .sort((a, b) => a.id - b.id),
  };

  await db.botCommandSnapshot.upsert({
    where: { id: BOT_STATUS_SNAPSHOT_ID },
    create: { id: BOT_STATUS_SNAPSHOT_ID, payload },
    update: { payload },
  });

  return NextResponse.json({ ok: true });
}

