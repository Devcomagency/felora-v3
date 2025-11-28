# 🚀 GUIDE DE DÉPLOIEMENT VERCEL - FELORA V3

**Date:** 28 Novembre 2025
**Status:** ✅ Code pushé - En attente de mise à jour Vercel

---

## ⚠️ IMPORTANT - LIRE AVANT DE CONTINUER

Le code a été pushé avec succès sur GitHub.
**Vercel va automatiquement redéployer**, MAIS les nouvelles variables
d'environnement doivent être ajoutées MANUELLEMENT.

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### 1️⃣ Récupérer les valeurs des secrets (MAINTENANT)

Les secrets sont dans votre fichier `.env.local` local.
Vous aurez besoin de ces 4 nouvelles variables :

```bash
# Sur votre machine locale, afficher les valeurs:
grep "NEXTAUTH_SECRET=" .env.local
grep "ADMIN_PASSWORD_HASH=" .env.local  
grep "ADMIN_JWT_SECRET=" .env.local
grep "MEDIA_SIGNATURE_SECRET=" .env.local
```

**⚠️ Copiez ces valeurs maintenant - vous en aurez besoin pour Vercel !**

---

### 2️⃣ Option A - Via Vercel Dashboard (RECOMMANDÉ)

1. Aller sur: https://vercel.com/devcomagency/felora-v3/settings/environment-variables

2. Ajouter les 4 nouvelles variables (Environment: Production):

   **NEXTAUTH_SECRET**
   - Value: [copier depuis .env.local]
   - Environment: Production ✅

   **ADMIN_PASSWORD_HASH**
   - Value: [copier depuis .env.local]
   - Environment: Production ✅

   **ADMIN_JWT_SECRET**
   - Value: [copier depuis .env.local]
   - Environment: Production ✅

   **MEDIA_SIGNATURE_SECRET**
   - Value: [copier depuis .env.local]
   - Environment: Production ✅

3. Sauvegarder chaque variable

4. Redéployer manuellement (ou attendre le déploiement automatique du push)

---

### 2️⃣ Option B - Via Vercel CLI

```bash
# Se connecter à Vercel (si pas déjà fait)
vercel login

# Se placer dans le projet
cd /Users/nordinehasnaoui/Desktop/projets/felora-v3

# Ajouter les variables (une par une)
vercel env add NEXTAUTH_SECRET production
# Coller la valeur depuis .env.local quand demandé

vercel env add ADMIN_PASSWORD_HASH production
# Coller la valeur depuis .env.local quand demandé

vercel env add ADMIN_JWT_SECRET production
# Coller la valeur depuis .env.local quand demandé

vercel env add MEDIA_SIGNATURE_SECRET production
# Coller la valeur depuis .env.local quand demandé

# Redéployer avec les nouvelles variables
vercel --prod
```

---

### 3️⃣ Vérifier le déploiement

1. Aller sur: https://vercel.com/devcomagency/felora-v3/deployments

2. Attendre que le déploiement soit terminé (icône verte ✅)

3. Cliquer sur le déploiement > "Function Logs"

4. Vérifier qu'il n'y a pas d'erreurs liées aux variables manquantes

---

### 4️⃣ Tester en production

1. Aller sur: https://felora.ch/admin (ou votre domaine de production)

2. Se connecter avec les nouveaux identifiants:
   - Email: `info@devcom.ch`
   - Mot de passe: `Felora2025!SecureAdmin#1773d599`

3. Le login devrait fonctionner ✅

4. Vérifier les logs Vercel:
   ```
   ✅ "Admin login with bcrypt hash (secure)"
   ```

---

## 📊 Checklist de validation

### Avant déploiement
- [x] Code pushé sur GitHub
- [ ] Variables copiées depuis .env.local
- [ ] Variables ajoutées sur Vercel Dashboard/CLI

### Après déploiement  
- [ ] Déploiement Vercel terminé (vert)
- [ ] Pas d'erreurs dans Function Logs
- [ ] Login admin fonctionne en production
- [ ] Upload média fonctionne
- [ ] Logs montrent "bcrypt hash (secure)"

---

## 🔄 Rollback (si problème)

Si quelque chose ne fonctionne pas:

### Option 1 - Restaurer anciennes variables

Via Vercel Dashboard:
1. Settings > Environment Variables
2. Supprimer les nouvelles variables
3. Redéployer

### Option 2 - Revert le code

```bash
git revert HEAD~2..HEAD
git push origin main
```

---

## ⚠️ Notes importantes

1. **Les variables sont sensibles à la casse** - Copiez-les exactement
2. **N'oubliez pas les guillemets** si la valeur en contient
3. **Vérifiez TOUJOURS en production** avant de révoquer les anciennes clés
4. **Gardez le backup .env.local** pendant au moins 1 semaine

---

## 📞 Problèmes courants

### "ADMIN_EMAIL not configured"
→ Vérifier que ADMIN_EMAIL existe sur Vercel (devrait déjà être là)

### "Cannot read bcrypt"
→ Redéployer - bcryptjs doit être installé automatiquement

### Login ne fonctionne plus
→ Vérifier le hash dans Vercel (copier-coller exact depuis .env.local)

### "JWT secret missing"
→ Vérifier ADMIN_JWT_SECRET sur Vercel

---

## 🎯 Prochaines étapes (après validation)

Une fois que tout fonctionne en production:

1. ✅ Tester tous les flux critiques
2. ✅ Vérifier les logs pendant 24h
3. ✅ Régénérer clés API externes (Cloudflare, Resend, etc.)
4. ✅ Révoquer anciennes clés API
5. ✅ Supprimer ADMIN_CREDENTIALS.txt
6. ✅ Mettre à jour la documentation

---

**Temps estimé:** 10-15 minutes
**Prêt à déployer !** 🚀

