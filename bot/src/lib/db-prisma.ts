import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForBotPrisma = globalThis as unknown as {
  botPrisma: PrismaClient | undefined;
  botPgPool: Pool | undefined;
};

export function getBotPrisma(): PrismaClient {
  if (globalForBotPrisma.botPrisma) {
    return globalForBotPrisma.botPrisma;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString?.trim()) {
    throw new Error("DATABASE_URL is required for VoiceMaster");
  }

  const pool =
    globalForBotPrisma.botPgPool ?? new Pool({ connectionString });
  globalForBotPrisma.botPgPool = pool;

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  globalForBotPrisma.botPrisma = client;
  return client;
}
