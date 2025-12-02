-- 🔥 SYNCHRONISATION : Compteurs globaux des profils escorts
-- Ce script recalcule les compteurs totalLikes et totalReacts pour tous les profils
-- en fonction des réactions existantes sur leurs médias

-- IMPORTANT : Ce script ne modifie PAS la structure de la base de données
-- Il recalcule uniquement les compteurs existants

-- IMPORTANT : Certaines réactions utilisent des mediaId hashés qui ne correspondent
-- pas à un vrai ID dans la table media. On utilise INNER JOIN pour ne compter
-- que les réactions dont le media existe vraiment dans la table.

-- Synchroniser les compteurs globaux des profils escorts
UPDATE escort_profiles ep
SET
  "totalLikes" = (
    SELECT COUNT(*)
    FROM reactions r
    INNER JOIN media m ON m.id = r."mediaId"
    WHERE m."ownerId" = ep.id
      AND m."ownerType" = 'ESCORT'
      AND m."deletedAt" IS NULL
      AND r.type = 'LIKE'
  ),
  "totalReacts" = (
    SELECT COUNT(*)
    FROM reactions r
    INNER JOIN media m ON m.id = r."mediaId"
    WHERE m."ownerId" = ep.id
      AND m."ownerType" = 'ESCORT'
      AND m."deletedAt" IS NULL
      AND r.type != 'LIKE'
  );

-- Afficher un résumé des changements
SELECT
  'Profils mis à jour' as action,
  COUNT(*) as count
FROM escort_profiles
WHERE "totalLikes" > 0 OR "totalReacts" > 0;

-- Afficher les 10 premiers profils avec le plus de réactions
SELECT
  id,
  "stageName",
  "totalLikes",
  "totalReacts",
  ("totalLikes" + "totalReacts") as total
FROM escort_profiles
WHERE "totalLikes" > 0 OR "totalReacts" > 0
ORDER BY ("totalLikes" + "totalReacts") DESC
LIMIT 10;
