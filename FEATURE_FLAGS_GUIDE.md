# 🚀 Guide des Feature Flags - FELORA V3

Guide complet pour utiliser et tester les feature flags de la librairie UI.

## 🎯 Feature Flags Disponibles

### `FEATURE_UI_HOME`
- **Description** : Active le nouveau design de la page d'accueil (feed TikTok-style)
- **Composants** : VideoFeedCard, ClientFeedPage
- **Design** : Interface fullscreen avec glass effects

### `FEATURE_UI_PROFILE`
- **Description** : Active le nouveau design des pages de profil escort
- **Composants** : NewEscortProfilePage, GlassCard, animations
- **Design** : Interface premium avec carousel de médias

## 🔧 Activation des Flags

### 1. Variables d'Environnement (Production)
```bash
# Dans .env.local ou variables Vercel
NEXT_PUBLIC_FEATURE_UI_HOME=true
NEXT_PUBLIC_FEATURE_UI_PROFILE=true
```

### 2. Cookies (Développement/Test)
```javascript
// Activer tous les flags
document.cookie = 'canary=1; path=/; max-age=31536000'

// Activer un flag spécifique
document.cookie = 'feature_ui_home=true; path=/; max-age=31536000'
document.cookie = 'feature_ui_profile=true; path=/; max-age=31536000'
```

### 3. Interface de Test
```javascript
// Bouton pour activer le mode canary
<button onClick={() => {
  document.cookie = 'canary=1; path=/; max-age=31536000'
  window.location.reload()
}}>
  Activer le nouveau design
</button>
```

## 🧪 Tests et Debugging

### Vérifier l'état des flags
```javascript
// Dans la console du navigateur
console.log('UI Flags:', {
  home: document.cookie.includes('canary=1') || process.env.NEXT_PUBLIC_FEATURE_UI_HOME === 'true',
  profile: document.cookie.includes('feature_ui_profile=true') || process.env.NEXT_PUBLIC_FEATURE_UI_PROFILE === 'true'
})
```

### Logs de migration
Les composants loggent leur activation :
```javascript
// Dans la console
[UI] Home page activated with FEATURE_UI_HOME flag
[UI] Escort profile page activated with FEATURE_UI_PROFILE flag
```

## 📱 Pages Testées

### Page d'Accueil (`/`)
- **Sans flag** : Interface legacy simple
- **Avec flag** : Feed TikTok-style avec VideoFeedCard
- **Test** : Scroll infini, interactions vidéo, réactions

### Profil Escort (`/profile-test/escort/[id]`)
- **Sans flag** : Interface legacy simple
- **Avec flag** : Interface premium avec carousel, glass effects
- **Test** : Navigation médias, animations, réactions

## 🎨 Composants UI Migrés

### Atoms
- ✅ Button (variants: default, glass, neural, outline, ghost, destructive)
- ✅ Card (avec effet glass)
- ✅ Input (style premium)
- ✅ Textarea (style premium)
- ✅ Dialog (avec backdrop blur)

### Primitives
- ✅ GlassCard (effets de verre avancés)

### Tokens CSS
- ✅ Design tokens complets
- ✅ Variables CSS pour couleurs, spacing, effets
- ✅ Utilities pour glass effects

## 🔄 Workflow de Migration

### 1. Développement
```bash
# Activer le mode canary pour tous les tests
document.cookie = 'canary=1; path=/; max-age=31536000'
```

### 2. Tests
- Tester chaque page avec et sans flag
- Vérifier les interactions (clics, scroll, animations)
- Valider la responsivité mobile/desktop

### 3. Production
```bash
# Activer progressivement
NEXT_PUBLIC_FEATURE_UI_HOME=true
# Puis plus tard
NEXT_PUBLIC_FEATURE_UI_PROFILE=true
```

## 🐛 Dépannage

### Flag ne s'active pas
1. Vérifier le nom du flag (case sensitive)
2. Redémarrer le serveur de développement
3. Vider le cache du navigateur

### Erreurs de build
1. Vérifier que tous les composants UI sont importés
2. Vérifier les dépendances manquantes
3. Vérifier les chemins d'import

### Performance
1. Les flags n'impactent pas les Core Web Vitals
2. Les composants sont lazy-loaded
3. Les animations sont optimisées

## 📋 Checklist de Déploiement

- [ ] Tous les composants UI fonctionnent
- [ ] Feature flags activables via cookies et env vars
- [ ] Tests sur mobile et desktop
- [ ] Logs de debugging en place
- [ ] Documentation à jour
- [ ] Assets whitelist configurée

## 🚀 Prochaines Étapes

1. **Tester** les pages migrées
2. **Valider** les interactions utilisateur
3. **Optimiser** les performances si nécessaire
4. **Déployer** progressivement en production
5. **Migrer** d'autres pages selon les besoins
