# 🔧 Fix Sitemap - Erreurs Google Search Console

## 🎯 Problème

Google Search Console affiche l'erreur :
> **Cette URL n'est pas autorisée pour un sitemap situé à cet emplacement.**

Les URLs générées utilisent `https://felora-v3.vercel.app` au lieu de `https://felora.ch`.

---

## ✅ Solution Appliquée

### 1. Code du Sitemap Corrigé

**Fichier modifié :** `src/app/sitemap.ts`

Le code détecte maintenant automatiquement l'environnement de production :

```typescript
// Détection automatique du domaine en production
const isProduction = process.env.VERCEL_ENV === 'production'
const productionUrl = 'https://felora.ch'
const host = isProduction
  ? productionUrl
  : (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || productionUrl)
```

### 2. Routes Ajoutées

Les routes suivantes ont été ajoutées au sitemap :

- ✅ `/landing` - Landing page (priorité 0.95)
- ✅ `/clubs` - Liste des clubs (priorité 0.8)
- ✅ `/register` - Inscription (priorité 0.6)
- ✅ `/login` - Connexion (priorité 0.4)

### 3. Script de Vérification Créé

**Fichier créé :** `scripts/verify-sitemap.js`

Permet de vérifier le sitemap avant déploiement :

```bash
# Vérifier en local
npm run verify:sitemap

# Vérifier en production
npm run verify:sitemap:prod
```

---

## 🚀 Étapes de Déploiement

### Étape 1 : Configurer les Variables d'Environnement sur Vercel

Allez sur **Vercel Dashboard** → **felora-v3** → **Settings** → **Environment Variables**

#### Production Environment

Ajoutez/Modifiez ces variables pour l'environnement **Production** :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://felora.ch` |
| `NEXTAUTH_URL` | `https://felora.ch` |

#### Preview Environment (optionnel)

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://felora-v3.vercel.app` |
| `NEXTAUTH_URL` | `https://felora-v3.vercel.app` |

### Étape 2 : Redéployer

Après avoir configuré les variables :

1. **Commit** les changements du code :
   ```bash
   git add .
   git commit -m "fix: Corriger les URLs du sitemap pour Google Search Console"
   git push
   ```

2. **Redéployer** sur Vercel (automatique avec le push)

### Étape 3 : Vérifier le Sitemap

Une fois déployé, vérifiez le sitemap :

```bash
# Commande en ligne
curl https://felora.ch/sitemap.xml | grep -E "<loc>" | head -10

# Ou avec le script npm
npm run verify:sitemap:prod
```

**Résultat attendu :**
```xml
<loc>https://felora.ch</loc>
<loc>https://felora.ch/landing</loc>
<loc>https://felora.ch/search</loc>
<loc>https://felora.ch/map</loc>
<loc>https://felora.ch/profiles</loc>
...
```

### Étape 4 : Soumettre à Google Search Console

1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Sélectionnez la propriété **felora.ch**
3. Menu **Sitemaps** (dans la barre latérale)
4. **Supprimer** l'ancien sitemap (s'il y en a un)
5. **Ajouter** le nouveau sitemap : `https://felora.ch/sitemap.xml`
6. **Soumettre**

### Étape 5 : Vérifier les Erreurs

Attendez quelques heures (ou jours) et vérifiez dans Google Search Console :

- **Sitemaps** → Vérifier le statut
- **Couverture** → Vérifier qu'il n'y a plus d'erreurs "URL non autorisée"

---

## 🔍 Vérification Rapide

### URLs à Vérifier

Toutes ces URLs doivent être accessibles :

- ✅ https://felora.ch/
- ✅ https://felora.ch/landing
- ✅ https://felora.ch/search
- ✅ https://felora.ch/map
- ✅ https://felora.ch/profiles
- ✅ https://felora.ch/clubs
- ✅ https://felora.ch/legal/terms
- ✅ https://felora.ch/legal/privacy
- ✅ https://felora.ch/register
- ✅ https://felora.ch/login

### Commandes de Vérification

```bash
# Vérifier que le sitemap est accessible
curl -I https://felora.ch/sitemap.xml

# Vérifier le contenu
curl https://felora.ch/sitemap.xml

# Compter le nombre d'URLs
curl -s https://felora.ch/sitemap.xml | grep -c "<loc>"

# Vérifier qu'aucune URL ne contient "vercel.app"
curl -s https://felora.ch/sitemap.xml | grep "vercel.app"
# (ne doit rien retourner)
```

---

## 📊 Résultat Attendu

### Avant

```xml
<loc>https://felora-v3.vercel.app/</loc>          ❌
<loc>https://felora-v3.vercel.app/search</loc>    ❌
<loc>https://felora-v3.vercel.app/map</loc>       ❌
```

**Erreur Google :** "URL non autorisée"

### Après

```xml
<loc>https://felora.ch</loc>                      ✅
<loc>https://felora.ch/landing</loc>              ✅
<loc>https://felora.ch/search</loc>               ✅
<loc>https://felora.ch/map</loc>                  ✅
```

**Google Search Console :** Aucune erreur

---

## 📝 Checklist

- [x] Code du sitemap modifié (`src/app/sitemap.ts`)
- [x] Routes supplémentaires ajoutées (/landing, /clubs, etc.)
- [x] Script de vérification créé (`scripts/verify-sitemap.js`)
- [x] Scripts npm ajoutés au package.json
- [x] Documentation créée (VERCEL_ENV_CONFIG.md)
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Code committé et pushé
- [ ] Application redéployée sur Vercel
- [ ] Sitemap vérifié sur https://felora.ch/sitemap.xml
- [ ] Sitemap soumis à Google Search Console
- [ ] Erreurs Google Search Console vérifiées après 24-48h

---

## ⚠️ Important

**Domaine Custom** : Vérifiez que le domaine `felora.ch` est bien configuré :
- Vercel → Settings → Domains
- DNS configurés correctement
- Certificat SSL actif

**NextAuth** : Si vous utilisez l'authentification, assurez-vous que `NEXTAUTH_URL` pointe vers le bon domaine pour éviter les problèmes de redirection OAuth.

---

## 🆘 Dépannage

### Le sitemap affiche toujours "vercel.app"

1. Vérifiez les variables d'environnement sur Vercel
2. Redéployez l'application
3. Videz le cache CDN de Vercel
4. Attendez quelques minutes et réessayez

### Google Search Console n'accepte toujours pas le sitemap

1. Vérifiez que toutes les URLs du sitemap sont accessibles (HTTP 200)
2. Vérifiez que le domaine felora.ch est bien vérifié dans Search Console
3. Supprimez et resoumettez le sitemap
4. Attendez 24-48h pour l'indexation

### Erreur lors de la génération du sitemap

Vérifiez les logs Vercel :
```bash
vercel logs --follow
```

Vérifiez la connexion Prisma à la base de données.

---

*Document créé le 6 décembre 2025*
*Dernière mise à jour : 6 décembre 2025*
