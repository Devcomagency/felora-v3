#!/bin/bash

# ============================================
# 🔒 SCRIPT DE MIGRATION DES SECRETS - FELORA V3
# ============================================
#
# Ce script aide à migrer en toute sécurité de l'ancien
# système d'authentification vers le nouveau système sécurisé
#
# Usage: ./migrate-secrets.sh
# ============================================

set -e  # Arrêter en cas d'erreur

echo "🔐 MIGRATION DES SECRETS - FELORA V3"
echo "===================================="
echo ""

# Couleurs pour les logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction de log
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================
# ÉTAPE 1: VÉRIFICATIONS PRÉLIMINAIRES
# ============================================
echo "📋 Étape 1: Vérifications préliminaires"
echo "----------------------------------------"

# Vérifier que bcryptjs est installé
if ! npm list bcryptjs >/dev/null 2>&1; then
    log_error "bcryptjs n'est pas installé"
    echo "Installation..."
    npm install bcryptjs
fi
log_success "Dépendances OK"

# Vérifier que .env.local existe
if [ ! -f ".env.local" ]; then
    log_error ".env.local n'existe pas"
    echo "Copie du template..."
    cp .env.template .env.local
    log_warning "Fichier .env.local créé - À remplir manuellement"
fi

# Créer backup
BACKUP_FILE=".env.local.backup-$(date +%Y%m%d-%H%M%S)"
cp .env.local "$BACKUP_FILE"
log_success "Backup créé: $BACKUP_FILE"

echo ""

# ============================================
# ÉTAPE 2: GÉNÉRATION DES NOUVEAUX SECRETS
# ============================================
echo "🔑 Étape 2: Génération des nouveaux secrets"
echo "--------------------------------------------"

# Générer NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)
log_success "NEXTAUTH_SECRET généré"

# Générer ADMIN_JWT_SECRET
ADMIN_JWT_SECRET=$(openssl rand -base64 32)
log_success "ADMIN_JWT_SECRET généré"

# Générer MEDIA_SIGNATURE_SECRET
MEDIA_SIGNATURE_SECRET=$(openssl rand -hex 32)
log_success "MEDIA_SIGNATURE_SECRET généré"

echo ""

# ============================================
# ÉTAPE 3: HASH DU MOT DE PASSE ADMIN
# ============================================
echo "🔒 Étape 3: Configuration admin"
echo "--------------------------------"

# Demander le nouveau mot de passe admin
echo ""
read -p "Entrez le NOUVEAU mot de passe admin (min 12 caractères): " -s ADMIN_PASSWORD
echo ""

if [ ${#ADMIN_PASSWORD} -lt 12 ]; then
    log_error "Mot de passe trop court (minimum 12 caractères)"
    exit 1
fi

# Générer le hash bcrypt
echo "Génération du hash bcrypt..."
ADMIN_PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('$ADMIN_PASSWORD', 10))")
log_success "Hash bcrypt généré"

echo ""

# ============================================
# ÉTAPE 4: MISE À JOUR DU FICHIER .env.local
# ============================================
echo "📝 Étape 4: Mise à jour .env.local"
echo "----------------------------------"

# Fonction pour mettre à jour ou ajouter une variable
update_or_add_env() {
    local key=$1
    local value=$2
    local file=".env.local"

    if grep -q "^${key}=" "$file" 2>/dev/null; then
        # La variable existe déjà - la remplacer
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${key}=.*|${key}=\"${value}\"|" "$file"
        else
            # Linux
            sed -i "s|^${key}=.*|${key}=\"${value}\"|" "$file"
        fi
    else
        # La variable n'existe pas - l'ajouter
        echo "${key}=\"${value}\"" >> "$file"
    fi
}

# Mettre à jour les secrets
update_or_add_env "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET"
log_success "NEXTAUTH_SECRET mis à jour"

update_or_add_env "ADMIN_PASSWORD_HASH" "$ADMIN_PASSWORD_HASH"
log_success "ADMIN_PASSWORD_HASH ajouté"

update_or_add_env "ADMIN_JWT_SECRET" "$ADMIN_JWT_SECRET"
log_success "ADMIN_JWT_SECRET ajouté"

update_or_add_env "MEDIA_SIGNATURE_SECRET" "$MEDIA_SIGNATURE_SECRET"
log_success "MEDIA_SIGNATURE_SECRET mis à jour"

# Commenter l'ancien ADMIN_PASSWORD (ne pas supprimer pour rollback)
if grep -q "^ADMIN_PASSWORD=" ".env.local"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/^ADMIN_PASSWORD=/#ADMIN_PASSWORD_LEGACY=/' ".env.local"
    else
        sed -i 's/^ADMIN_PASSWORD=/#ADMIN_PASSWORD_LEGACY=/' ".env.local"
    fi
    log_warning "ADMIN_PASSWORD commenté (legacy - à supprimer après tests)"
fi

echo ""

# ============================================
# ÉTAPE 5: RÉSUMÉ
# ============================================
echo "📊 Résumé de la migration"
echo "-------------------------"
echo ""
echo "✅ Secrets générés et configurés:"
echo "   - NEXTAUTH_SECRET (session)"
echo "   - ADMIN_JWT_SECRET (tokens JWT)"
echo "   - ADMIN_PASSWORD_HASH (bcrypt)"
echo "   - MEDIA_SIGNATURE_SECRET"
echo ""
echo "📁 Fichiers:"
echo "   - Backup: $BACKUP_FILE"
echo "   - Config: .env.local (mis à jour)"
echo ""

log_warning "⚠️  ACTIONS MANUELLES REQUISES:"
echo ""
echo "1️⃣  RÉGÉNÉRER LES CLÉS API EXTERNES:"
echo "   → Cloudflare R2: https://dash.cloudflare.com"
echo "   → Resend: https://resend.com/api-keys"
echo "   → Bunny.net: https://panel.bunny.net"
echo "   → Mux: https://dashboard.mux.com"
echo "   → Livepeer: https://livepeer.studio/dashboard"
echo ""
echo "2️⃣  METTRE À JOUR VERCEL (production):"
echo "   vercel env add NEXTAUTH_SECRET production"
echo "   vercel env add ADMIN_PASSWORD_HASH production"
echo "   vercel env add ADMIN_JWT_SECRET production"
echo "   vercel env add MEDIA_SIGNATURE_SECRET production"
echo ""
echo "3️⃣  TESTER EN LOCAL:"
echo "   npm run dev"
echo "   → Tester login admin"
echo "   → Tester upload image"
echo "   → Vérifier logs console"
echo ""
echo "4️⃣  APRÈS VALIDATION:"
echo "   → Supprimer #ADMIN_PASSWORD_LEGACY de .env.local"
echo "   → Révoquer anciennes clés API sur les dashboards"
echo ""

log_success "Migration terminée avec succès !"
echo ""
echo "💾 En cas de problème, restaurer avec:"
echo "   mv $BACKUP_FILE .env.local"
echo ""
