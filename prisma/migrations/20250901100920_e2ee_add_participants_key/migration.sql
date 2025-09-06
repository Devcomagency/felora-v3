/*
  Warnings:

  - Added the required column `participantsKey` to the `E2EEConversation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_E2EEConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "participants" JSONB NOT NULL,
    "participantsKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_E2EEConversation" ("createdAt", "id", "isGroup", "name", "participants", "participantsKey", "updatedAt") SELECT "createdAt", "id", "isGroup", "name", "participants", "conv_" || "id" || "_" || substr(hex(randomblob(8)), 1, 16), "updatedAt" FROM "E2EEConversation";
DROP TABLE "E2EEConversation";
ALTER TABLE "new_E2EEConversation" RENAME TO "E2EEConversation";
CREATE UNIQUE INDEX "E2EEConversation_participantsKey_key" ON "E2EEConversation"("participantsKey");
CREATE INDEX "E2EEConversation_isGroup_idx" ON "E2EEConversation"("isGroup");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
