-- CreateEnum
CREATE TYPE "public"."KycStatusV2" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."WalletTxType" AS ENUM ('FUND', 'PURCHASE_GIFT', 'TRANSFER', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."PlanIntervalV2" AS ENUM ('TRIAL', 'WEEK', 'MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CLIENT', 'ESCORT', 'SALON', 'CLUB', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."EscortStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'VERIFIED', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "public"."ConversationType" AS ENUM ('FREE', 'PREMIUM', 'VIP');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'GIFT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "public"."SubscriptionPlan" AS ENUM ('TRIAL', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING_PAYMENT');

-- CreateEnum
CREATE TYPE "public"."DiamondTransactionType" AS ENUM ('PURCHASE', 'TRANSFER', 'GIFT', 'REFUND', 'BONUS');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('STRIPE', 'TWINT', 'CRYPTO', 'PAYPAL');

-- CreateEnum
CREATE TYPE "public"."DiamondTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."CustomOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."CustomOrderType" AS ENUM ('PHOTO', 'VIDEO', 'VIDEO_CALL', 'MESSAGE', 'BUNDLE');

-- CreateEnum
CREATE TYPE "public"."CustomOrderPriority" AS ENUM ('STANDARD', 'EXPRESS', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'REQUESTABLE');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('LIKE', 'LOVE', 'FIRE', 'WOW', 'SMILE');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passwordHash" TEXT,
    "phoneE164" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."escort_profiles_v2" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "public"."KycStatusV2" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escort_profiles_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."club_profiles_v2" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "companyName" TEXT,
    "ideNumber" TEXT,
    "managerName" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "kycStatus" "public"."KycStatusV2" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_profiles_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kyc_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "docFrontUrl" TEXT,
    "docBackUrl" TEXT,
    "selfieUrl" TEXT,
    "selfieSignUrl" TEXT,
    "livenessVideoUrl" TEXT,
    "status" "public"."KycStatusV2" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plans_v2" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interval" "public"."PlanIntervalV2" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "city" TEXT,
    "preferences" JSONB,
    "verifyLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."escort_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
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
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "services" TEXT NOT NULL,
    "rates" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "galleryPhotos" TEXT NOT NULL,
    "videos" TEXT NOT NULL,
    "status" "public"."EscortStatus" NOT NULL DEFAULT 'PENDING',
    "verificationData" JSONB,
    "isVerifiedBadge" BOOLEAN NOT NULL DEFAULT false,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "photosCount" INTEGER NOT NULL DEFAULT 0,
    "videosCount" INTEGER NOT NULL DEFAULT 0,
    "hasProfilePhoto" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
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
    "rate1H" DOUBLE PRECISION,
    "rate2H" DOUBLE PRECISION,
    "rateHalfDay" DOUBLE PRECISION,
    "rateFullDay" DOUBLE PRECISION,
    "rateOvernight" DOUBLE PRECISION,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptsCouples" BOOLEAN NOT NULL DEFAULT false,
    "acceptsHandicapped" BOOLEAN NOT NULL DEFAULT false,
    "acceptsSeniors" BOOLEAN NOT NULL DEFAULT false,
    "acceptsWomen" BOOLEAN NOT NULL DEFAULT false,
    "breastType" TEXT,
    "phoneVisibility" TEXT DEFAULT 'hidden',
    "pubicHair" TEXT,
    "smoker" BOOLEAN,

    CONSTRAINT "escort_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salon_profiles" (
    "id" TEXT NOT NULL,
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
    "status" "public"."EscortStatus" NOT NULL DEFAULT 'PENDING',
    "businessDocuments" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "managedEscorts" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."club_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "openingHours" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "type" "public"."ConversationType" NOT NULL DEFAULT 'FREE',
    "clientId" TEXT NOT NULL,
    "escortId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "type" "public"."MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."escort_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "public"."SubscriptionPlan" NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escort_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."diamond_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diamond_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."diamond_transactions" (
    "id" TEXT NOT NULL,
    "type" "public"."DiamondTransactionType" NOT NULL,
    "status" "public"."DiamondTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "paymentMethod" "public"."PaymentMethod",
    "paymentAmount" DOUBLE PRECISION,
    "paymentCurrency" TEXT DEFAULT 'CHF',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "externalTransactionId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diamond_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."diamond_packs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "diamonds" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CHF',
    "bonusDiamonds" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "icon" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diamond_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."diamond_gifts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL,
    "emoji" TEXT,
    "color" TEXT,
    "animationType" TEXT,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diamond_gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_orders" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "escortId" TEXT NOT NULL,
    "type" "public"."CustomOrderType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" JSONB,
    "proposedPrice" INTEGER,
    "finalPrice" INTEGER,
    "priority" "public"."CustomOrderPriority" NOT NULL DEFAULT 'STANDARD',
    "estimatedDelivery" TIMESTAMP(3),
    "status" "public"."CustomOrderStatus" NOT NULL DEFAULT 'PENDING',
    "escortNotes" TEXT,
    "clientFeedback" TEXT,
    "rating" INTEGER,
    "deliveredFiles" JSONB,
    "previewFiles" JSONB,
    "paidAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "identityKeyPub" TEXT NOT NULL,
    "signedPreKeyId" INTEGER NOT NULL,
    "signedPreKeyPub" TEXT NOT NULL,
    "signedPreKeySig" TEXT NOT NULL,
    "preKeysJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."E2EEConversation" (
    "id" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "participants" JSONB NOT NULL,
    "participantsKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "E2EEConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."E2EEMessageEnvelope" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "senderDeviceId" TEXT NOT NULL,
    "cipherText" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "status" "public"."DeliveryStatus" NOT NULL DEFAULT 'SENT',
    "attachmentUrl" TEXT,
    "attachmentMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "E2EEMessageEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."E2EEConversationRead" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "E2EEConversationRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserBlock" (
    "id" TEXT NOT NULL,
    "blockerUserId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatReport" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ChatReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "visibility" "public"."MediaVisibility" NOT NULL DEFAULT 'PUBLIC',
    "price" INTEGER,
    "pos" INTEGER,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "reactCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reactions" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_access" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_orders" (
    "id" TEXT NOT NULL,
    "escortId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "request" JSONB NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wallet_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "public"."WalletTxType" NOT NULL,
    "reference" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gift_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "lottieUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gift_events" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "giftCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "escort_profiles_v2_userId_key" ON "public"."escort_profiles_v2"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "escort_profiles_v2_handle_key" ON "public"."escort_profiles_v2"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_v2_userId_key" ON "public"."club_profiles_v2"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_v2_handle_key" ON "public"."club_profiles_v2"("handle");

-- CreateIndex
CREATE INDEX "kyc_submissions_userId_status_idx" ON "public"."kyc_submissions"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "plans_v2_code_key" ON "public"."plans_v2"("code");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_userId_key" ON "public"."client_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "escort_profiles_userId_key" ON "public"."escort_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "salon_profiles_userId_key" ON "public"."salon_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "salon_profiles_siret_key" ON "public"."salon_profiles"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "salon_profiles_ideNumber_key" ON "public"."salon_profiles"("ideNumber");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_userId_key" ON "public"."club_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_handle_key" ON "public"."club_profiles"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "public"."password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "public"."password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_email_key" ON "public"."email_verifications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "diamond_wallets_userId_key" ON "public"."diamond_wallets"("userId");

-- CreateIndex
CREATE INDEX "UserDevice_userId_idx" ON "public"."UserDevice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_deviceId_key" ON "public"."UserDevice"("userId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "E2EEConversation_participantsKey_key" ON "public"."E2EEConversation"("participantsKey");

-- CreateIndex
CREATE INDEX "E2EEConversation_isGroup_idx" ON "public"."E2EEConversation"("isGroup");

-- CreateIndex
CREATE INDEX "E2EEMessageEnvelope_conversationId_createdAt_idx" ON "public"."E2EEMessageEnvelope"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "E2EEMessageEnvelope_conversationId_messageId_key" ON "public"."E2EEMessageEnvelope"("conversationId", "messageId");

-- CreateIndex
CREATE INDEX "E2EEConversationRead_userId_idx" ON "public"."E2EEConversationRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "E2EEConversationRead_conversationId_userId_key" ON "public"."E2EEConversationRead"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "UserBlock_blockerUserId_idx" ON "public"."UserBlock"("blockerUserId");

-- CreateIndex
CREATE INDEX "UserBlock_blockedUserId_idx" ON "public"."UserBlock"("blockedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerUserId_blockedUserId_key" ON "public"."UserBlock"("blockerUserId", "blockedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_mediaId_userId_type_key" ON "public"."reactions"("mediaId", "userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "media_access_mediaId_userId_key" ON "public"."media_access"("mediaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "public"."wallets"("userId");

-- CreateIndex
CREATE INDEX "wallet_transactions_walletId_createdAt_idx" ON "public"."wallet_transactions"("walletId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "gift_catalog_code_key" ON "public"."gift_catalog"("code");

-- CreateIndex
CREATE INDEX "gift_events_toUserId_createdAt_idx" ON "public"."gift_events"("toUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."escort_profiles_v2" ADD CONSTRAINT "escort_profiles_v2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."club_profiles_v2" ADD CONSTRAINT "club_profiles_v2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_profiles" ADD CONSTRAINT "client_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."escort_profiles" ADD CONSTRAINT "escort_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salon_profiles" ADD CONSTRAINT "salon_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."club_profiles" ADD CONSTRAINT "club_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversations" ADD CONSTRAINT "conversations_escortId_fkey" FOREIGN KEY ("escortId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."escort_subscriptions" ADD CONSTRAINT "escort_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diamond_wallets" ADD CONSTRAINT "diamond_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diamond_transactions" ADD CONSTRAINT "diamond_transactions_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."diamond_wallets"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diamond_transactions" ADD CONSTRAINT "diamond_transactions_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."diamond_wallets"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_orders" ADD CONSTRAINT "custom_orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_orders" ADD CONSTRAINT "custom_orders_escortId_fkey" FOREIGN KEY ("escortId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reactions" ADD CONSTRAINT "reactions_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media_access" ADD CONSTRAINT "media_access_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wallet_transactions" ADD CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
