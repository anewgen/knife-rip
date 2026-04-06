-- CreateTable
CREATE TABLE "BootstrapOwnerRevocation" (
    "discordUserId" TEXT NOT NULL,
    "revokedByDiscordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BootstrapOwnerRevocation_pkey" PRIMARY KEY ("discordUserId")
);
