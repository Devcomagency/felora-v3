-- AlterTable
ALTER TABLE "public"."escort_profiles" ADD COLUMN     "paymentMethods" TEXT,
ADD COLUMN     "rate15Min" DOUBLE PRECISION,
ADD COLUMN     "rate30Min" DOUBLE PRECISION;
