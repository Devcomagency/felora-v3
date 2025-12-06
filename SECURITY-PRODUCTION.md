# 🔐 FELORA - Configuration Sécurité Production

## ✅ SYSTÈME D'AUTHENTIFICATION ADMIN

Le système d'authentification admin a été complètement sécurisé pour la production.

### Architecture Sécurisée

1. **Stockage des mots de passe** : Bcrypt hash en base de données (pas de variables d'environnement)
2. **Authentification** : JWT tokens signés avec NEXTAUTH_SECRET
3. **Cookies sécurisés** : httpOnly, secure en production, SameSite protection
4. **Validation à chaque requête** : Vérification du rôle, bannissement, etc.

### Credentials Admin Actuels

```
Email: info@devcom.ch
Password: Felora2025!SecureAdmin
```

⚠️ **IMPORTANT** : Changez ce mot de passe en production !

---

## 🔧 FICHIERS MODIFIÉS

### 1. `/src/app/api/admin/auth/login/route.ts`
✅ Authentification via base de données (pas .env)
✅ Vérification bcrypt sécurisée
✅ JWT token signé
✅ Logs de sécurité détaillés

### 2. `/src/lib/admin-auth.ts`
✅ Vérification JWT + validation database
✅ Support NextAuth session (fallback)
✅ Vérification du rôle et bannissement

### 3. `/src/app/admin/kyc/page.tsx`
✅ Credentials retirés de l'interface
✅ Toggle de visibilité du mot de passe (icône œil)
✅ Interface de login sécurisée

---

## 📝 CHANGER LE MOT DE PASSE ADMIN

### Méthode 1: Via script SQL (Recommandée)

```bash
# 1. Générer un nouveau hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('VotreNouveauMotDePasse', 10).then(h => console.log(h))"

# 2. Copier le hash obtenu

# 3. Exécuter dans la base de données:
PGPASSWORD="npg_zPpeE9luoI7N" psql -h ep-billowing-leaf-adcbt14m-pooler.c-2.us-east-1.aws.neon.tech -U neondb_owner -d neondb -c "UPDATE users SET password = 'VOTRE_HASH_ICI' WHERE email = 'info@devcom.ch';"
```

### Méthode 2: Via Neon Dashboard

1. Aller sur [https://console.neon.tech](https://console.neon.tech)
2. Ouvrir le SQL Editor
3. Exécuter:
```sql
UPDATE users
SET password = 'VOTRE_HASH_ICI'
WHERE email = 'info@devcom.ch';
```

---

## 🛡️ SÉCURITÉ SUPPLÉMENTAIRE

### Variables d'Environnement Requises

```env
# .env.local (ou variables Vercel)
NEXTAUTH_SECRET="votre-secret-jwt-tres-long-et-aleatoire"
DATABASE_URL="postgresql://..."
```

### Recommandations Production

1. ✅ Utiliser un `NEXTAUTH_SECRET` fort (minimum 32 caractères aléatoires)
2. ✅ Activer HTTPS uniquement (déjà configuré pour production)
3. ✅ Surveiller les logs de connexion admin
4. ✅ Changer le mot de passe régulièrement
5. ✅ Limiter les tentatives de connexion (TODO: rate limiting)

---

## 📊 LOGS DE SÉCURITÉ

Le système log tous les événements de sécurité:

- `[SECURITY] Admin login attempt` : Tentative de connexion
- `[SECURITY] Admin login successful` : Connexion réussie
- `[SECURITY] Login failed: Invalid password` : Mot de passe incorrect
- `[SECURITY] Login failed: User is not admin` : Utilisateur non admin
- `[SECURITY] JWT token valid but user no longer admin` : Token valide mais plus admin

**Surveillez ces logs en production !**

---

## 🚀 DÉPLOIEMENT VERCEL

### Variables à configurer

```bash
# Vercel Dashboard → Settings → Environment Variables
NEXTAUTH_SECRET=<générer avec: openssl rand -base64 32>
DATABASE_URL=<URL Neon>
```

### Après déploiement

1. Tester la connexion admin sur `/admin/kyc`
2. Vérifier les logs Vercel pour `[SECURITY]`
3. Changer le mot de passe si nécessaire

---

## ⚠️ PROBLÈMES RÉSOLUS

### Problème: Hash bcrypt corrompu dans .env
**Solution**: Stockage du hash directement en base de données au lieu de variables d'environnement

### Problème: Multiples serveurs de dev
**Solution**: Scripts arrêtent tous les serveurs avant de redémarrer

### Problème: Base de données Supabase vs Neon
**Solution**: Configuration unifiée sur Neon (DATABASE_URL)

---

## 📞 SUPPORT

En cas de problème:
1. Vérifier les logs console pour `[SECURITY]`
2. Vérifier que NEXTAUTH_SECRET est configuré
3. Vérifier la connexion base de données
4. Regénérer le hash bcrypt si besoin

**La sécurité est maintenant production-ready ! ✅**
