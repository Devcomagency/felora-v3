-- CreateTable
CREATE TABLE "E2EEConversationRead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockerUserId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChatReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reporterUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "E2EEConversationRead_userId_idx" ON "E2EEConversationRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "E2EEConversationRead_conversationId_userId_key" ON "E2EEConversationRead"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "UserBlock_blockerUserId_idx" ON "UserBlock"("blockerUserId");

-- CreateIndex
CREATE INDEX "UserBlock_blockedUserId_idx" ON "UserBlock"("blockedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerUserId_blockedUserId_key" ON "UserBlock"("blockerUserId", "blockedUserId");
