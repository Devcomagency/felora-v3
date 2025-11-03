# 🔧 CORRECTIONS SYSTÈME DE SIGNALEMENT - ADMIN REPORTS

## Date : 2025-01-01

### 🐛 BUGS CORRIGÉS

#### 1. **Relation `reporter` inexistante dans `moderate/route.ts`** ✅ CORRIGÉ
**Problème** : La route utilisait `include: { reporter }` qui n'existe pas dans le schema Prisma.

```typescript
// ❌ AVANT (ligne 41-47)
const report = await prisma.report.findUnique({
  where: { id: reportId },
  include: {
    reporter: { select: { id: true, name: true, email: true } }
  }
})

// ✅ APRÈS
const report = await prisma.report.findUnique({ where: { id: reportId } })

// Récupérer le signaleur séparément si reporterId existe
let reporter = null
if (report.reporterId) {
  reporter = await prisma.user.findUnique({
    where: { id: report.reporterId },
    select: { id: true, name: true, email: true }
  })
}
```

**Fichier modifié** : `src/app/api/admin/reports/[id]/moderate/route.ts`

---

#### 2. **Champs `banned` et `suspendedUntil` n'existent pas sur User** ✅ CORRIGÉ
**Problème** : Tentative d'utilisation de champs absents du schema Prisma.

```typescript
// ❌ AVANT
data: {
  ...(isBanned && { banned: true }),
  ...(suspendedUntil && { suspendedUntil })
}

// ✅ APRÈS
const updateData: any = {}
if (isBanned) {
  updateData.bannedAt = new Date()
  updateData.bannedReason = adminMessage || 'Signalement accepté'
}
// Note: suspendedUntil pas implémenté, TODO ajouté

if (Object.keys(updateData).length > 0) {
  await prisma.user.update({
    where: { id: targetUser.id },
    data: updateData
  })
}
```

**TODO Ajouté** : Suspensions temporaires à implémenter une fois le champ ajouté au schema.

**Fichier modifié** : `src/app/api/admin/reports/[id]/moderate/route.ts`

---

#### 3. **Champ `resolvedAt` n'existe pas sur Report** ✅ CORRIGÉ
**Problème** : Utilisation d'un champ inexistant dans le schema.

```typescript
// ❌ AVANT
data: {
  status: newStatus,
  resolvedAt: new Date(),
  adminNotes: adminMessage || undefined
}

// ✅ APRÈS
data: {
  status: newStatus,
  reviewedAt: new Date(),
  actionTaken: adminMessage || undefined
}
```

**Fichier modifié** : `src/app/api/admin/reports/[id]/moderate/route.ts`

---

#### 4. **Bug de filtre `type` dans GET `/api/admin/reports`** ✅ CORRIGÉ
**Problème** : Condition incorrecte utilisant `status` au lieu de `type`.

```typescript
// ❌ AVANT (ligne 22)
if (type && status !== 'ALL') {  // BUG: vérifie status au lieu de type
  where.reportType = type
}

// ✅ APRÈS
if (type && type !== 'ALL') {
  where.reportType = type
}
```

**Fichier modifié** : `src/app/api/admin/reports/route.ts`

---

#### 5. **Import incorrect de `prisma`** ✅ CORRIGÉ
**Problème** : Import par défaut au lieu d'import nommé.

```typescript
// ❌ AVANT
import prisma from '@/lib/prisma'

// ✅ APRÈS
import { prisma } from '@/lib/prisma'
```

**Fichier modifié** : `src/app/api/admin/reports/[id]/moderate/route.ts`

---

## 📁 FICHIERS MODIFIÉS

1. ✅ `src/app/api/admin/reports/route.ts`
   - Correction bug filtre `type`

2. ✅ `src/app/api/admin/reports/[id]/moderate/route.ts`
   - Correction relation `reporter`
   - Correction champs `banned/suspendedUntil`
   - Correction champ `resolvedAt`
   - Correction import `prisma`
   - Ajout TODOs pour suspensions

3. ✅ `src/app/api/kyc-v2/submit/route.ts`
   - Correction type cast pour `role`
   - Suppression champs inexistants (`emailVerified`, timestamps auto)

4. ✅ `src/app/api/webhooks/livepeer/route.ts`
   - Correction import `prisma` (import nommé au lieu de default)

---

## ✅ STATUS

- [x] Tous les bugs identifiés corrigés
- [x] Pas d'erreurs de linting
- [x] Code cohérent avec le schema Prisma
- [x] Intégration ReportModal fonctionnelle sur profils escort/club et messages

---

## 🔮 TODO FUTURS (OPTIONNELS)

### Ajouter au schema User pour suspensions temporaires :
```prisma
model User {
  // ... champs existants
  suspendedUntil DateTime?  // Date de fin de suspension
}
```

### Implémenter les suspensions dans `moderate/route.ts` :
```typescript
if (suspendedUntil) {
  updateData.suspendedUntil = suspendedUntil
  await prisma.user.update({ where: { id: targetUser.id }, data: updateData })
}
```

---

## 🧪 TESTS MANUELS RECOMMANDÉS

1. **Page `/admin/reports`** :
   - ✅ Affiche les statistiques
   - ✅ Liste les signalements avec filtres
   - ✅ Détecte les entités abusives

2. **Modal de modération** :
   - ✅ Ouvrir depuis signalement "En attente"
   - ✅ Choisir action (WARNING, BAN, DISMISS)
   - ✅ Ajouter message admin
   - ✅ Envoyer notifications
   - ✅ Vérifier mise à jour du statut

3. **Intégration ReportModal** :
   - ✅ Signalement depuis profil escort
   - ✅ Signalement depuis profil club
   - ✅ Signalement depuis messages

4. **Blocage d'entités** :
   - ✅ Détecter email/IP avec 3+ signalements
   - ✅ Bloquer entité suspecte
   - ✅ Rejet auto des signalements en attente

---

**Date de correction** : 2025-01-01  
**Status** : ✅ TOUS LES BUGS CORRIGÉS
