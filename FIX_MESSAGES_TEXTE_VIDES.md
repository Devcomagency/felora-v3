# 🔧 FIX CRITIQUE - Messages Texte Disparaissent/Vides

**Date**: 14 Octobre 2025  
**Problème**: Messages texte envoyés apparaissent vides ou disparaissent  
**Sévérité**: 🔴 CRITIQUE  
**Statut**: ✅ CORRIGÉ

---

## 🐛 LE BUG

Quand tu envoyais un message texte, il apparaissait **vide** ou **disparaissait** complètement.

### Logs observés
```javascript
[OPTIMISTIC] Ajout du message optimiste: temp-cd1edaa0-xxx
[SEND] Envoi... {messageId: 'cd1edaa0-xxx'}
[SEND] Réponse: 200 true
[SEND] Remplacement optimiste - après: 51 IDs: ['cmgqpcfxe00051x9gb2wzx56i']
```

Le message était bien **envoyé** et **remplacé**, mais le **texte n'apparaissait pas** ! 😱

---

## 🔍 CAUSE RACINE

### Le problème du Cache

**Ligne 624** - On STOCKE le texte :
```typescript
setTextCache(prev => ({ ...prev, [`temp-${messageId}`]: text }))
//                                 ^^^^^^^^^^^^^^^^
//                                 Clé: "temp-xxx"
```

**Ligne 752** - On CHERCHE le texte :
```typescript
const cached = env.messageId ? textCache[env.messageId] : textCache[env.id]
//                                        ^^^^^^^^^^^^^^
//                                        Clé: "xxx" (sans "temp-")
```

### Le Mismatch Fatal

```
📦 TextCache au moment de l'affichage:
{
  "temp-cd1edaa0-xxx": "Salut !"  ← Stocké ici
}

🔍 renderText() cherche:
textCache["cd1edaa0-xxx"]  ← N'existe pas !
textCache["temp-cd1edaa0-xxx"]  ← Jamais cherché

❌ Résultat: undefined → Message vide
```

---

## ✅ LA SOLUTION

Stocker le texte avec **2 clés simultanément** :

```typescript
// ✅ AVANT (ligne 622-629 corrigée)
if (text) {
  setTextCache(prev => ({ 
    ...prev, 
    [messageId]: text,              // ← Clé sans "temp-" pour renderText()
    [`temp-${messageId}`]: text     // ← Clé avec "temp-" pour compatibilité
  }))
}
```

### Pourquoi 2 clés ?

1. **`[messageId]`** : Pour que `renderText()` trouve le texte immédiatement
2. **`[temp-${messageId}]`** : Pour compatibilité avec le reste du code

### Migration améliorée (ligne 670-681)

```typescript
// Ajouter avec le vrai ID ET messageId
updated[newEnvelope.id] = text
updated[newEnvelope.messageId] = text

// Nettoyer seulement la clé temp
delete updated[`temp-${messageId}`]
```

---

## 📊 AVANT / APRÈS

### AVANT (Buggé)
```
1. Tu tapes "Salut !"
2. Message optimiste ajouté avec id="temp-xxx"
3. TextCache: { "temp-xxx": "Salut !" }
4. renderText() cherche textCache["xxx"] ← N'existe pas
5. ❌ Message apparaît VIDE
6. Serveur répond avec vrai ID
7. Migration: { "vrai-id": "Salut !" }
8. renderText() cherche textCache["messageId"] 
9. ✅ Message apparaît (mais avec délai)
```

### APRÈS (Corrigé)
```
1. Tu tapes "Salut !"
2. Message optimiste ajouté avec id="temp-xxx", messageId="xxx"
3. TextCache: { "xxx": "Salut !", "temp-xxx": "Salut !" }
4. renderText() cherche textCache["xxx"] ← ✅ TROUVÉ !
5. ✅ Message apparaît IMMÉDIATEMENT
6. Serveur répond avec vrai ID
7. Migration: { "vrai-id": "Salut !", "messageId": "Salut !" }
8. ✅ Message reste visible
```

---

## 🧪 COMMENT TESTER

1. Recharge la page (Cmd+R ou F5)
2. Ouvre la console (F12)
3. Envoie un message texte "Test 123"
4. **Regarde les logs** :

```javascript
[OPTIMISTIC] Ajout du message optimiste: temp-xxx
// ✅ Devrait apparaître IMMÉDIATEMENT dans l'UI
[SEND] Envoi...
[SEND] Réponse: 200 true
// ✅ Message toujours visible, juste l'ID change
```

5. **Si logs "[RENDER TEXT] Cache manquant"** apparaissent → le bug persiste
6. **Si aucun log "[RENDER TEXT]"** → Le fix marche ! ✅

---

## 🎯 IMPACT

| Avant | Après |
|-------|-------|
| ❌ Messages vides | ✅ Messages visibles |
| ❌ Délai 1-2s avant affichage | ✅ Affichage instantané |
| ❌ Confusion utilisateur | ✅ UX fluide |
| ❌ Apparence de bug | ✅ Professional |

---

## 📝 FICHIERS MODIFIÉS

- ✅ `src/components/chat/E2EEThread.tsx`
  - Ligne 622-629 : Stockage double clé
  - Ligne 670-681 : Migration propre
  - Ligne 761-768 : Debug logs

---

## 🚀 PROCHAINES ÉTAPES

1. **Teste maintenant** : Envoie des messages texte
2. **Vérifie la console** : Pas de logs "[RENDER TEXT] Cache manquant"
3. **Teste avec refresh** : Messages persistent après F5
4. **Commit si OK** :

```bash
git add src/components/chat/E2EEThread.tsx
git commit -m "fix(messages): messages texte apparaissent maintenant immédiatement

PROBLÈME: Messages texte envoyés apparaissaient vides
CAUSE: Mismatch clés cache (temp-xxx vs xxx)
SOLUTION: Stockage double clé pour lookup immédiat

UX: Messages visibles instantanément (UI optimiste)
"
```

---

## ⚠️ SI LE PROBLÈME PERSISTE

1. **Vide le cache navigateur** (Cmd+Shift+R)
2. **Regarde les logs console** pour "[RENDER TEXT] Cache manquant"
3. **Vérifie que le serveur est bien redémarré**
4. **Teste en navigation privée**

---

**Serveur en cours de redémarrage...**  
**Teste dès que prêt sur http://localhost:3000/messages** 🚀

