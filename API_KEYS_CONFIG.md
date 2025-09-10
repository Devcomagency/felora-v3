# 🔑 Configuration des Clés API - FELORA v3

## 📋 Clés API requises

Créer un fichier `.env.local` dans la racine du projet avec les clés suivantes :

```env
# Database
DATABASE_URL="file:./prisma/prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="felora-secret-key-2024-production-ready"
NEXTAUTH_URL="http://localhost:3000"

# Sanity CMS (Projet FELORA Media)
NEXT_PUBLIC_SANITY_PROJECT_ID="rz1a0dwa"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-01-01"
NEXT_PUBLIC_SANITY_TOKEN="sk-your-token-here"

# OAuth Google (optionnel)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend Email Service (recommandé)
RESEND_API_KEY="re_your-resend-api-key-here"
RESEND_FROM="Felora <no-reply@felora.com>"

# SMTP Email (alternative - pour envoi d'emails réels)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Felora <no-reply@felora.com>"

# Mapbox (pour la carte)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-mapbox-token"

# Cloudflare R2 (pour stockage de fichiers)
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_ACCESS_KEY="your-access-key"
CLOUDFLARE_R2_SECRET_KEY="your-secret-key"
CLOUDFLARE_R2_BUCKET="felora-media"
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"

# Storage Provider (local, base64, cloudflare-r2)
STORAGE_PROVIDER="base64"

# Development flags
NODE_ENV="development"
NEXT_PUBLIC_CAPTCHA_DISABLED="true"
```

## 🎯 Clés prioritaires pour le fonctionnement

### 1. **NEXTAUTH_SECRET** (OBLIGATOIRE)
- Générer avec : `openssl rand -base64 32`
- Ou utiliser : `felora-secret-key-2024-production-ready`

### 2. **NEXT_PUBLIC_SANITY_PROJECT_ID** (Déjà configuré)
- Projet Sanity existant : `rz1a0dwa`
- Dataset : `production`

### 3. **NEXT_PUBLIC_SANITY_TOKEN** (À obtenir)
- Aller sur : https://sanity.io/manage
- Sélectionner le projet `rz1a0dwa`
- Créer un token avec permissions `Read`

## 🚀 Configuration minimale pour tester

Pour tester immédiatement, créer `.env.local` avec seulement :

```env
# Database
DATABASE_URL="file:./prisma/prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="felora-secret-key-2024-production-ready"
NEXTAUTH_URL="http://localhost:3000"

# Sanity (optionnel - utilise Picsum par défaut)
NEXT_PUBLIC_SANITY_PROJECT_ID="rz1a0dwa"
NEXT_PUBLIC_SANITY_DATASET="production"

# Development
NODE_ENV="development"
NEXT_PUBLIC_CAPTCHA_DISABLED="true"
```

## 📝 Instructions

1. **Créer le fichier** : `touch .env.local`
2. **Copier le contenu** minimal ci-dessus
3. **Redémarrer** : `npm start`
4. **Tester** : L'application fonctionnera avec les données mock

## ✅ Statut actuel

- ✅ **Base de données** : SQLite configurée
- ✅ **Authentification** : NextAuth fonctionnel
- ✅ **Vérification email** : Système en mémoire
- ✅ **Upload de médias** : Base64 par défaut
- ✅ **Feed** : Picsum (images de démonstration)
- ⏳ **Sanity** : Nécessite token API
- ⏳ **SMTP** : Optionnel pour emails réels
- ⏳ **Mapbox** : Optionnel pour carte interactive
