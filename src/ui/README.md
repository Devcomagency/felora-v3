# 🎨 FELORA UI Library

Librairie de composants UI extraite de Felora V2 et intégrée dans V3 avec feature flags.

## 📁 Structure

```
src/ui/
├── atoms/           # Composants de base (Button, Card, Input, etc.)
├── primitives/      # Composants primitifs (GlassCard, etc.)
├── tokens/          # Design tokens CSS et variables
├── theme/           # Configuration Tailwind et thèmes
└── README.md        # Cette documentation
```

## 🎯 Design System

### Tokens CSS (extraits de V2)
- **Couleurs** : Charte premium dark avec accents (#FF6B9D, #B794F6, #4FD1C7)
- **Glass Effects** : Effets de verre avec backdrop-blur
- **Spacing** : Système basé sur 8px
- **Typography** : Classes utilitaires pour tailles et poids

### Composants Principaux
- **Button** : Variants (default, glass, neural, outline, ghost, destructive)
- **Card** : Card standard avec effet glass
- **GlassCard** : Card avec effet de verre avancé
- **Input/Textarea** : Champs de formulaire stylisés
- **Dialog** : Modales avec backdrop blur

## 🔧 Utilisation

### Import des composants
```tsx
import { Button } from '@/ui/atoms/button'
import { GlassCard } from '@/ui/primitives/glass-card'
import { Card, CardHeader, CardTitle } from '@/ui/atoms/card'
```

### Feature Flags
Les composants UI sont activés via des feature flags (variables d'environnement côté client):
- `NEXT_PUBLIC_FEATURE_UI_HOME` : Page d'accueil avec design V2
- `NEXT_PUBLIC_FEATURE_UI_PROFILE` : Pages de profil avec design V2

### Configuration Tailwind
Les tokens CSS sont automatiquement inclus via `globals.css` et la configuration Tailwind étendue.

## 📦 Dépendances Requises

### Déjà présentes dans V3
- `@radix-ui/react-dialog` ✅
- `@radix-ui/react-slot` ✅
- `class-variance-authority` ✅
- `clsx` ✅
- `framer-motion` ✅
- `lucide-react` ✅
- `tailwind-merge` ✅

### À ajouter si nécessaire
- `react-intersection-observer` (pour VideoFeedCard)
- `lottie-web` (pour les animations de cadeaux)

## 🚀 Migration depuis V2

1. **Composants** : Copiés depuis `felora-v2/src/components/ui/`
2. **Tokens CSS** : Extraits de `felora-v2/src/app/globals.css`
3. **Configuration** : Adaptée pour V3 (chemins, imports)
4. **Feature Flags** : Système de basculement pour activation progressive

## 🎨 Charte Graphique

### Couleurs Principales
```css
--bg: #0B0B0B           /* Background principal */
--surface: #111318      /* Surfaces */
--panel: #14171D        /* Panneaux */
--accent-1: #FF6B9D     /* Rose principal */
--accent-2: #B794F6     /* Violet */
--accent-3: #4FD1C7     /* Cyan */
```

### Effets Glass
```css
--glass-bg: rgba(17,19,24,0.72)
--glass-blur: 12px
--glass-border: rgba(255,255,255,0.08)
```

## 🔄 Feature Flags

### Activation des flags
```typescript
// Dans les variables d'environnement (exposées au client)
NEXT_PUBLIC_FEATURE_UI_HOME=true
NEXT_PUBLIC_FEATURE_UI_PROFILE=true

// Ou via cookie (pour tests)
document.cookie = "canary=1; path=/"
```

### Utilisation dans les composants
```tsx
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

function HomePage() {
  const showNewUI = useFeatureFlag('FEATURE_UI_HOME')
  
  if (showNewUI) {
    return <NewHomePage />
  }
  
  return <OldHomePage />
}
```

## 📝 Notes de Migration

- **Compatibilité** : Tous les composants sont compatibles avec la logique V3
- **Performance** : Aucun impact sur les Core Web Vitals
- **Accessibilité** : Respect des standards WCAG
- **Responsive** : Design adaptatif mobile/desktop

## 🐛 Debugging

### Vérifier l'activation des flags
```javascript
// Dans la console du navigateur
console.log('UI Flags:', {
  home: document.cookie.includes('canary=1'),
  profile: process.env.NEXT_PUBLIC_FEATURE_UI_PROFILE
})
```

### Logs de migration
Les composants loggent leur activation pour faciliter le debugging :
```typescript
console.log('[UI] Component activated with flag:', flagName)
```
