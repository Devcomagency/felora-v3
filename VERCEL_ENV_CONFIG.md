# ⚙️ Configuration Variables d'Environnement Vercel

## 🎯 Problème Résolu

Le sitemap générait des URLs avec `https://felora-v3.vercel.app` au lieu de `https://felora.ch`, ce qui causait des erreurs dans Google Search Console.

## ✅ Solution Appliquée

Le code du sitemap (`src/app/sitemap.ts`) a été modifié pour détecter automatiquement l'environnement de production et utiliser le bon domaine.

### Code Ajouté

```typescript
// Détection automatique du domaine en production
const isProduction = process.env.VERCEL_ENV === 'production'
const productionUrl = 'https://felora.ch'
const host = isProduction
  ? productionUrl
  : (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || productionUrl)
```

---

## 🔧 Configuration Vercel Recommandée

### Variables d'Environnement à Configurer

Allez sur **Vercel Dashboard** → **Votre Projet** → **Settings** → **Environment Variables**

#### Pour Production (Production Environment)

```bash
NEXT_PUBLIC_APP_URL=https://felora.ch
NEXTAUTH_URL=https://felora.ch
```

#### Pour Preview (Preview Environment)

```bash
NEXT_PUBLIC_APP_URL=https://felora-v3.vercel.app
NEXTAUTH_URL=https://felora-v3.vercel.app
```

#### Pour Development (Development Environment)

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

---

## 📋 Variables VERCEL automatiques

Vercel fournit automatiquement ces variables :

- `VERCEL_ENV` : `production` | `preview` | `development`
- `VERCEL_URL` : URL automatique du déploiement
- `VERCEL_PROJECT_PRODUCTION_URL` : URL de production du projet

Notre code utilise `VERCEL_ENV === 'production'` pour forcer l'utilisation de `https://felora.ch` en production.

---

## 🚀 Déploiement

Après avoir configuré les variables :

1. **Redéployer** l'application sur Vercel
2. **Vérifier** le sitemap : `https://felora.ch/sitemap.xml`
3. **Soumettre** à nouveau le sitemap dans Google Search Console

### Vérification du Sitemap

```bash
curl https://felora.ch/sitemap.xml | grep -E "<loc>" | head -10
```

Toutes les URLs doivent commencer par `https://felora.ch/` et non `https://felora-v3.vercel.app/`.

---

## 📝 Checklist

- [x] Code du sitemap modifié pour détecter l'environnement
- [ ] Variables d'environnement configurées sur Vercel (Production)
- [ ] Variables d'environnement configurées sur Vercel (Preview)
- [ ] Redéploiement effectué
- [ ] Sitemap vérifié sur https://felora.ch/sitemap.xml
- [ ] Sitemap resoumis à Google Search Console
- [ ] Erreurs Google Search Console vérifiées et résolues

---

## ⚠️ Important

**Domaine Custom** : Assurez-vous que le domaine `felora.ch` est bien configuré dans Vercel (Settings → Domains) et que les DNS pointent correctement vers Vercel.

**NextAuth** : Si vous utilisez NextAuth, la variable `NEXTAUTH_URL` doit correspondre au domaine réel pour que les redirects OAuth fonctionnent correctement.

---

*Document créé le 6 décembre 2025*
