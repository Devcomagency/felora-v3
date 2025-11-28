🚨 **PROBLÈME IDENTIFIÉ - VARIABLE MANQUANTE**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ❌ PROBLÈME

Le nouveau mot de passe `Felora2025!SecureAdmin#1773d599` ne fonctionne pas sur Vercel.

## 🔍 CAUSE

La variable **`ADMIN_EMAIL`** était **MANQUANTE** sur Vercel !

Sans cette variable, le code dans `src/app/api/admin/auth/login/route.ts:27-33` retourne une erreur 500:

```typescript
if (!ADMIN_EMAIL) {
  console.error('🚨 ADMIN_EMAIL not configured')
  return NextResponse.json(
    { success: false, error: 'Configuration admin incomplète' },
    { status: 500 }
  )
}
```

## ✅ SOLUTION

Vous devez ajouter **5 VARIABLES** (pas 4) sur Vercel:

### 🎯 VARIABLES À AJOUTER SUR VERCEL

```bash
NEXTAUTH_SECRET="V785dNu+AV34Tehd6qk9JWaxq8/MBVGs3+I05i7Hy9o="
ADMIN_EMAIL="info@devcom.ch"
ADMIN_PASSWORD_HASH="$2b$10$fdTCBS19bwDf9bIkPKT0i.PNwFTjeOwiUAO9cb8voIGxhou2ef3j."
ADMIN_JWT_SECRET="Dye66xnJ0dJtttZZZ2UmiC/Lm4kri2/th0sk5NL1HXc="
MEDIA_SIGNATURE_SECRET="374ef483ace3c90de5b43a5e089049893f317da3218f1934d3aaa3aafe8a633a"
```

### 📋 ÉTAPES

1. **Aller sur Vercel Dashboard**
   → https://vercel.com/[votre-projet]/settings/environment-variables

2. **Ajouter la variable manquante:**
   ```
   Name:  ADMIN_EMAIL
   Value: info@devcom.ch
   Environment: Production (✓), Preview (✓), Development (✓)
   ```

3. **Vérifier que les 4 autres variables existent déjà**
   - NEXTAUTH_SECRET
   - ADMIN_PASSWORD_HASH
   - ADMIN_JWT_SECRET
   - MEDIA_SIGNATURE_SECRET

4. **Redéployer manuellement** (forcer le redéploiement):
   - Aller dans l'onglet "Deployments"
   - Cliquer sur le dernier déploiement
   - Cliquer "Redeploy"
   - OU faire un commit vide: `git commit --allow-empty -m "fix: Force redeploy with ADMIN_EMAIL"`

5. **Tester après déploiement:**
   - Aller sur https://felora.ch/admin
   - Email: `info@devcom.ch`
   - Mot de passe: `Felora2025!SecureAdmin#1773d599`

## 🔍 VÉRIFICATION

Après le redéploiement, dans les Runtime Logs de Vercel, vous devriez voir:

✅ **Login réussi avec nouveau système:**
```
✅ Admin login with bcrypt hash (secure)
✅ Admin JWT token created (secure)
```

❌ **Si vous voyez toujours l'ancien système:**
```
⚠️  Admin login with legacy plain password - UPGRADE TO BCRYPT HASH!
```

→ Cela signifie que les variables ne sont pas encore chargées, redéployer à nouveau.

## 📊 RÉSUMÉ

| Variable               | Statut avant | Statut maintenant |
|------------------------|--------------|-------------------|
| NEXTAUTH_SECRET        | ✅ Présent    | ✅ Présent         |
| ADMIN_EMAIL            | ❌ MANQUANT   | ✅ **À AJOUTER**   |
| ADMIN_PASSWORD_HASH    | ✅ Présent    | ✅ Présent         |
| ADMIN_JWT_SECRET       | ✅ Présent    | ✅ Présent         |
| MEDIA_SIGNATURE_SECRET | ✅ Présent    | ✅ Présent         |

## ⚠️ IMPORTANT

- **NE PAS** utiliser de guillemets supplémentaires lors de l'ajout sur Vercel
- Copier-coller les valeurs **EXACTEMENT** comme ci-dessus
- Les variables doivent être dans l'environnement **Production**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
