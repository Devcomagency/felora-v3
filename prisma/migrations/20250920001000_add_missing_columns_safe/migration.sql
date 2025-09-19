-- Migration sécurisée pour ajouter les colonnes manquantes
-- Utilise ADD COLUMN IF NOT EXISTS pour éviter les erreurs

-- Add missing rate columns
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "rate15Min" DOUBLE PRECISION;
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "rate30Min" DOUBLE PRECISION;

-- Add missing payment and currency columns
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "paymentMethods" TEXT;
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'CHF';

-- Add missing physical appearance columns
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "hairLength" TEXT;
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "breastType" TEXT;
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "pubicHair" TEXT;
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "smoker" BOOLEAN;

-- Add missing service columns
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "minimumDuration" TEXT;
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "orientation" TEXT;
ALTER TABLE "escort_profiles" ADD COLUMN IF NOT EXISTS "acceptedClients" TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_escort_profiles_rate15Min" ON "escort_profiles"("rate15Min");
CREATE INDEX IF NOT EXISTS "idx_escort_profiles_rate30Min" ON "escort_profiles"("rate30Min");