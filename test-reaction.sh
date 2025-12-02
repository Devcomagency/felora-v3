#!/bin/bash

# Script de test rapide pour vérifier les réactions
# Usage: ./test-reaction.sh {profileId} {mediaId} {userId}

PROFILE_ID=$1
MEDIA_ID=$2
USER_ID=$3

if [ -z "$PROFILE_ID" ] || [ -z "$MEDIA_ID" ] || [ -z "$USER_ID" ]; then
  echo "❌ Usage: ./test-reaction.sh {profileId} {mediaId} {userId}"
  exit 1
fi

echo "🧪 TEST DE RÉACTION"
echo "==================="
echo "Profile ID: $PROFILE_ID"
echo "Media ID: $MEDIA_ID"
echo "User ID: $USER_ID"
echo ""

# 1. Vérifier l'état AVANT
echo "📊 État AVANT :"
psql $DATABASE_URL -c "
SELECT
  'Profile' as type,
  \"totalLikes\" as likes,
  \"totalReacts\" as reacts
FROM escort_profiles
WHERE id = '$PROFILE_ID';
"

# 2. Créer une réaction via l'API
echo ""
echo "🔥 Création d'une réaction LIKE..."
curl -X POST http://localhost:3000/api/reactions \
  -H "Content-Type: application/json" \
  -d "{\"mediaId\":\"$MEDIA_ID\",\"userId\":\"$USER_ID\",\"type\":\"LIKE\"}" \
  -s | jq '.'

# 3. Attendre 1 seconde
sleep 1

# 4. Vérifier l'état APRÈS
echo ""
echo "📊 État APRÈS :"
psql $DATABASE_URL -c "
SELECT
  'Profile' as type,
  \"totalLikes\" as likes,
  \"totalReacts\" as reacts
FROM escort_profiles
WHERE id = '$PROFILE_ID';
"

echo ""
echo "🔍 Vérification des réactions dans la DB :"
psql $DATABASE_URL -c "
SELECT
  r.\"mediaId\",
  r.type,
  r.\"userId\",
  m.\"ownerId\" as profile_id
FROM reactions r
LEFT JOIN media m ON m.id = r.\"mediaId\"
WHERE r.\"mediaId\" = '$MEDIA_ID'
  OR m.\"ownerId\" = '$PROFILE_ID';
"
