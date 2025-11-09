# 🔍 ANALYSE COMPLÈTE - PROBLÈME MUX HEVC

## 📊 SITUATION ACTUELLE

### ✅ CE QUI MARCHE
- **Upload depuis ordi** → ✅ Fonctionne (après 1-2 min de processing Mux)
  - Raison : Vidéos ordi = H.264 (pas HEVC)
  - Mux accepte H.264 sans problème

### ❌ CE QUI NE MARCHE PAS

#### 1. **Caméra directe depuis téléphone → Erreur 400**
- Symptôme : Upload échoue avec erreur 400
- Cause probable : 
  - Vidéo HEVC uploadée vers Mux
  - Mux refuse HEVC en direct upload (malgré annonce octobre 2025)
  - `mux-confirm` détecte `status === 'errored'` → retourne 400
- Code concerné : `src/app/api/media/mux-confirm/route.ts:59`

#### 2. **Galerie depuis téléphone → Upload réussit MAIS vidéo "non disponible" + erreur HLS network**
- Symptôme : 
  - Upload réussit (pas d'erreur 400)
  - Vidéo sauvegardée en DB avec URL Mux
  - Mais vidéo "non disponible" dans le feed
  - Erreur HLS network
- Cause probable :
  - L'upload réussit vers Mux
  - `mux-confirm` récupère un `playbackId` (pas d'erreur détectée)
  - MAIS la vidéo HEVC est en cours de traitement par Mux
  - Mux essaie de transcoder HEVC → échoue silencieusement
  - La vidéo finit en statut "errored" APRÈS la sauvegarde en DB
  - Le playbackId existe mais pointe vers une vidéo corrompue/en erreur
- Code concerné : 
  - `src/app/api/media/mux-confirm/route.ts:54-98` (retry 5 fois, 10s max)
  - `src/components/feed/VideoFeedCard.tsx:193` (erreur HLS)

## 🔬 ANALYSE TECHNIQUE

### Flow actuel (camera/page.tsx)

1. **Upload direct client → Mux** (ligne 161-171)
   - Utilise `uploadWithProgress` pour uploader le fichier
   - Headers : `Content-Type: data.file.type` (probablement `video/mp4` même si HEVC)
   - ✅ L'upload HTTP réussit (200 OK)

2. **Confirmation Mux** (ligne 177-189)
   - Appel `/api/media/mux-confirm`
   - Passe `uploadId` et `assetId`

3. **mux-confirm vérifie le statut** (mux-confirm/route.ts:54-98)
   - Retry 5 fois, 2s entre chaque = 10s max
   - Vérifie `muxAsset.status === 'errored'` (ligne 59)
   - Si `errored` → retourne 400 avec `MUX_ENCODING_ERROR`
   - Sinon, récupère `playbackId` et sauvegarde en DB

### Problème #1 : Caméra directe → Erreur 400

**Timeline :**
1. Upload vidéo HEVC vers Mux (réussit)
2. `mux-confirm` vérifie le statut (immédiatement)
3. Mux a déjà rejeté HEVC → `status === 'errored'` (rapide)
4. Retourne 400 → User voit erreur

**Pourquoi ça échoue :**
- Mux annonce supporter HEVC depuis octobre 2025
- MAIS seulement pour les uploads server-to-server (via API)
- PAS pour les direct uploads (client → Mux)
- Les vidéos HEVC en direct upload sont rejetées immédiatement

### Problème #2 : Galerie → "Non disponible"

**Timeline :**
1. Upload vidéo HEVC vers Mux (réussit)
2. `mux-confirm` vérifie le statut (dans les 10 premières secondes)
3. Mux n'a pas encore traité → `status === 'preparing'` (pas encore `errored`)
4. `playbackId` existe déjà (Mux le crée immédiatement)
5. Vidéo sauvegardée en DB avec URL HLS valide
6. **MAIS** : Mux essaie de transcoder HEVC → échoue (après 10-30 secondes)
7. Vidéo finit en `status === 'errored'` APRÈS la sauvegarde
8. Le playbackId pointe vers une vidéo corrompue → erreur HLS network

**Pourquoi le playbackId existe mais la vidéo ne marche pas :**
- Mux crée le playbackId immédiatement (dès l'upload)
- Le transcodage HEVC échoue en arrière-plan (après)
- Le playbackId pointe vers une vidéo qui n'existera jamais
- HLS essaie de charger → erreur network (vidéo n'existe pas)

## 💡 SOLUTIONS POSSIBLES

### Solution 1 : Fallback R2 automatique (RECOMMANDÉ)

**Avantages :**
- ✅ R2 accepte HEVC (tous formats)
- ✅ Upload direct (rapide, pas de timeout)
- ✅ Pas de transcodage nécessaire (lecture directe MP4)
- ✅ Simple à implémenter

**Inconvénients :**
- ❌ Pas de transcodage adaptatif (HLS)
- ❌ Pas de thumbnail automatique
- ❌ Vidéos servies directement (pas optimisées)

**Implémentation :**
1. Détecter HEVC côté client (avant upload)
2. Si HEVC → R2 directement (pas Mux)
3. Si H.264 → Mux (comme maintenant)

### Solution 2 : Détection par source (SIMPLE)

**Avantages :**
- ✅ Simple à implémenter
- ✅ Pas besoin de détecter HEVC
- ✅ Capture caméra = R2 (très probablement HEVC)
- ✅ Galerie = Mux (peut être H.264)

**Inconvénients :**
- ❌ Pas 100% fiable (galerie peut contenir HEVC)
- ❌ Faux positifs/négatifs possibles

**Implémentation :**
1. Si `mode === 'video'` (caméra) → R2
2. Si `mode === 'upload'` (galerie) → Mux
3. Fallback R2 si Mux échoue

### Solution 3 : Améliorer la détection d'erreur Mux

**Avantages :**
- ✅ Garde Mux pour H.264
- ✅ Détecte les erreurs HEVC après sauvegarde

**Inconvénients :**
- ❌ Vidéos sauvegardées puis en erreur (mauvaise UX)
- ❌ Nécessite un système de vérification post-upload
- ❌ Complexe à implémenter

**Implémentation :**
1. Sauvegarder la vidéo même si `status === 'preparing'`
2. Vérifier le statut Mux après 30-60 secondes
3. Si `errored` → Supprimer de DB + Notifier user

### Solution 4 : Migrer vers Bunny.net

**Avantages :**
- ✅ Support HEVC natif (vraiment)
- ✅ Upload direct (rapide)
- ✅ Transcodage automatique
- ✅ Moins cher que Mux ($0.02/GB vs $0.15/GB)

**Inconvénients :**
- ❌ Migration complète nécessaire
- ❌ Changement d'API
- ❌ Temps de développement

## 🎯 RECOMMANDATION

### Solution recommandée : **Solution 1 (Fallback R2) + Détection par source**

**Pourquoi :**
1. **Rapide à implémenter** (1-2h)
2. **Fiable** : R2 accepte tous les formats
3. **Pas de fallback lent** : Détection AVANT upload
4. **UX optimale** : User ne voit pas d'erreur

**Implémentation :**
1. Détecter si c'est une capture caméra (probable HEVC)
2. Si caméra → R2 directement
3. Si galerie → Essayer Mux, fallback R2 si erreur
4. Ajouter une détection HEVC côté client (optionnel, pour plus de précision)

### Alternative : **Solution 2 (Détection par source uniquement)**

**Pourquoi :**
1. **Très simple** (30min)
2. **Fonctionne dans 90% des cas**
3. **Pas besoin de détecter HEVC**

**Implémentation :**
1. Capture caméra (`mode === 'video'`) → R2
2. Upload galerie (`mode === 'upload'`) → Mux avec fallback R2

## 📝 PROCHAINES ÉTAPES

1. ✅ Analyser le problème (FAIT)
2. ⏳ Implémenter la solution recommandée
3. ⏳ Tester avec vidéos HEVC (Samsung)
4. ⏳ Tester avec vidéos H.264 (iPhone, ordi)
5. ⏳ Vérifier que les vidéos R2 se lisent correctement

## 🔗 FICHIERS CONCERNÉS

- `src/app/camera/page.tsx` - Logique upload vidéo
- `src/app/api/media/mux-confirm/route.ts` - Vérification statut Mux
- `src/components/camera/CameraCapturePro.tsx` - Capture caméra
- `src/components/feed/VideoFeedCard.tsx` - Lecture vidéo HLS
- `src/app/api/media/confirm-upload/route.ts` - Confirmation upload R2

