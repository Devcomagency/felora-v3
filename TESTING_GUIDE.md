# 🧪 Guide de Test - Refactorisation Notifications/Messagerie

## ✅ Tests de Non-Régression

### 1. Build & Compilation
```bash
# Vérifier que l'app compile sans erreur
npm run build
# ✅ RÉSULTAT : Build réussi (confirmé)
```

### 2. Démarrage de l'application
```bash
# Démarrer en mode dev
npm run dev

# Ouvrir http://localhost:3000
# ✅ ATTENDU : L'app démarre sans crash
```

---

## 🔐 Tests de Sécurité

### Test 1 : `/api/notifications/send` - Protection Admin

**Objectif** : Vérifier que seuls les admins peuvent envoyer des notifications

```bash
# 1. Se connecter en tant que CLIENT (non-admin)
# 2. Ouvrir la console DevTools
# 3. Exécuter :

fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user-id',
    title: 'Test',
    message: 'Ceci est un test'
  })
}).then(r => r.json()).then(console.log)

# ✅ ATTENDU : { success: false, error: "Accès refusé : rôle administrateur requis" }
# ✅ ATTENDU : Voir dans les logs serveur : [SECURITY] Tentative non autorisée
```

### Test 2 : Validation des liens

```bash
# En tant qu'ADMIN, essayer d'envoyer un lien externe malveillant

fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    title: 'Test lien malveillant',
    message: 'Cliquez ici',
    link: 'https://malicious-site.com/phishing'
  })
}).then(r => r.json()).then(console.log)

# ✅ ATTENDU : { success: false, error: "Lien non autorisé : seuls les liens internes..." }
```

### Test 3 : Liens autorisés

```bash
# Lien relatif (OK)
link: '/dashboard'
# ✅ ATTENDU : Notification créée

# Lien localhost (OK en dev)
link: 'http://localhost:3000/profile'
# ✅ ATTENDU : Notification créée

# Lien felora.ch (OK)
link: 'https://felora.ch/map'
# ✅ ATTENDU : Notification créée
```

---

## ⚡ Tests de Performance

### Test 4 : Polling unifié

**Objectif** : Vérifier qu'il n'y a qu'un seul appel `/api/notifications` toutes les 30s

```bash
# 1. Se connecter
# 2. Ouvrir DevTools → Network
# 3. Filtrer par "notifications"
# 4. Attendre 60 secondes
# 5. Observer les appels

# ✅ ATTENDU : 2 appels max en 60s (1 toutes les 30s)
# ❌ AVANT : 4 appels (2 polling indépendants)
```

### Test 5 : Endpoint transactionnel `/mark-opened`

**Objectif** : 1 seul appel au lieu de 3 lors de l'ouverture d'une conversation

```bash
# 1. Aller sur /messages
# 2. Ouvrir DevTools → Network
# 3. Cliquer sur une conversation
# 4. Observer les requêtes API

# ✅ ATTENDU : 1 seul appel POST /api/e2ee/conversations/mark-opened
# ❌ AVANT : 3 appels séquentiels (mark-read, read, mark-conversation-read)
```

### Test 6 : AbortController

**Objectif** : Les requêtes en cours sont annulées lors de changement rapide

```bash
# 1. Aller sur /messages
# 2. Ouvrir DevTools → Network
# 3. Cliquer sur conversation A, puis IMMÉDIATEMENT sur conversation B
# 4. Observer les requêtes

# ✅ ATTENDU : Requête pour A annulée (status: "canceled")
# ✅ ATTENDU : Seule la requête pour B se termine
```

---

## 🔔 Tests Fonctionnels - Notifications

### Test 7 : Badge cloche en temps réel

```bash
# Étapes :
# 1. Se connecter en tant qu'utilisateur A
# 2. Ouvrir l'app en mode normal
# 3. En tant qu'ADMIN dans un autre onglet, envoyer une notification à A :

# Dans l'onglet admin :
fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'USER_A_ID',
    title: 'Test badge',
    message: 'Vérification badge cloche'
  })
}).then(r => r.json()).then(console.log)

# ✅ ATTENDU (dans l'onglet user A) :
# - Badge cloche apparaît avec "1" après max 30s (polling SWR)
# - Cliquer sur la cloche → notification visible
```

### Test 8 : Marquer comme lu (optimistic update)

```bash
# 1. Avoir des notifications non lues
# 2. Cliquer sur la cloche
# 3. Cliquer sur une notification

# ✅ ATTENDU :
# - La notification devient "lue" INSTANTANÉMENT (pas de délai)
# - Badge cloche décrémente immédiatement
# - Requête PATCH /api/notifications se fait en arrière-plan
```

### Test 9 : Tout marquer comme lu

