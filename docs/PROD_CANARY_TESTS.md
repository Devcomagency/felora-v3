# 🧪 Guide de Tests Canary Production

## 🎯 Vue d'ensemble
Ce guide détaille les procédures de test canary pour les nouvelles fonctionnalités UI migrées de V2 vers V3.

## 🔧 Configuration Canary

### Activation via Cookie
```javascript
// Activer le mode canary (24h)
document.cookie = 'canary=1; path=/; max-age=31536000'

// Désactiver le mode canary
document.cookie = 'canary=0; path=/; max-age=0'
```

### Variables d'environnement
```bash
# Flags UI (Preview/Canary)
NEXT_PUBLIC_FEATURE_UI_PROFILE=true
NEXT_PUBLIC_FEATURE_UI_MESSAGES=true
NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_PROFIL=true
NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_MEDIAS=true
NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_STATISTIQUES=true
NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_PARAMETRES=true
NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_ACTIVITE=true
NEXT_PUBLIC_FEATURE_UI_DASHBOARD_CLUB_PROFILE=true
NEXT_PUBLIC_FEATURE_UI_ADMIN_COMMENTS=true
NEXT_PUBLIC_FEATURE_UI_MAP=true
NEXT_PUBLIC_FEATURE_UI_MARKETPLACE_GIFTS=true

# Upload R2 (Canary)
FEATURE_UPLOAD=true
CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
CLOUDFLARE_R2_BUCKET_NAME=your_bucket
CLOUDFLARE_R2_ENDPOINT=your_endpoint
CLOUDFLARE_R2_PUBLIC_URL=your_public_url
```

## 📋 Checklist de Tests par Page

### **Lot 1 - Public**
#### 1. Profil Public (`/profile/[id]`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_PROFILE=true`
- [ ] **Test**: Navigation vers un profil escort
- [ ] **Vérifications**:
  - [ ] Header avec gradient FELORA
  - [ ] Galerie d'images fonctionnelle
  - [ ] Sections (About, Rates, Availability, Physical)
  - [ ] Actions bar (favoris, messages, cadeaux)
  - [ ] Commentaires section
  - [ ] Zéro erreur console
  - [ ] Performance Lighthouse > 90

#### 2. Recherche (`/search`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_HOME=true` (si Home touchée)
- [ ] **Test**: Recherche d'escorts
- [ ] **Vérifications**:
  - [ ] Filtres avec style V2
  - [ ] Grille de profils responsive
  - [ ] États de chargement
  - [ ] Empty state "Aucun résultat"
  - [ ] Pagination fonctionnelle

#### 3. Liste Profils (`/profiles`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_HOME=true` (si Home touchée)
- [ ] **Test**: Navigation et filtrage
- [ ] **Vérifications**:
  - [ ] Cartes avec hover effects
  - [ ] Sections et titres
  - [ ] Chargement progressif
  - [ ] Responsive design

### **Lot 2 - Messages**
#### 4. Messages (`/messages`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_MESSAGES=true`
- [ ] **Test**: Interface de chat E2EE
- [ ] **Vérifications**:
  - [ ] Header glassmorphism
  - [ ] Liste des conversations
  - [ ] Thread de messages actif
  - [ ] Composer avec emojis/attachments
  - [ ] Modals de report/block
  - [ ] E2EE fonctionnel

### **Lot 3 - Dashboard Escort**
#### 5. Profil Escort (`/dashboard-escort/profil`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_PROFIL=true`
- [ ] **Test**: Édition de profil
- [ ] **Vérifications**:
  - [ ] Interface V2 avec tokens FELORA
  - [ ] Formulaires fonctionnels
  - [ ] Upload d'images
  - [ ] Sauvegarde des données

#### 6. Médias Escort (`/dashboard-escort/medias`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_MEDIAS=true`
- [ ] **Test**: Gestion des médias
- [ ] **Vérifications**:
  - [ ] Interface V2
  - [ ] Upload/Suppression
  - [ ] Prévisualisation
  - [ ] Drag & drop

#### 7. Statistiques Escort (`/dashboard-escort/statistiques`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_STATISTIQUES=true`
- [ ] **Test**: Visualisation des stats
- [ ] **Vérifications**:
  - [ ] KPIs avec design V2
  - [ ] Graphiques responsifs
  - [ ] Données en temps réel
  - [ ] Export possible

#### 8. Paramètres Escort (`/dashboard-escort/parametres`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_PARAMETRES=true`
- [ ] **Test**: Configuration
- [ ] **Vérifications**:
  - [ ] Interface V2
  - [ ] Tous les paramètres fonctionnels
  - [ ] Sauvegarde des préférences
  - [ ] Notifications

