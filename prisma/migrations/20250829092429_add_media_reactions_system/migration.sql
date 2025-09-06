-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "price" INTEGER,
    "pos" INTEGER,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "reactCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reactions_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_access" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mediaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_access_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "media_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "escortId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "request" JSONB NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_club_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "openingHours" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "club_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_club_profiles" ("address", "avatarUrl", "coverUrl", "createdAt", "description", "handle", "id", "name", "openingHours", "updatedAt", "userId") SELECT "address", "avatarUrl", "coverUrl", "createdAt", "description", "handle", "id", "name", "openingHours", "updatedAt", "userId" FROM "club_profiles";
DROP TABLE "club_profiles";
ALTER TABLE "new_club_profiles" RENAME TO "club_profiles";
CREATE UNIQUE INDEX "club_profiles_userId_key" ON "club_profiles"("userId");
CREATE UNIQUE INDEX "club_profiles_handle_key" ON "club_profiles"("handle");
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
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalReacts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "escort_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_escort_profiles" ("acceptedClients", "acceptsGifts", "addressVisible", "availability", "availableNow", "bodyType", "bustSize", "canton", "city", "codePostal", "createdAt", "currency", "dateOfBirth", "description", "ethnicity", "eyeColor", "firstName", "galleryPhotos", "hairColor", "hasPrivatePhotos", "hasPrivateVideos", "hasProfilePhoto", "hasWebcamLive", "height", "id", "incall", "isVerifiedBadge", "languages", "latitude", "likes", "longitude", "messagingPreference", "minimumDuration", "nationality", "numero", "orientation", "outcall", "photosCount", "piercings", "practices", "profileCompleted", "profilePhoto", "rate1H", "rate2H", "rateFullDay", "rateHalfDay", "rateOvernight", "rates", "rating", "reviewCount", "rue", "services", "stageName", "status", "tattoos", "telegramChatId", "telegramConnected", "telegramEnabled", "telegramUsername", "timeSlots", "updatedAt", "userId", "verificationData", "videos", "videosCount", "views", "ville", "weekendAvailable", "workingArea") SELECT "acceptedClients", "acceptsGifts", "addressVisible", "availability", "availableNow", "bodyType", "bustSize", "canton", "city", "codePostal", "createdAt", "currency", "dateOfBirth", "description", "ethnicity", "eyeColor", "firstName", "galleryPhotos", "hairColor", "hasPrivatePhotos", "hasPrivateVideos", "hasProfilePhoto", "hasWebcamLive", "height", "id", "incall", "isVerifiedBadge", "languages", "latitude", "likes", "longitude", "messagingPreference", "minimumDuration", "nationality", "numero", "orientation", "outcall", "photosCount", "piercings", "practices", "profileCompleted", "profilePhoto", "rate1H", "rate2H", "rateFullDay", "rateHalfDay", "rateOvernight", "rates", "rating", "reviewCount", "rue", "services", "stageName", "status", "tattoos", "telegramChatId", "telegramConnected", "telegramEnabled", "telegramUsername", "timeSlots", "updatedAt", "userId", "verificationData", "videos", "videosCount", "views", "ville", "weekendAvailable", "workingArea" FROM "escort_profiles";
DROP TABLE "escort_profiles";
ALTER TABLE "new_escort_profiles" RENAME TO "escort_profiles";
CREATE UNIQUE INDEX "escort_profiles_userId_key" ON "escort_profiles"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "reactions_mediaId_userId_type_key" ON "reactions"("mediaId", "userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "media_access_mediaId_userId_key" ON "media_access"("mediaId", "userId");
