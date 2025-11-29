# 📊 CONFIGURATION UMAMI ANALYTICS - FELORA

**Date:** 28 Novembre 2025

---

## ✅ IDENTIFIANTS UMAMI

**Website ID:** `7cfd3a1d-1479-4e3b-9029-2cea27ade7ac`
**Script URL:** `https://cloud.umami.is/script.js`
**Dashboard:** https://cloud.umami.is

---

## 🔧 VARIABLES À AJOUTER SUR VERCEL

Allez sur **Vercel → Settings → Environment Variables** et ajoutez:

### Variable 1:
```
Name: NEXT_PUBLIC_UMAMI_WEBSITE_ID
Value: 7cfd3a1d-1479-4e3b-9029-2cea27ade7ac
Environment: Production, Preview, Development (tous cochés)
```

### Variable 2:
```
Name: NEXT_PUBLIC_UMAMI_SRC
Value: https://cloud.umami.is/script.js
Environment: Production, Preview, Development (tous cochés)
```

---

## 📋 ÉTAPES VERCEL

1. **Vercel Dashboard** → Votre projet Felora
2. **Settings** → **Environment Variables**
3. Cliquer **"Add New"**
4. Ajouter les 2 variables ci-dessus
5. Cliquer **"Save"** pour chaque variable
6. **Deployments** → Cliquer sur le dernier deploy → **"Redeploy"**
7. Attendre que le statut soit "Ready"

---

## ✅ VÉRIFIER QUE ÇA FONCTIONNE

1. Allez sur **https://felora.ch**
2. Ouvrez la **console** du navigateur (F12)
3. Tapez: `window.umami`
4. Si vous voyez un objet → ✅ Umami fonctionne!

OU

1. Allez sur votre **dashboard Umami**: https://cloud.umami.is
2. Cliquez sur **"Felora Production"**
3. Visitez votre site felora.ch
4. Vous devriez voir les stats en temps réel apparaître

---

## 📊 ACCÉDER AUX STATS

**Dashboard Umami:** https://cloud.umami.is

Vous verrez:
- Visiteurs en temps réel
- Pages vues
- Pays/villes
- Devices (mobile/desktop)
- Sources de trafic (Google, Instagram, etc.)

---

## 🍪 BANNIÈRE COOKIES - OPTIONNEL

Avec Umami, vous n'êtes **PAS obligé** d'avoir une bannière cookies.

**Option A:** Garder la bannière actuelle (plus prudent)
**Option B:** Supprimer la bannière (meilleure UX)

Si vous voulez supprimer la bannière plus tard, dites-le moi!

---

## 🎯 PROCHAINES ÉTAPES

Une fois les variables ajoutées sur Vercel et redéployé:
1. Tester que Umami fonctionne
2. Vérifier les premières stats
3. (Optionnel) Supprimer la bannière cookies

---

*Configuration créée le 28 Novembre 2025*
