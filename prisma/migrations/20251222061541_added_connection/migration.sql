-- CreateEnum
CREATE TYPE "ConnectionPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('PROFILE', 'PAGE', 'BUSINESS');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "Connection" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "original_id" TEXT NOT NULL,
    "platform" "ConnectionPlatform" NOT NULL,
    "type" "ConnectionType" NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "name" TEXT,
    "email" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connection_uid_key" ON "Connection"("uid");

-- CreateIndex
CREATE INDEX "Connection_status_idx" ON "Connection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_platform_original_id_key" ON "Connection"("platform", "original_id");
