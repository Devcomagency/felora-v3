-- Add totalLikes and totalReacts to club_profiles_v2
ALTER TABLE "club_profiles_v2"
  ADD COLUMN IF NOT EXISTS "totalLikes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalReacts" INTEGER NOT NULL DEFAULT 0;

-- Update existing clubs with current reaction counts
UPDATE "club_profiles_v2" cp
SET
  "totalLikes" = COALESCE((
    SELECT COUNT(*)
    FROM "reactions" r
    INNER JOIN "media" m ON m.id = r."mediaId"
    WHERE m."ownerId" = cp.id
      AND m."ownerType" = 'CLUB'
      AND m."deletedAt" IS NULL
      AND r.type = 'LIKE'
  ), 0),
  "totalReacts" = COALESCE((
    SELECT COUNT(*)
    FROM "reactions" r
    INNER JOIN "media" m ON m.id = r."mediaId"
    WHERE m."ownerId" = cp.id
      AND m."ownerType" = 'CLUB'
      AND m."deletedAt" IS NULL
      AND r.type != 'LIKE'
  ), 0);
