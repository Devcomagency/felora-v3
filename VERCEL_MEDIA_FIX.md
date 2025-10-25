# 🔧 Guide de Configuration Vercel - Fix Médias Cassés

## 🚨 Problème Identifié

Les images/vidéos sont **cassées en production** (écran noir, icône fichier cassé) à cause de :

1. ❌ Variable d'environnement `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL` manquante sur Vercel
2. ❌ URLs stockées avec préfixe `undefined/` dans la base de données
3. ❌ URLs signées R2 temporaires (expirent après 7 jours)

---

## ✅ Solution en 3 Étapes

### 📝 Étape 1 : Configurer Vercel (CRITIQUE)

**Sur Vercel Dashboard → Votre projet → Settings → Environment Variables**

Ajouter cette variable :

```bash
Key   : NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL
Value : https://media.felora.ch
Scope : Production, Preview, Development
```

⚠️ **IMPORTANT** : Le préfixe `NEXT_PUBLIC_` est **OBLIGATOIRE** pour que Next.js expose la variable côté client.

**Puis redéployer :**
```bash
# Via CLI
vercel --prod

# OU via Dashboard
Settings → Deployments → Latest → Redeploy
```

---

### 🗄️ Étape 2 : Nettoyer les URLs Cassées en BDD

**En local, exécuter le script de migration :**

```bash
# 1. Test en dry-run (aucune modification)
npx tsx scripts/fix-broken-media-urls.ts --dry-run

# 2. Appliquer les corrections
npx tsx scripts/fix-broken-media-urls.ts
```

**Ce script va :**
- ✅ Trouver tous les profils avec `undefined/` ou `null/` dans les URLs
- ✅ Nettoyer les URLs en supprimant ces préfixes
- ✅ Mettre à jour `profilePhoto` et `galleryPhotos` en BDD

**Exemple de correction :**
```
AVANT : undefined/profiles/cmg2ej3hb0001l804ija5iowz/1761387851637.jpg
APRÈS : profiles/cmg2ej3hb0001l804ija5iowz/1761387851637.jpg
```

---

### ☁️ Étape 3 : Vérifier Cloudflare R2 (Optionnel)

**Si vous utilisez Cloudflare R2, vérifier que le bucket est PUBLIC :**

1. **Cloudflare Dashboard** → R2 → Votre bucket → Settings
2. **Public Access** → Activer "Allow public access"
3. **Custom Domain** → Configurer `media.felora.ch` (si pas déjà fait)

**DNS Cloudflare :**
```
media.felora.ch  →  CNAME  →  <bucket-id>.r2.dev
```

---

## 🧪 Tests Après Déploiement

### Test 1 : Variable d'environnement
```bash
# Vérifier que la variable est accessible côté client
curl https://felora.ch/_next/data/.../search.json | grep "media.felora.ch"
```

### Test 2 : Images dans le feed
1. Aller sur https://felora.ch/search
2. Inspecter une card escort
3. Vérifier que les images commencent par `https://media.felora.ch/profiles/...`

### Test 3 : Upload de nouvelle image
1. Se connecter en tant qu'escort
2. Uploader une photo/vidéo
3. Vérifier dans la console que l'URL retournée est : `https://media.felora.ch/profiles/...`

---

## 🔍 Debugging

### Si les images sont toujours cassées :

**1. Vérifier les variables Vercel**
```bash
vercel env ls
```
Devrait afficher :
```
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://media.felora.ch (Production)
```

**2. Vérifier les logs Vercel**
```bash
vercel logs <deployment-url>
```
Chercher : `[CDN] CDN_BASE_URL not configured`

**3. Inspecter une image cassée dans le navigateur**
- Ouvrir la console (F12)
- Onglet Network → Filtrer "Img"
- Cliquer sur une image cassée
- Vérifier l'URL complète

**URLs attendues :**
```
✅ CORRECT : https://media.felora.ch/profiles/cmg2ej3hb0001l804ija5iowz/1761387851637.jpg
❌ FAUX    : undefined/profiles/cmg2ej3hb0001l804ija5iowz/1761387851637.jpg
❌ FAUX    : /uploads/profiles/cmg2ej3hb0001l804ija5iowz/1761387851637.jpg
```

---

## 📊 Fichiers Modifiés

### `src/lib/media/cdn.ts`
```typescript
// ✅ FIX: Nettoyer automatiquement les préfixes "undefined/" et "null/"
let cleanPath = path
  .replace(/^undefined\//, '')
  .replace(/^null\//, '')
  .replace(/^\/+/, '')
```

### `src/lib/storage.ts`
```typescript
// ✅ FIX: Retourner URL publique CDN au lieu d'URL signée temporaire
const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch'
const cdnUrl = `${publicUrl}/${key}`
return { url: cdnUrl, success: true, key }
```

---

## 🚀 Déploiement

```bash
# 1. Commit les changements
git add .
git commit -m "fix: Résolution URLs médias cassées en production"

# 2. Push vers production
git push origin main

# 3. Vercel redéploie automatiquement
# OU manuellement :
vercel --prod

# 4. Exécuter le script de migration
npx tsx scripts/fix-broken-media-urls.ts
```

---

## ⚠️ Important

- ✅ Les **nouvelles images** uploadées auront des URLs correctes automatiquement
- ✅ Les **anciennes images** nécessitent le script de migration
- ✅ Les changements sont **rétrocompatibles** (pas de régression)

---

## 💰 Coûts

```
✅ Cloudflare R2 : ~0.36€/mois pour 10 000 images (100% moins cher que AWS S3)
✅ Bande passante : Incluse avec Cloudflare
✅ Total estimé : < 1€/mois
```

---

## 📞 Support

Si le problème persiste après ces étapes :
1. Vérifier les logs Vercel : `vercel logs`
2. Tester en local : `npm run dev`
3. Comparer `.env.local` vs variables Vercel
