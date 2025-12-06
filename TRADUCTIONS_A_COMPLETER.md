# 🔧 Traductions Landing - À compléter

## ✅ Ce qui est FAIT :

1. ✅ **Header** - 100% traduit (navigation + CTA)
2. ✅ **HeroSection** - Partiellement traduit (badge, titre, sous-titre, description)
3. ✅ **LanguageSwitcher** - Fonctionne parfaitement

## 🚧 Ce qui reste à FAIRE :

### HeroSection - Compléter
Fichier : `src/components/landing/premium/HeroSection.tsx`

Remplacer ligne 127 :
```tsx
Découvrir Felora
```
Par :
```tsx
{t('cta.primary')}
```

Remplacer ligne 143 :
```tsx
S'inscrire Maintenant
```
Par :
```tsx
{t('cta.secondary')}
```

Remplacer ligne 155 :
```tsx
{ value: '100%', label: 'Suisse', icon: '✓' },
```
Par :
```tsx
{ value: t('stats.swiss.value'), label: t('stats.swiss.label'), icon: '✓' },
```

Remplacer ligne 156 :
```tsx
{ value: '24/7', label: 'Support', icon: '💬' },
```
Par :
```tsx
{ value: t('stats.support.value'), label: t('stats.support.label'), icon: '💬' },
```

Remplacer ligne 187 :
```tsx
Découvrir
```
Par :
```tsx
{t('scroll')}
```

### FreeBadges
Fichier : `src/components/landing/premium/FreeBadges.tsx`

1. Ajouter après ligne 4 :
```tsx
import { useTranslations } from 'next-intl';
```

2. Ajouter après ligne 8 dans la fonction :
```tsx
const t = useTranslations('landing.freeBadges');
```

3. Remplacer ligne 54 :
```tsx
Sans engagement
```
Par :
```tsx
{t('badge')}
```

4. Remplacer ligne 58 :
```tsx
100% Gratuit
```
Par :
```tsx
{t('title')}
```

5. Remplacer ligne 61-62 :
```tsx
Pour tous, sans frais cachés ni abonnement
```
Par :
```tsx
{t('description')}
```

6. Remplacer les badges (lignes 11-33) par :
```tsx
const badges = [
  {
    title: t('items.clients.title'),
    description: t('items.clients.description'),
    icon: <CheckCircle2 className="w-8 h-8" />,
    gradient: 'from-[#FF6B9D] to-[#FF6B9D]/80',
    glow: '#FF6B9D',
  },
  {
    title: t('items.independantes.title'),
    description: t('items.independantes.description'),
    icon: <CheckCircle2 className="w-8 h-8" />,
    gradient: 'from-[#B794F6] to-[#B794F6]/80',
    glow: '#B794F6',
  },
  {
    title: t('items.etablissements.title'),
    description: t('items.etablissements.description'),
    icon: <CheckCircle2 className="w-8 h-8" />,
    gradient: 'from-[#4FD1C7] to-[#4FD1C7]/80',
    glow: '#4FD1C7',
  },
];
```

### DualValueProposition
Fichier : `src/components/landing/premium/DualValueProposition.tsx`

Même principe, ajouter `useTranslations` et remplacer tous les textes hardcodés par `t('dualValue.xxx')`

### FeaturesIndependantes
Fichier : `src/components/landing/premium/FeaturesIndependantes.tsx`

Même principe avec `t('featuresIndependantes.xxx')`

### FeaturesClients
Fichier : `src/components/landing/premium/FeaturesClients.tsx`

Même principe avec `t('featuresClients.xxx')`

### FeaturesEtablissements
Fichier : `src/components/landing/premium/FeaturesEtablissements.tsx`

Même principe avec `t('featuresEtablissements.xxx')`

## 📝 Toutes les traductions sont DÉJÀ dans les fichiers JSON !

- `src/messages/fr.json`
- `src/messages/en.json`
- `src/messages/es.json`
- `src/messages/de.json`

Il suffit juste de modifier les composants pour utiliser `t()` au lieu des textes en dur.

## 🔧 Test rapide

Après chaque modification, testez sur http://localhost:3000/landing et changez de langue avec le bouton 🌐

