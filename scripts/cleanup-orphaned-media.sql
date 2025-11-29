-- 🧹 Script de nettoyage des médias orphelins
-- Exécuter ce script si vous voulez nettoyer la base de données

-- =====================================
-- ÉTAPE 1 : ANALYSE (lecture seule)
-- =====================================

-- Compter les médias orphelins (clubs supprimés)
SELECT
  'Médias avec clubs supprimés' as type,
  COUNT(*) as count
FROM "Media"
WHERE "ownerType" = 'CLUB'
AND "ownerId" NOT IN (SELECT id FROM "ClubProfile")
AND "deletedAt" IS NULL;

-- Compter les médias avec ownerId "unknown"
SELECT
  'Médias avec ownerId unknown' as type,
  COUNT(*) as count
FROM "Media"
WHERE "ownerId" = 'unknown'
AND "deletedAt" IS NULL;

-- Compter les médias orphelins (escorts supprimés)
SELECT
  'Médias avec escorts supprimés' as type,
  COUNT(*) as count
FROM "Media"
WHERE "ownerType" = 'ESCORT'
AND "ownerId" <> 'unknown'
AND "ownerId" NOT IN (SELECT id FROM "EscortProfile")
AND "deletedAt" IS NULL;

-- Voir des exemples de médias orphelins
SELECT
  "id",
  "ownerType",
  "ownerId",
  "url",
  "createdAt"
FROM "Media"
WHERE (
  ("ownerType" = 'CLUB' AND "ownerId" NOT IN (SELECT id FROM "ClubProfile"))
  OR ("ownerType" = 'ESCORT' AND "ownerId" <> 'unknown' AND "ownerId" NOT IN (SELECT id FROM "EscortProfile"))
)
AND "deletedAt" IS NULL
LIMIT 10;

-- =====================================
-- ÉTAPE 2 : NETTOYAGE (⚠️ DESTRUCTIF)
-- =====================================
-- ⚠️ ATTENTION : Décommentez ces lignes UNIQUEMENT si vous voulez SUPPRIMER les médias orphelins

-- Option A : Soft delete (recommandé - garde les données)
/*
UPDATE "Media"
SET "deletedAt" = NOW()
WHERE (
  ("ownerType" = 'CLUB' AND "ownerId" NOT IN (SELECT id FROM "ClubProfile"))
  OR ("ownerType" = 'ESCORT' AND "ownerId" <> 'unknown' AND "ownerId" NOT IN (SELECT id FROM "EscortProfile"))
)
AND "deletedAt" IS NULL;
*/

-- Option B : Hard delete (⚠️ DÉFINITIF - supprime les données)
/*
DELETE FROM "Media"
WHERE (
  ("ownerType" = 'CLUB' AND "ownerId" NOT IN (SELECT id FROM "ClubProfile"))
  OR ("ownerType" = 'ESCORT' AND "ownerId" <> 'unknown' AND "ownerId" NOT IN (SELECT id FROM "EscortProfile"))
)
AND "deletedAt" IS NULL;
*/

-- Option C : Mettre ownerId à "unknown" (garde les médias visibles)
/*
UPDATE "Media"
SET "ownerId" = 'unknown'
WHERE (
  ("ownerType" = 'CLUB' AND "ownerId" NOT IN (SELECT id FROM "ClubProfile"))
  OR ("ownerType" = 'ESCORT' AND "ownerId" <> 'unknown' AND "ownerId" NOT IN (SELECT id FROM "EscortProfile"))
)
AND "ownerId" <> 'unknown'
AND "deletedAt" IS NULL;
*/

-- =====================================
-- ÉTAPE 3 : VÉRIFICATION POST-NETTOYAGE
-- =====================================

-- Compter les médias restants par type de propriétaire
SELECT
  "ownerType",
  COUNT(*) as total,
  COUNT(CASE WHEN "deletedAt" IS NULL THEN 1 END) as active,
  COUNT(CASE WHEN "deletedAt" IS NOT NULL THEN 1 END) as deleted
FROM "Media"
GROUP BY "ownerType";

-- Vérifier qu'il n'y a plus d'orphelins (devrait retourner 0)
SELECT COUNT(*) as orphans_remaining
FROM "Media"
WHERE (
  ("ownerType" = 'CLUB' AND "ownerId" NOT IN (SELECT id FROM "ClubProfile") AND "ownerId" <> 'unknown')
  OR ("ownerType" = 'ESCORT' AND "ownerId" NOT IN (SELECT id FROM "EscortProfile") AND "ownerId" <> 'unknown')
)
AND "deletedAt" IS NULL;
