/*
  Warnings:

  - A unique constraint covering the columns `[user_id,platform,original_id]` on the table `Connection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Connection_platform_original_id_key";

-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPost" (
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

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" BIGSERIAL NOT NULL,
    "platform" "ConnectionPlatform" NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SocialPost_uid_key" ON "SocialPost"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSetting_platform_key" ON "PlatformSetting"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_user_id_platform_original_id_key" ON "Connection"("user_id", "platform", "original_id");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
