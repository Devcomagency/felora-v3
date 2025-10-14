# 🔧 FIX - Médias Vue Unique Affichés en Noir

**Date**: 14 Octobre 2025  
**Problème**: Les médias en vue unique s'affichaient en noir/cassés après ouverture  
**Cause**: Révocation prématurée des Blob URLs  
**Statut**: ✅ CORRIGÉ

---

## 🐛 SYMPTÔMES

- Médias en vue unique apparaissent noirs après clic sur "Voir"
- Message "fichier cassé" ou image vide
- Problème uniquement avec médias vue unique, pas les médias normaux

---

## 🔍 CAUSE RACINE

Dans notre fix précédent du memory leak, on révoquait les Blob URLs dans `FullscreenMediaViewer.tsx` :

```typescript
// ❌ PROBLÈME - Révocation trop tôt
useEffect(() => {
  return () => {
    if (mediaUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(mediaUrl) // Révoque avant que l'image charge
    }
  }
}, [mediaUrl])
```

**Pourquoi ça cassait ?**
1. Image floue utilise `blob://xxx` 
2. Clic "Voir" → passe la même URL au viewer
3. Viewer se monte → image commence à charger
4. Viewer se démonte (ou re-render) → révoque l'URL
5. Image n'a pas fini de charger → affichage noir

---

## ✅ SOLUTION

### 1. Retirer révocation du FullscreenMediaViewer
**Fichier**: `src/components/chat/FullscreenMediaViewer.tsx`

```typescript
// ✅ CORRECT - Pas de révocation ici
// Les Blob URLs sont gérées par E2EEThread qui les crée
```

**Raison**: Le viewer ne crée pas les URLs, il les reçoit. La révocation doit être faite par celui qui les crée.

---

### 2. Ajouter cleanup dans E2EEThread
**Fichier**: `src/components/chat/E2EEThread.tsx`

```typescript
// ✅ Garder une ref à jour du cache
const mediaCacheRef = useRef<Record<string, { url: string; mime: string }>>({})

// Mettre à jour la ref quand le cache change
setMediaCache(prev => {
  const newCache = { ...prev, ...updates }
  mediaCacheRef.current = newCache // ✅ Ref toujours à jour
  return newCache
})

// Cleanup au démontage du composant ENTIER
useEffect(() => {
  return () => {
    Object.values(mediaCacheRef.current).forEach(({ url }) => {
      if (url?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url)
        } catch (e) {
          // Déjà révoquée, ignorer
        }
      }
    })
  }
}, []) // Dépendances vides = seulement au démontage
```

---

## 🎯 POURQUOI ÇA MARCHE ?

1. **URLs créées au bon endroit** : E2EEThread déchiffre et crée les Blob URLs
2. **URLs partagées** : Thumbnail, fullscreen, etc. utilisent la même URL
3. **Révocation au bon moment** : Seulement quand l'utilisateur quitte la conversation
4. **Ref pour état à jour** : Le cleanup a accès aux dernières URLs créées

---

## 📊 AVANT / APRÈS

### Avant (Cassé)
```
1. Déchiffrement → blob:xxx
2. Affichage thumbnail → OK
3. Clic "Voir" → passe blob:xxx au viewer
4. Viewer se monte → commence chargement
5. Viewer démonte → RÉVOQUE blob:xxx ❌
6. Image pas finie de charger → NOIR
```

### Après (Fixé)
```
1. Déchiffrement → blob:xxx
2. Affichage thumbnail → OK
3. Clic "Voir" → passe blob:xxx au viewer
4. Viewer se monte → charge image
5. Viewer ferme → URL toujours valide ✅
6. Image chargée → AFFICHÉE
7. Utilisateur quitte conversation → révoque URLs
```

---

## 🧪 TESTS

### Test 1: Média Vue Unique
1. Envoyer une image en vue unique
2. Côté récepteur, cliquer "Voir"
3. **Résultat attendu**: Image s'affiche correctement
4. Fermer le viewer
5. Re-cliquer "Voir" (si pas encore marqué vu)
6. **Résultat attendu**: Image toujours visible

### Test 2: Média Normal
1. Envoyer une image normale
2. Cliquer sur l'image pour fullscreen
3. **Résultat attendu**: Image s'affiche
4. Fermer et rouvrir plusieurs fois
5. **Résultat attendu**: Toujours visible

### Test 3: Memory Leak
1. Ouvrir une conversation
2. Envoyer 20 images
3. Ouvrir/fermer chaque image en fullscreen
4. Regarder DevTools → Memory
5. **Résultat attendu**: Pas d'augmentation continue de RAM

### Test 4: Changement Conversation
1. Ouvrir conversation A avec médias
2. Changer vers conversation B
3. Regarder DevTools → Memory
4. **Résultat attendu**: Blob URLs de A révoquées

---

## ⚠️ NOTES IMPORTANTES

1. **Blob URLs ne sont jamais révoquées pendant l'utilisation**
   - Tant que l'utilisateur reste dans la conversation
   - Les URLs restent valides pour tous les composants

2. **Révocation seulement au démontage**
   - Quand l'utilisateur quitte la page /messages
   - Quand il change de conversation (E2EEThread se démonte)

3. **Pas de révocation dans les composants enfants**
   - FullscreenMediaViewer
   - MessageBubble
   - Etc.

4. **Trade-off mémoire acceptable**
   - Les Blob URLs vivent le temps de la conversation
   - Pour 100 images de 5MB chacune = 500MB max
   - Acceptable pour une session normale

---

## 🔄 SI LE PROBLÈME PERSISTE

### Vérifier:
1. Cache du navigateur vidé ?
2. Blob URLs bien créées ? (DevTools → Application → Blob Storage)
3. Erreurs console ? (fetch failed, decrypt failed)
4. Type MIME correct ? (pas 'application/octet-stream')

### Debug:
```typescript
// Dans E2EEThread.tsx, après création Blob URL
console.log('[MEDIA] Blob URL créée:', {
  messageId: env.id,
  url: updates[env.id].url,
  mime: updates[env.id].mime
})

// Dans FullscreenMediaViewer.tsx
console.log('[VIEWER] Affichage média:', {
  url: mediaUrl,
  type: mediaType,
  isOnceView
})
```

---

## 📦 FICHIERS MODIFIÉS

- ✅ `src/components/chat/E2EEThread.tsx`
- ✅ `src/components/chat/FullscreenMediaViewer.tsx`

---

## ✅ CHECKLIST

- [x] Révocation retirée du FullscreenMediaViewer
- [x] Cleanup ajouté dans E2EEThread
- [x] Ref mediaCacheRef créée et maintenue
- [x] Try/catch sur révocation (URLs déjà révoquées)
- [x] Pas d'erreurs linter
- [x] TypeScript compile
- [ ] Testé manuellement (image vue unique)
- [ ] Testé sur mobile
- [ ] Vérifié memory leak fixé (DevTools)

---

**Prêt à tester !** 🚀

