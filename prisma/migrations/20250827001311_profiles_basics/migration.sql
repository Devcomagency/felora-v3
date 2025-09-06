-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "club_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "openingHours" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "club_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "canton" TEXT,
    "codePostal" TEXT,
    "ville" TEXT,
    "rue" TEXT,
    "numero" TEXT,
    "addressVisible" BOOLEAN NOT NULL DEFAULT false,
    "latitude" REAL,
    "longitude" REAL,
    "services" TEXT NOT NULL,
    "rates" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "galleryPhotos" TEXT NOT NULL,
    "videos" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verificationData" JSONB,
    "isVerifiedBadge" BOOLEAN NOT NULL DEFAULT false,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "photosCount" INTEGER NOT NULL DEFAULT 0,
    "videosCount" INTEGER NOT NULL DEFAULT 0,
    "hasProfilePhoto" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "telegramConnected" BOOLEAN NOT NULL DEFAULT false,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "messagingPreference" TEXT NOT NULL DEFAULT 'APP_ONLY',
    "height" INTEGER,
    "bodyType" TEXT,
    "hairColor" TEXT,
    "eyeColor" TEXT,
    "ethnicity" TEXT,
    "bustSize" TEXT,
    "tattoos" TEXT,
    "piercings" TEXT,
    "rate1H" REAL,
    "rate2H" REAL,
    "rateHalfDay" REAL,
    "rateFullDay" REAL,
    "rateOvernight" REAL,
    "currency" TEXT NOT NULL DEFAULT 'CHF',
    "minimumDuration" TEXT,
    "practices" TEXT,
    "orientation" TEXT,
    "acceptedClients" TEXT,
    "outcall" BOOLEAN NOT NULL DEFAULT false,
    "incall" BOOLEAN NOT NULL DEFAULT false,
    "timeSlots" TEXT,
    "availableNow" BOOLEAN NOT NULL DEFAULT false,
    "weekendAvailable" BOOLEAN NOT NULL DEFAULT false,
    "hasPrivatePhotos" BOOLEAN NOT NULL DEFAULT false,
    "hasPrivateVideos" BOOLEAN NOT NULL DEFAULT false,
    "hasWebcamLive" BOOLEAN NOT NULL DEFAULT false,
    "acceptsGifts" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "escort_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_escort_profiles" ("acceptedClients", "acceptsGifts", "availability", "availableNow", "bodyType", "bustSize", "city", "createdAt", "currency", "dateOfBirth", "description", "ethnicity", "eyeColor", "firstName", "galleryPhotos", "hairColor", "hasPrivatePhotos", "hasPrivateVideos", "hasProfilePhoto", "hasWebcamLive", "height", "id", "incall", "isVerifiedBadge", "languages", "likes", "messagingPreference", "minimumDuration", "nationality", "orientation", "outcall", "photosCount", "piercings", "practices", "profileCompleted", "profilePhoto", "rate1H", "rate2H", "rateFullDay", "rateHalfDay", "rateOvernight", "rates", "rating", "reviewCount", "services", "stageName", "status", "tattoos", "telegramChatId", "telegramConnected", "telegramEnabled", "telegramUsername", "timeSlots", "updatedAt", "userId", "verificationData", "videos", "videosCount", "views", "weekendAvailable", "workingArea") SELECT "acceptedClients", "acceptsGifts", "availability", "availableNow", "bodyType", "bustSize", "city", "createdAt", "currency", "dateOfBirth", "description", "ethnicity", "eyeColor", "firstName", "galleryPhotos", "hairColor", "hasPrivatePhotos", "hasPrivateVideos", "hasProfilePhoto", "hasWebcamLive", "height", "id", "incall", "isVerifiedBadge", "languages", "likes", "messagingPreference", "minimumDuration", "nationality", "orientation", "outcall", "photosCount", "piercings", "practices", "profileCompleted", "profilePhoto", "rate1H", "rate2H", "rateFullDay", "rateHalfDay", "rateOvernight", "rates", "rating", "reviewCount", "services", "stageName", "status", "tattoos", "telegramChatId", "telegramConnected", "telegramEnabled", "telegramUsername", "timeSlots", "updatedAt", "userId", "verificationData", "videos", "videosCount", "views", "weekendAvailable", "workingArea" FROM "escort_profiles";
DROP TABLE "escort_profiles";
ALTER TABLE "new_escort_profiles" RENAME TO "escort_profiles";
CREATE UNIQUE INDEX "escort_profiles_userId_key" ON "escort_profiles"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_userId_key" ON "club_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_handle_key" ON "club_profiles"("handle");