#### 9. Activité Escort (`/dashboard-escort/activite`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_ACTIVITE=true`
- [ ] **Test**: Feed d'activité
- [ ] **Vérifications**:
  - [ ] Interface V2
  - [ ] Timeline des interactions
  - [ ] Filtres par type
  - [ ] Pagination

### **Lot 4 - Club/Admin**
#### 10. Club Profile (`/dashboard-club`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_DASHBOARD_CLUB_PROFILE=true`
- [ ] **Test**: Gestion de profil club
- [ ] **Vérifications**:
  - [ ] Interface V2
  - [ ] Gestion des escorts
  - [ ] Upload de médias
  - [ ] Paramètres

#### 11. Admin Comments (`/admin/comments`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_ADMIN_COMMENTS=true`
- [ ] **Test**: Modération des commentaires
- [ ] **Vérifications**:
  - [ ] Interface V2
  - [ ] Actions de modération
  - [ ] Filtres et recherche
  - [ ] Logs d'actions

### **Lot 5 - Supplémentaires**
#### 12. Map (`/map`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_MAP=true`
- [ ] **Test**: Carte interactive
- [ ] **Vérifications**:
  - [ ] Loading skeleton V2
  - [ ] MapLibre fonctionnel
  - [ ] Markers et interactions
  - [ ] Performance

#### 13. Marketplace Cadeaux (`/marketplace-test/gifts`)
- [ ] **Flag**: `NEXT_PUBLIC_FEATURE_UI_MARKETPLACE_GIFTS=true`
- [ ] **Test**: Envoi de cadeaux
- [ ] **Vérifications**:
  - [ ] Interface V2
  - [ ] Catalogue des cadeaux
  - [ ] Sélection destinataire
  - [ ] Envoi fonctionnel

## 🔍 Tests de Qualité

### Performance
- [ ] **Lighthouse Score** > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] **Core Web Vitals** dans le vert
- [ ] **First Contentful Paint** < 1.5s
- [ ] **Largest Contentful Paint** < 2.5s
- [ ] **Cumulative Layout Shift** < 0.1

### Accessibilité
- [ ] **Navigation clavier** complète
- [ ] **Contrastes** conformes WCAG AA
- [ ] **Tailles de clic** > 44px
- [ ] **Alt texts** sur toutes les images
- [ ] **Focus indicators** visibles

### Console
- [ ] **Zéro erreur** JavaScript
- [ ] **Zéro warning** critique
- [ ] **Network requests** réussis
- [ ] **API calls** fonctionnels

## 📊 Monitoring

### Sentry
- [ ] **Erreurs** trackées et résolues
- [ ] **Performance** monitorée
- [ ] **User sessions** enregistrées

### Logs
- [ ] **Server logs** propres
- [ ] **API responses** correctes
- [ ] **Database queries** optimisées

## 🚀 Procédure de Rollout

### Phase 1: Preview (Développement)
1. Activer les flags en local
2. Tester toutes les fonctionnalités
3. Capturer screenshots/vidéos
4. Valider avec l'équipe

### Phase 2: Canary (5% des utilisateurs)
1. Activer `canary=1` cookie
2. Monitorer Sentry/logs 24h
3. Vérifier métriques de performance
4. Collecter feedback utilisateurs

### Phase 3: Rollout Progressif (25% → 50% → 100%)
1. Augmenter progressivement le pourcentage
2. Monitorer chaque étape
3. Rollback si nécessaire
4. Documentation des changements

## 🆘 Rollback d'Urgence

### Désactivation Immédiate
```bash
# Désactiver tous les flags UI
NEXT_PUBLIC_FEATURE_UI_*=false

# Ou désactiver canary
document.cookie = 'canary=0; path=/; max-age=0'
```

### Vérification Post-Rollback
- [ ] Ancienne interface restaurée
- [ ] Fonctionnalités de base opérationnelles
- [ ] Performance restaurée
- [ ] Zéro erreur critique

## 📝 Documentation

### Captures d'Écran
- [ ] **Avant** : Interface V3 originale
- [ ] **Après** : Interface V2 migrée
- [ ] **États** : Loading, Error, Empty, Success

### Vidéos
- [ ] **Navigation** : Parcours utilisateur complet
- [ ] **Interactions** : Clics, hovers, animations
- [ ] **Responsive** : Mobile, tablet, desktop

### Métriques
- [ ] **Performance** : Lighthouse scores
- [ ] **Usage** : Analytics des nouvelles fonctionnalités
- [ ] **Erreurs** : Taux d'erreur par page
- [ ] **Satisfaction** : Feedback utilisateurs

---

**Note**: Ce guide doit être mis à jour après chaque déploiement pour refléter les changements et améliorations apportées.