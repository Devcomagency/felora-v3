-- CreateTable
CREATE TABLE "salon_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessName" TEXT,
    "siret" TEXT,
    "ideNumber" TEXT,
    "vatNumber" TEXT,
    "legalForm" TEXT,
    "canton" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'CH',
    "managerName" TEXT NOT NULL,
    "managerEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "openingHours" TEXT NOT NULL,
    "logo" TEXT,
    "photos" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "businessDocuments" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "managedEscorts" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "salon_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "escort_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "cancelledAt" DATETIME,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "escort_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diamond_wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "diamond_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diamond_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "paymentMethod" TEXT,
    "paymentAmount" REAL,
    "paymentCurrency" TEXT DEFAULT 'CHF',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "externalTransactionId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "diamond_transactions_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "diamond_wallets" ("userId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "diamond_transactions_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "diamond_wallets" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diamond_packs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "diamonds" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CHF',
    "bonusDiamonds" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "icon" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "diamond_gifts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL,
    "emoji" TEXT,
    "color" TEXT,
    "animationType" TEXT,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_escort_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "nationality" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "workingArea" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "rates" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "galleryPhotos" TEXT NOT NULL,
    "videos" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationData" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "telegramConnected" BOOLEAN NOT NULL DEFAULT false,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "messagingPreference" TEXT NOT NULL DEFAULT 'APP_ONLY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "escort_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_escort_profiles" ("availability", "city", "createdAt", "dateOfBirth", "description", "firstName", "galleryPhotos", "id", "languages", "likes", "nationality", "profilePhoto", "rates", "rating", "reviewCount", "services", "stageName", "status", "updatedAt", "userId", "verificationData", "videos", "views", "workingArea") SELECT "availability", "city", "createdAt", "dateOfBirth", "description", "firstName", "galleryPhotos", "id", "languages", "likes", "nationality", "profilePhoto", "rates", "rating", "reviewCount", "services", "stageName", "status", "updatedAt", "userId", "verificationData", "videos", "views", "workingArea" FROM "escort_profiles";
DROP TABLE "escort_profiles";
ALTER TABLE "new_escort_profiles" RENAME TO "escort_profiles";
CREATE UNIQUE INDEX "escort_profiles_userId_key" ON "escort_profiles"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "salon_profiles_userId_key" ON "salon_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "salon_profiles_siret_key" ON "salon_profiles"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "salon_profiles_ideNumber_key" ON "salon_profiles"("ideNumber");

-- CreateIndex
CREATE UNIQUE INDEX "diamond_wallets_userId_key" ON "diamond_wallets"("userId");
