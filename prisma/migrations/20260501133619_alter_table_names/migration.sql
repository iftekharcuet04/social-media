/*
  Warnings:

  - You are about to drop the `Connection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlatformSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocialPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SocialPost" DROP CONSTRAINT "SocialPost_user_id_fkey";

-- DropTable
DROP TABLE "Connection";

-- DropTable
DROP TABLE "PlatformSetting";

-- DropTable
DROP TABLE "SocialPost";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
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

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_posts" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "platform" "ConnectionPlatform" NOT NULL,
    "original_post_id" TEXT,
    "post_url" TEXT,
    "message" TEXT,
    "urls" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" BIGSERIAL NOT NULL,
    "platform" "ConnectionPlatform" NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "connections_uid_key" ON "connections"("uid");

-- CreateIndex
CREATE INDEX "connections_status_idx" ON "connections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "connections_user_id_platform_original_id_key" ON "connections"("user_id", "platform", "original_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_posts_uid_key" ON "social_posts"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "platform_settings_platform_key" ON "platform_settings"("platform");

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
