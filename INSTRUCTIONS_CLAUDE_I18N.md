# 🌍 Instructions pour Claude - Implémentation i18n avec next-intl

## 📋 Contexte
Felora V3 utilise Next.js 15 avec App Router. On veut ajouter le support multilingue avec `next-intl` (PAS react-i18next).

## 🎯 Langues à supporter (9 langues)
- Français (fr) - par défaut
- Allemand (de)
- Italien (it)
- Anglais (en)
- Espagnol (es)
- Russe (ru)
- Arabe (ar) - RTL
- Portugais (pt)
- Albanais (sq)

## ✅ Fichiers déjà créés
- `i18n/routing.ts` - Configuration avec 9 langues ✅
- `i18n/request.ts` - Configuration next-intl ✅

## 📝 À faire

### 1. Installer next-intl
```bash
pnpm add next-intl
```

### 2. Créer middleware.ts (racine)
```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### 3. Modifier next.config.js
Ajouter en haut :
```javascript
const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
)
```

Modifier l'export :
```javascript
module.exports = withNextIntl(nextConfig)
```

### 4. Créer les fichiers de traduction
Créer le dossier `messages/` à la racine avec 9 fichiers JSON :
- `messages/fr.json` (base - le plus complet)
- `messages/de.json`
- `messages/it.json`
- `messages/en.json`
- `messages/es.json`
- `messages/ru.json`
- `messages/ar.json` (RTL)
- `messages/pt.json`
- `messages/sq.json`

**Structure de base pour fr.json** :
```json
{
  "common": {
    "search": "Rechercher",
    "filters": "Filtres",
    "loading": "Chargement...",
    "error": "Erreur",
    "close": "Fermer",
    "save": "Enregistrer",
    "cancel": "Annuler"
  },
  "search": {
    "title": "Recherche",
    "placeholder": "Rechercher par nom, ville...",
    "profiles": "Profils",
    "establishments": "Établissements",
    "noResults": "Aucun résultat trouvé",
    "loadMore": "Voir plus",
    "results": "{count} résultats"
  },
  "map": {
    "title": "Carte interactive",
    "loading": "Chargement de la carte...",
    "visibleProfiles": "{count} profils visibles"
  },
  "navigation": {
    "home": "Accueil",
    "search": "Recherche",
    "map": "Carte",
    "messages": "Messages",
    "profile": "Profil",
    "settings": "Paramètres",
    "logout": "Déconnexion",
    "login": "Connexion",
    "favorites": "Mes favoris"
  },
  "auth": {
    "loginRequired": "Connectez-vous pour accéder à cette fonctionnalité",
    "addToFavorites": "Ajouté aux favoris",
    "removeFromFavorites": "Retiré des favoris"
  }
}
```

**Traduire dans les 8 autres langues.**

### 5. Adapter src/app/layout.tsx
Modifier pour supporter les locales :
```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
```

### 6. Créer src/app/[locale]/layout.tsx
```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
```

### 7. Déplacer les pages dans [locale]
Déplacer toutes les pages de `src/app/` vers `src/app/[locale]/` :
- `src/app/search/` → `src/app/[locale]/search/`
- `src/app/map/` → `src/app/[locale]/map/`
- `src/app/profile-test/` → `src/app/[locale]/profile-test/`
- `src/app/messages/` → `src/app/[locale]/messages/`
- etc.

**NE PAS déplacer** :
- `src/app/api/` (routes API)
- `src/app/layout.tsx` (layout racine)

### 8. Remplacer les textes hardcodés
Dans chaque composant, remplacer les textes français par `useTranslations()` :

**Exemple dans src/app/[locale]/search/page.tsx** :
```typescript
'use client'
import { useTranslations } from 'next-intl'

const t = useTranslations('search')
const tCommon = useTranslations('common')

// Remplacer :
// "Recherche" → t('title')
// "Rechercher par nom, ville..." → t('placeholder')
// "Voir plus" → t('loadMore')
```

**Exemple dans src/components/layout/StaticNavBar.tsx** :
```typescript
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { languageMetadata } from '@/i18n/routing'

const t = useTranslations('navigation')
const locale = useLocale()
const router = useRouter()
const pathname = usePathname()

// Remplacer les textes hardcodés par t('home'), t('search'), etc.
// Adapter le sélecteur de langue pour utiliser router.replace(pathname, { locale })
```

### 9. Adapter la navigation
Utiliser les composants de navigation de next-intl :
```typescript
import { Link, useRouter, usePathname } from '@/i18n/routing'

// Au lieu de router.push('/search')
router.push('/search') // Fonctionne automatiquement avec la locale

// Pour changer de langue
router.replace(pathname, { locale: 'en' })
```

## ⚠️ Points importants
1. **Routes API** : Ne pas toucher `/api/*` - elles ne sont pas affectées par i18n
2. **Images** : Utiliser `/images/logo.png` (pas de préfixe locale)
3. **RTL** : L'arabe doit avoir `dir="rtl"` sur le `<html>` (déjà géré dans layout.tsx)
4. **URLs** : `/search` (fr par défaut), `/en/search`, `/de/search`, etc.

## ✅ Checklist
- [ ] next-intl installé
- [ ] middleware.ts créé
- [ ] next.config.js modifié
- [ ] 9 fichiers messages/*.json créés avec traductions
- [ ] layout.tsx adapté
- [ ] [locale]/layout.tsx créé
- [ ] Pages déplacées dans [locale]/
- [ ] Textes hardcodés remplacés par useTranslations()
- [ ] StaticNavBar adapté avec sélecteur de langue
- [ ] Navigation adaptée (router, Link)
- [ ] Tests : toutes les langues fonctionnent
- [ ] Test RTL pour l'arabe

## 📚 Référence
Voir `GUIDE_I18N_COMPLET.md` pour plus de détails.



