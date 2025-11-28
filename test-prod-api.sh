#!/bin/bash

echo "🔍 TEST ADMIN LOGIN API - PRODUCTION"
echo "====================================="
echo ""

# Test avec le nouveau mot de passe
echo "1️⃣ Test nouveau mot de passe..."
RESPONSE_NEW=$(curl -s -w "\nHTTP_CODE:%{http_code}" https://felora.ch/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"info@devcom.ch","password":"Felora2025!SecureAdmin#1773d599"}')

HTTP_CODE_NEW=$(echo "$RESPONSE_NEW" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_NEW=$(echo "$RESPONSE_NEW" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $HTTP_CODE_NEW"
echo "Response: $BODY_NEW"
echo ""

# Test avec l'ancien mot de passe
echo "2️⃣ Test ancien mot de passe..."
RESPONSE_OLD=$(curl -s -w "\nHTTP_CODE:%{http_code}" https://felora.ch/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"info@devcom.ch","password":"Devcom20!"}')

HTTP_CODE_OLD=$(echo "$RESPONSE_OLD" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_OLD=$(echo "$RESPONSE_OLD" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $HTTP_CODE_OLD"
echo "Response: $BODY_OLD"
echo ""

# Test avec un mauvais mot de passe
echo "3️⃣ Test mauvais mot de passe..."
RESPONSE_BAD=$(curl -s -w "\nHTTP_CODE:%{http_code}" https://felora.ch/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"info@devcom.ch","password":"WrongPassword123"}')

HTTP_CODE_BAD=$(echo "$RESPONSE_BAD" | grep "HTTP_CODE:" | cut -d: -f2)
BODY_BAD=$(echo "$RESPONSE_BAD" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $HTTP_CODE_BAD"
echo "Response: $BODY_BAD"
echo ""

echo "====================================="
echo "📊 RÉSULTAT"
echo "====================================="
if [ "$HTTP_CODE_NEW" = "200" ]; then
  echo "✅ Nouveau mot de passe: FONCTIONNE"
else
  echo "❌ Nouveau mot de passe: NE FONCTIONNE PAS"
fi

if [ "$HTTP_CODE_OLD" = "200" ]; then
  echo "✅ Ancien mot de passe: FONCTIONNE (legacy)"
else
  echo "❌ Ancien mot de passe: Ne fonctionne pas"
fi