```bash
# 1. Avoir plusieurs notifications non lues
# 2. Cliquer sur "Tout marquer comme lu"

# ✅ ATTENDU :
# - Toutes les notifications deviennent lues INSTANTANÉMENT
# - Badge cloche disparaît immédiatement
# - Requête PATCH avec markAllAsRead:true en arrière-plan
```

### Test 10 : Validation liens dans NotificationBell

```bash
# Créer une notification avec lien externe non whitelisté (simuler hack BDD)
# INSERT INTO "Notification" (userId, type, title, message, link, read)
# VALUES ('user-id', 'SYSTEM_ALERT', 'Test', 'Message', 'https://evil.com', false);

# Cliquer sur cette notification

# ✅ ATTENDU :
# - Modal s'ouvre avec avertissement : "⚠️ Le lien associé n'est pas sécurisé..."
# - PAS de redirection vers evil.com
```

---

## 💬 Tests Fonctionnels - Messagerie

### Test 11 : Ouverture conversation

```bash
# 1. Aller sur /messages
# 2. Cliquer sur une conversation

# ✅ ATTENDU :
# - 1 seul appel POST /api/e2ee/conversations/mark-opened
# - Badge conversation disparaît immédiatement
# - Messages marqués comme lus
# - Notifications MESSAGE_RECEIVED marquées comme lues
```

### Test 12 : Changement rapide de conversation

```bash
# 1. Sur /messages, conversation A ouverte
# 2. Cliquer rapidement sur B, puis C, puis D

# ✅ ATTENDU :
# - Pas de crash
# - Requêtes A, B, C annulées (AbortController)
# - Seule requête D se termine
# - Logs : "Requête annulée (changement rapide de conversation)"
```

### Test 13 : Pagination notifications

```bash
# Créer 60+ notifications en base

# Dans la console :
fetch('/api/notifications?limit=20&channel=system')
  .then(r => r.json())
  .then(console.log)

# ✅ ATTENDU :
{
  notifications: [...20 items],
  unreadCount: 15,
  pagination: {
    nextCursor: "notif_xyz123",
    hasNextPage: true,
    limit: 20
  }
}

# Récupérer page suivante :
fetch('/api/notifications?cursor=notif_xyz123&limit=20')
  .then(r => r.json())
  .then(console.log)

# ✅ ATTENDU : 20 notifications suivantes
```

---

## 📊 Tests de Charge

### Test 14 : Polling sous charge

```bash
# Simuler 10 utilisateurs avec polling 30s pendant 5 min

# Mesurer requests/minute :
# ✅ AVANT : ~40 req/min (2 polling × 10 users × 2/min)
# ✅ APRÈS : ~20 req/min (1 polling × 10 users × 2/min)
# ✅ AMÉLIORATION : -50%
```

### Test 15 : Requête JSON Prisma

```bash
# Comparer performance mark-conversation-read

# AVANT (2 requêtes + loop JS) :
# SELECT * FROM Notification WHERE userId=... AND type='MESSAGE_RECEIVED' AND read=false
# [Loop JS pour filtrer metadata.conversationId]
# UPDATE Notification SET read=true WHERE id IN (...)
# ⏱️ Temps : ~50-100ms

# APRÈS (1 requête JSON) :
# UPDATE Notification SET read=true WHERE userId=... AND metadata->>'conversationId' = '...'
# ⏱️ Temps : ~20-50ms
# ✅ AMÉLIORATION : ~50-70% plus rapide
```

---

## 🔍 Tests de Régression

### Test 16 : Fonctionnalités existantes

**Checklist complète** :

- [ ] Login/Logout fonctionne
- [ ] Badge messages (conversations) affiche le bon count
- [ ] Badge cloche (notifications) affiche le bon count
- [ ] StaticNavBar menu burger fonctionne
- [ ] Sélecteur de langue fonctionne
- [ ] Navigation entre pages fonctionne
- [ ] Création nouveau message fonctionne
- [ ] Envoi message dans conversation fonctionne
- [ ] Blocage utilisateur fonctionne
- [ ] Signalement conversation fonctionne
- [ ] Suppression conversation fonctionne
- [ ] Admin panel accessible (pour admins)
- [ ] Profils escort/club visibles
- [ ] Recherche fonctionne
- [ ] Carte interactive fonctionne
- [ ] Upload média fonctionne

---

## 🐛 Scénarios de Bug Potentiels

### Scénario 1 : SWR cache stale

```bash
# 1. Ouvrir 2 onglets avec même user
# 2. Dans onglet 1 : recevoir notification
# 3. Dans onglet 2 : marquer comme lue
# 4. Revenir sur onglet 1

# ✅ ATTENDU :
# - SWR revalidateOnFocus → détecte changement
# - Badge met à jour automatiquement
```

### Scénario 2 : Network offline

