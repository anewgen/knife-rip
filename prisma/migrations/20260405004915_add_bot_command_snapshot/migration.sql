-- CreateTable
CREATE TABLE "BotCommandSnapshot" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotCommandSnapshot_pkey" PRIMARY KEY ("id")
);
