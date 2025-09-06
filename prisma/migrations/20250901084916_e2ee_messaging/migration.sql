-- AlterTable
ALTER TABLE "users" ADD COLUMN "phoneE164" TEXT;

-- CreateTable
CREATE TABLE "escort_profiles_v2" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "escort_profiles_v2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "club_profiles_v2" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "companyName" TEXT,
    "ideNumber" TEXT,
    "managerName" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "club_profiles_v2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kyc_submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "docFrontUrl" TEXT,
    "docBackUrl" TEXT,
    "selfieUrl" TEXT,
    "selfieSignUrl" TEXT,
    "livenessVideoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "plans_v2" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "identityKeyPub" TEXT NOT NULL,
    "signedPreKeyId" INTEGER NOT NULL,
    "signedPreKeyPub" TEXT NOT NULL,
    "signedPreKeySig" TEXT NOT NULL,
    "preKeysJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "E2EEConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "participants" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "E2EEMessageEnvelope" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "senderDeviceId" TEXT NOT NULL,
    "cipherText" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "attachmentUrl" TEXT,
    "attachmentMeta" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    "readAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "escort_profiles_v2_userId_key" ON "escort_profiles_v2"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "escort_profiles_v2_handle_key" ON "escort_profiles_v2"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_v2_userId_key" ON "club_profiles_v2"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_v2_handle_key" ON "club_profiles_v2"("handle");

-- CreateIndex
CREATE INDEX "kyc_submissions_userId_status_idx" ON "kyc_submissions"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "plans_v2_code_key" ON "plans_v2"("code");

-- CreateIndex
CREATE INDEX "UserDevice_userId_idx" ON "UserDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_deviceId_key" ON "UserDevice"("userId", "deviceId");

-- CreateIndex
CREATE INDEX "E2EEConversation_isGroup_idx" ON "E2EEConversation"("isGroup");

-- CreateIndex
CREATE INDEX "E2EEMessageEnvelope_conversationId_createdAt_idx" ON "E2EEMessageEnvelope"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "E2EEMessageEnvelope_conversationId_messageId_key" ON "E2EEMessageEnvelope"("conversationId", "messageId");
