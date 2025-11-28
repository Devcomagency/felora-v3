#!/bin/bash
echo "🔐 GÉNÉRATEUR DE SECRETS SÉCURISÉS - FELORA V3"
echo "================================================"
echo ""

echo "1️⃣  NEXTAUTH_SECRET (clé de session)"
echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\""
echo ""

echo "2️⃣  ADMIN_JWT_SECRET (tokens admin JWT)"
echo "ADMIN_JWT_SECRET=\"$(openssl rand -base64 32)\""
echo ""

echo "3️⃣  MEDIA_SIGNATURE_SECRET (signatures médias)"
echo "MEDIA_SIGNATURE_SECRET=\"$(openssl rand -hex 32)\""
echo ""

echo "4️⃣  ADMIN_PASSWORD_HASH (exemple avec 'NouveauMotDePasse2025!')"
echo "ADMIN_PASSWORD_HASH=\"$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NouveauMotDePasse2025!', 10))")\""
echo ""

echo "⚠️  RAPPEL: Régénérer aussi sur les dashboards:"
echo "   - Cloudflare R2: https://dash.cloudflare.com"
echo "   - Resend: https://resend.com/api-keys"
echo "   - Bunny.net: https://panel.bunny.net"
echo "   - Mux: https://dashboard.mux.com"
echo "   - Livepeer: https://livepeer.studio/dashboard"
echo ""