```bash
# 1. Ouvrir /messages
# 2. DevTools → Network → Offline
# 3. Essayer de marquer conversation lue

# ✅ ATTENDU :
# - useNetworkError détecte l'erreur
# - NetworkErrorBanner s'affiche
# - Bouton "Retry" disponible
# - Pas de crash
```

### Scénario 3 : Race condition

```bash
# 1. Ouvrir conversation A (badge 3 non lus)
# 2. PENDANT le fetch mark-opened, recevoir 2 nouveaux messages
# 3. Fetch mark-opened se termine

# ✅ ATTENDU :
# - Badge affiche 2 (nouveaux messages seulement)
# - Pas de badge négatif
# - Transaction Prisma garantit cohérence
```

---

## 📱 Tests Mobile

### Test 17 : Responsive notifications

```bash
# Sur mobile (ou DevTools device mode) :
# 1. Cliquer sur la cloche
# 2. Vérifier dropdown notifications

# ✅ ATTENDU :
# - Dropdown prend toute la largeur (w-[calc(100vw-1rem)])
# - Pas de débordement horizontal
# - Scroll vertical fonctionne
# - Boutons tactiles accessibles (taille min 44x44px)
```

---

## 📝 Logs à vérifier

### Logs serveur attendus

```bash
# Action admin réussie :
[ADMIN ACTION] Notification envoyée: {
  adminId: "admin-123",
  adminEmail: "admin@felora.ch",
  targetUserId: "user-456",
  targetEmail: "user@example.com",
  notificationType: "SYSTEM_ALERT",
  title: "Votre profil a été validé",
  hasLink: true,
  timestamp: "2025-01-20T15:30:00Z"
}

# Tentative non autorisée :
[SECURITY] Tentative non autorisée d'envoi de notification: {
  userId: "user-123",
  email: "user@example.com",
  role: "CLIENT",
  ip: "192.168.1.100",
  timestamp: "2025-01-20T15:35:00Z"
}

# Lien invalide :
[SECURITY] Lien invalide ou non autorisé: https://malicious.com Error: Domaine non autorisé

# Conversation ouverte :
[MARK OPENED] ✅ Transaction réussie: {
  conversationId: "conv-789",
  userId: "user-123",
  messagesMarkedRead: 3,
  notificationsMarkedRead: 2,
  conversationRead: "2025-01-20T15:40:00Z"
}
```

---

## ⚠️ Signaux d'alerte (Bugs à surveiller)

### 🚨 Problèmes critiques

1. **Badge négatif** : Badge affiche -1 ou -2
   - Cause probable : Race condition dans optimistic update
   - Fix : Ajouter `Math.max(0, ...)` dans le hook

2. **Polling non arrêté** : Requêtes /api/notifications continuent après déconnexion
   - Cause : SWR ne désactive pas le hook
   - Fix : Vérifier `enabled` dans useNotifications

3. **Requêtes infinies** : Loop de requêtes API
   - Cause : SWR dedupingInterval trop court ou bug revalidation
   - Fix : Augmenter dedupingInterval à 10s

### ⚠️ Problèmes modérés

4. **Modal notification ne ferme pas** : Clic extérieur ne fonctionne pas
   - Cause : dropdownRef pas attaché correctement
   - Fix : Vérifier useEffect dependencies

5. **Badge cloche reste après lecture** : Badge 1 reste affiché
   - Cause : Filtre channel pas appliqué
   - Fix : Vérifier query param `?channel=system`

---

## ✅ Checklist finale avant déploiement

- [ ] `npm run build` réussit sans erreur
- [ ] Tous les tests fonctionnels passent
- [ ] Logs admin corrects (pas d'erreurs)
- [ ] Performance testée (polling réduit de 50%)
- [ ] Sécurité testée (admin endpoint protégé)
- [ ] Mobile responsive vérifié
- [ ] Cache SWR fonctionne correctement
- [ ] AbortController annule bien les requêtes
- [ ] Pas de regression sur features existantes
- [ ] Documentation à jour (README.md)

---

## 🚀 Prochaines étapes (Phase 2)

Une fois tous les tests validés :
1. Déployer sur environnement de staging
2. Tests utilisateurs réels (5-10 personnes)
3. Monitoring Sentry activé
4. Si OK : déploiement production
5. Surveillance 24h post-déploiement

---

## 📞 En cas de problème

**Rollback rapide** :
```bash
git revert HEAD~2  # Annule les 2 derniers commits
npm run build
# Redéployer
```

**Logs debug** :
- Activer `DEBUG=*` en env var
- Vérifier logs Vercel/Railway
- Consulter Sentry (si configuré)

**Support** :
- Consulter [NOTIFICATIONS_MESSAGING_REFACTOR.md](NOTIFICATIONS_MESSAGING_REFACTOR.md)
- Ouvrir issue GitHub avec logs
- Tag : `[URGENT]` si prod cassée
