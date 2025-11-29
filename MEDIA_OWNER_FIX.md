# Fix: Affichage des propriétaires dans /admin/media

## 🔍 Problème identifié

Les noms des propriétaires affichaient "Unknown" dans la page `/admin/media` en local.

### Cause racine

Après investigation avec l'endpoint de debug `/api/admin/debug-db`, voici ce qui a été découvert :

**État de la base de données :**
- **1 seul club** existe dans la table `ClubProfile`
- **38 médias** avec `ownerType: 'CLUB'`
- **8 club IDs différents** référencés dans les médias
- **0 clubs trouvés** quand on cherche ces 8 IDs dans `ClubProfile`
- **88 médias** avec `ownerId: "unknown"` (littéral)

**Clubs orphelins détectés :**
```
cmhnovpwt0003k304gaiqpkrz
cmhaljhsw00028oyotyq1vrw1
cmht11jos0002l504bp0cair3
cmhuksz9e0002jp04udoy1lpv
cmhjdmvdc0002ih04a1tlsn7i
cmgdusqb600021xm4kawsuivy
cmg4ww1aa00051xfgo7ilxnod
cmiftrpsz0002ih046ylu3pgq
```

**Conclusion :** Les médias référencent des clubs qui ont été supprimés ou qui n'ont jamais été créés correctement dans la table `ClubProfile`.

---

## ✅ Solution implémentée

### 1. API `/api/admin/media/route.ts`

Ajout d'une meilleure gestion des propriétaires manquants :

```typescript
// Default to better fallback if no owner found
if (!owner) {
  if (m.ownerId === 'unknown') {
    owner = { name: 'Propriétaire non défini', stageName: 'Non défini' }
  } else {
    // Orphaned record - club/escort was deleted
    owner = {
      name: `${m.ownerType === 'CLUB' ? 'Club' : 'Escort'} supprimé`,
      stageName: 'Compte supprimé',
      deleted: true
    }
  }
}
```

**Résultat :**
- `ownerId: "unknown"` → affiche "Propriétaire non défini"
- Club/Escort supprimé → affiche "Club supprimé" ou "Escort supprimé" avec flag `deleted: true`

### 2. Frontend `/app/admin/media/page.tsx`

Ajout du champ `deleted` dans l'interface TypeScript :

```typescript
interface MediaItem {
  // ...
  owner?: {
    name: string
    stageName?: string
    slug?: string
    userId?: string
    deleted?: boolean  // ✅ Nouveau champ
  }
  // ...
}
```

Ajout d'un affichage différencié pour les comptes supprimés :

```tsx
{item.owner?.deleted ? (
  // Compte supprimé - pas cliquable
  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
    <span className="italic opacity-75">
      {item.owner?.stageName || item.owner?.name || 'Compte supprimé'}
    </span>
    <Trash2 size={14} className="opacity-40" />
  </div>
) : (
  // Compte actif - cliquable
  <button onClick={() => { /* ouvrir profil */ }}>
    {/* ... */}
  </button>
)}

{/* Badge "Supprimé" */}
{item.owner?.deleted && (
  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
    ⚠️ Supprimé
  </span>
)}
```

---

## 🎨 Résultat visuel

**Avant :**
- Tous les propriétaires affichaient "Unknown"
- Lien cliquable vers `/profile/unknown` (404)

**Après :**
- **Clubs/Escorts supprimés :**
  - Texte grisé en italique : "Club supprimé" ou "Escort supprimé"
  - Icône poubelle grise
  - Badge rouge "⚠️ Supprimé"
  - **Non cliquable** (pas de lien)

- **Propriétaire "unknown" :**
  - Texte : "Propriétaire non défini"
  - Pas de badge "Supprimé"
  - Non cliquable

- **Comptes actifs (normaux) :**
  - Texte violet souligné avec icône lien externe
  - Cliquable pour ouvrir le profil
  - Fonctionne normalement

---

## 📊 Test de l'API

```bash
curl -s 'http://localhost:3000/api/admin/media?ownerType=ALL' | jq '.media[0:3]'
```

**Résultat :**
```json
[
  {
    "id": "cmht59a1...",
    "ownerType": "CLUB",
    "ownerId": "cmht11jo...",
    "owner": {
      "name": "Club supprimé",
      "stageName": "Compte supprimé",
      "deleted": true
    }
  },
  {
    "id": "a407595b...",
    "ownerType": "ESCORT",
    "ownerId": "unknown",
    "owner": {
      "name": "Propriétaire non défini",
      "stageName": "Non défini"
    }
  }
]
```

---

## 🚀 Fichiers modifiés

1. **`/src/app/api/admin/media/route.ts`** (ligne 188-200)
   - Meilleure gestion des propriétaires manquants
   - Ajout du flag `deleted: true`

2. **`/src/app/admin/media/page.tsx`** (lignes 9-27, 618-671)
   - Ajout du champ `deleted` dans l'interface
   - Affichage conditionnel pour les comptes supprimés
   - Badge rouge pour les comptes supprimés

3. **`/src/app/api/admin/debug-db/route.ts`** (nouveau)
   - Endpoint de debug pour analyser l'état de la base de données
   - Utilisé pour identifier le problème

---

## 💡 Recommandations

### Option A : Nettoyage de la base (recommandé)
```sql
-- Supprimer les médias orphelins (clubs supprimés)
DELETE FROM "Media"
WHERE "ownerType" = 'CLUB'
AND "ownerId" NOT IN (SELECT id FROM "ClubProfile");

-- Ou mettre à jour avec ownerId "unknown"
UPDATE "Media"
SET "ownerId" = 'unknown'
WHERE "ownerType" = 'CLUB'
AND "ownerId" NOT IN (SELECT id FROM "ClubProfile");
```

### Option B : Garder tel quel
- L'affichage actuel est fonctionnel et informatif
- Les utilisateurs voient clairement que le compte est supprimé
- Pas de liens cassés ou d'erreurs 404

### Option C : Créer des profils placeholder
```sql
-- Créer des clubs "supprimés" pour maintenir l'intégrité
INSERT INTO "ClubProfile" (id, name, handle, userId, ...)
VALUES (
  'cmht11jos0002l504bp0cair3',
  '[Supprimé]',
  'deleted-club-1',
  'system',
  ...
);
```

---

## ✅ Statut

**Problème résolu !**

Les noms s'affichent maintenant correctement :
- ✅ "Club supprimé" pour les clubs orphelins
- ✅ "Propriétaire non défini" pour `ownerId: "unknown"`
- ✅ Noms réels pour les comptes actifs
- ✅ Pas de liens cassés (comptes supprimés non cliquables)
- ✅ Interface claire avec badges visuels

**Aucune modification de la base de données n'est requise** pour que l'affichage fonctionne. Le nettoyage de la DB est optionnel pour optimiser les performances.
