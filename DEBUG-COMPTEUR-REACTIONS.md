# 🐛 Debug : Compteur de réactions toujours à 0

## 🔍 Diagnostic

Le compteur reste à 0 généralement pour l'une de ces raisons :

### 1. Script SQL de synchronisation pas exécuté

**Symptôme** : Les compteurs `totalLikes` et `totalReacts` dans la table `escort_profiles` sont à 0.

**Solution** :
```bash
psql $DATABASE_URL -f prisma/migrations-manual/sync-profile-counters.sql
```

### 2. Réactions avec des mediaId hashés

**Symptôme** : Les réactions existent dans la table `reactions` mais ne sont pas comptées.

**Cause** : Certaines réactions utilisent des `mediaId` générés par `stableMediaId()` (hash) qui ne correspondent pas à un vrai ID dans la table `media`.

**Solution** : ✅ Déjà corrigé dans le code (utilise INNER JOIN pour ne compter que les réactions valides).

### 3. Médias sans relation dans la table media

**Symptôme** : Les médias sont affichés mais n'existent pas dans la table `media`.

**Cause** : Les médias viennent de `galleryPhotos` (ancien système) et ne sont pas dans la table `media`.

**Solution** : Les réactions sur ces médias créent automatiquement une entrée dans `media` (voir ligne 82-94 de `/api/reactions/route.ts`).

---

## 🧪 Script de diagnostic

Utilisez le script pour vérifier un profil spécifique :

```bash
node scripts/debug-reactions.js {profileId}
```

**Exemple** :
```bash
node scripts/debug-reactions.js clr7w8x9z000008l6h5k3b2c1
```

**Ce script affiche** :
- ✅ Les compteurs actuels du profil (totalLikes, totalReacts)
- 📸 Tous les médias du profil avec leurs compteurs individuels
- 💯 Les réactions réelles dans la base de données
- 🎯 Le détail de chaque réaction par média
- 📊 Une comparaison entre les compteurs du profil et les réactions réelles
- 🔧 La commande SQL pour corriger si désynchronisé

---

## 🧪 Test manuel

### Étape 1 : Vérifier que les réactions fonctionnent

1. **Aller sur un profil escort** (ex: `/profile/{id}`)
2. **Ouvrir un média** dans le feed
3. **Liker le média** (❤️)
4. **Vérifier dans les logs** :
   ```
   [REACTIONS] Create LIKE by user {...} on media {...}
   [REACTIONS SYNC] Updating global counters for escort profile: {...}
   [REACTIONS SYNC] Global counters for {...}: X likes, Y reactions
   [REACTIONS SYNC] ✅ Escort profile global counters updated
   ```

5. **Rafraîchir la page** → Le compteur en haut devrait afficher 1

### Étape 2 : Vérifier la base de données

```sql
-- Vérifier les compteurs du profil
SELECT id, "stageName", "totalLikes", "totalReacts"
FROM escort_profiles
WHERE id = '{profileId}';

-- Vérifier les médias
SELECT id, "ownerId", "likeCount", "reactCount"
FROM media
WHERE "ownerType" = 'ESCORT' AND "ownerId" = '{profileId}' AND "deletedAt" IS NULL;

-- Vérifier les réactions
SELECT r.*, m."ownerId"
FROM reactions r
LEFT JOIN media m ON m.id = r."mediaId"
WHERE m."ownerId" = '{profileId}';
```

### Étape 3 : Si le compteur est toujours à 0

1. **Exécuter le script de diagnostic** :
   ```bash
   node scripts/debug-reactions.js {profileId}
   ```

2. **Lire les logs** pour identifier le problème

3. **Si désynchronisation détectée**, exécuter la commande SQL fournie par le script

4. **Tester une nouvelle réaction** pour vérifier que la synchronisation automatique fonctionne

---

## 🔧 Corrections appliquées

### Correction #1 : Gestion des mediaId hashés

**Fichier** : `src/app/api/reactions/route.ts` (lignes 145-213)

**Avant** :
```typescript
const media = await prisma.media.findUnique({ where: { id: mediaId } })
// ❌ Échoue si mediaId est un hash
```

**Après** :
```typescript
let media = await prisma.media.findUnique({ where: { id: mediaId } })
if (!media) {
  // Fallback : chercher via la réaction
  const reactionWithMedia = await prisma.reaction.findFirst({
    where: { mediaId },
    select: { media: { select: { ownerId: true, ownerType: true } } }
  })
  media = reactionWithMedia?.media || null
}
```

### Correction #2 : Comptage via JOIN

**Avant** :
```typescript
const escortMediaIds = await prisma.media.findMany(...)
.then(results => results.map(m => m.id))

const totalLikes = await prisma.reaction.count({
  where: { mediaId: { in: escortMediaIds }, type: 'LIKE' }
})
// ❌ Ne compte que les médias dans la table, ignore les mediaId hashés
```

**Après** :
```typescript
const totalLikes = await prisma.reaction.count({
  where: {
    media: {
      ownerId: media.ownerId,
      ownerType: 'ESCORT',
      deletedAt: null
    },
    type: 'LIKE'
  }
})
// ✅ Compte via JOIN, fonctionne même avec des mediaId hashés SI le média existe
```

---

## ✅ Checklist de résolution

- [ ] Script SQL de synchronisation exécuté
- [ ] Code déployé avec les corrections
- [ ] Test : liker un média → compteur augmente
- [ ] Test : rafraîchir la page → compteur affiché correctement
- [ ] Vérifier les logs console pour détecter les erreurs
- [ ] Utiliser le script de diagnostic si problème persiste

---

## 📞 Support

Si le problème persiste après avoir suivi toutes les étapes :

1. **Exécuter le script de diagnostic** et copier la sortie complète
2. **Vérifier les logs** de l'API lors d'une réaction
3. **Vérifier la console du navigateur** pour les erreurs
4. **Partager ces informations** pour investigation approfondie
