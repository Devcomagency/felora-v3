# 🌍 Instructions pour implémenter next-intl - Felora V3

## 📋 Objectif
Implémenter le support multilingue avec `next-intl` pour 9 langues :
- Français (fr) - par défaut
- Allemand (de)
- Italien (it)
- Anglais (en)
- Espagnol (es)
- Russe (ru)
- Arabe (ar) - RTL
- Portugais (pt)
- Albanais (sq)

---

## ✅ Étape 1 : Installation

```bash
pnpm add next-intl
```

---

## ✅ Étape 2 : Créer le middleware

Créer `middleware.ts` à la racine du projet :

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

---

## ✅ Étape 3 : Modifier next.config.js

Ajouter en haut du fichier :

```javascript
const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
)
```

Et modifier l'export :

```javascript
module.exports = withNextIntl(nextConfig)
```

---

## ✅ Étape 4 : Créer les fichiers de traduction

Créer le dossier `messages/` à la racine et créer 9 fichiers JSON :

### Structure :
```
messages/
├── fr.json
├── de.json
├── it.json
├── en.json
├── es.json
├── ru.json
├── ar.json
├── pt.json
└── sq.json
```

### Contenu de base pour chaque fichier :

**messages/fr.json** (base - le plus complet) :
```json
{
  "common": {
    "search": "Rechercher",
    "filters": "Filtres",
    "loading": "Chargement...",
    "error": "Erreur",
    "retry": "Réessayer",
    "close": "Fermer",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "confirm": "Confirmer",
    "delete": "Supprimer",
    "edit": "Modifier",
    "back": "Retour"
  },
  "search": {
    "title": "Recherche",
    "placeholder": "Rechercher par nom, ville...",
    "profiles": "Profils",
    "establishments": "Établissements",
    "noResults": "Aucun résultat trouvé",
    "loadMore": "Voir plus",
    "results": "{count} résultats",
    "results_one": "{count} résultat",
    "results_other": "{count} résultats"
  },
  "map": {
    "title": "Carte interactive",
    "loading": "Chargement de la carte...",
    "visibleProfiles": "{count} profils visibles",
    "visibleProfiles_one": "{count} profil visible",
    "visibleProfiles_other": "{count} profils visibles",
    "locateMe": "Me localiser"
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
    "signup": "Inscription",
    "favorites": "Mes favoris"
  },
  "auth": {
    "loginRequired": "Connectez-vous pour accéder à cette fonctionnalité",
    "addToFavorites": "Ajouté aux favoris",
    "removeFromFavorites": "Retiré des favoris"
  }
}
```

**Créer les 8 autres fichiers avec les traductions correspondantes** (en, de, it, es, ru, ar, pt, sq).

---

## ✅ Étape 5 : Adapter src/app/layout.tsx

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

---

## ✅ Étape 6 : Créer src/app/[locale]/layout.tsx

Créer ce fichier :

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

---

## ✅ Étape 7 : Déplacer les pages dans [locale]

Déplacer toutes les pages de `src/app/` vers `src/app/[locale]/` :

- `src/app/search/page.tsx` → `src/app/[locale]/search/page.tsx`
- `src/app/map/page.tsx` → `src/app/[locale]/map/page.tsx`
- `src/app/profile-test/` → `src/app/[locale]/profile-test/`
- etc.

**Exceptions** : Ne PAS déplacer :
- `src/app/api/` (routes API)
- `src/app/layout.tsx` (layout racine)

---

## ✅ Étape 8 : Remplacer les textes hardcodés

Dans chaque composant, remplacer les textes français par `useTranslations()` :

**Avant** :
```typescript
<h1>Recherche</h1>
<button>Voir plus</button>
```

**Après** :
```typescript
'use client'
import { useTranslations } from 'next-intl'

const t = useTranslations('search')
<h1>{t('title')}</h1>
<button>{t('loadMore')}</button>
```

---

## ✅ Étape 9 : Adapter StaticNavBar

Modifier `src/components/layout/StaticNavBar.tsx` :

1. Importer :
```typescript
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { languageMetadata } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
```

2. Utiliser les traductions :
```typescript
const t = useTranslations('navigation')
const locale = useLocale()
const router = useRouter()
const pathname = usePathname()

// Remplacer les textes hardcodés par t('home'), t('search'), etc.
```

3. Adapter le sélecteur de langue :
```typescript
const handleLanguageChange = (langCode: string) => {
  router.replace(pathname, { locale: langCode })
  localStorage.setItem('felora-language', langCode)
}
```

---

## ✅ Étape 10 : Tester

1. Vérifier que toutes les pages fonctionnent
2. Tester le changement de langue
3. Vérifier le RTL pour l'arabe
4. Vérifier que les URLs sont correctes (/search, /en/search, /de/search)

---

## 📝 Checklist finale

- [ ] next-intl installé
- [ ] middleware.ts créé
- [ ] next.config.js modifié
- [ ] 9 fichiers messages/*.json créés
- [ ] layout.tsx adapté
- [ ] [locale]/layout.tsx créé
- [ ] Pages déplacées dans [locale]/
- [ ] Textes hardcodés remplacés par useTranslations()
- [ ] StaticNavBar adapté
- [ ] Tests effectués

---

## 🎯 Priorités de traduction

**Phase 1 (Essentiel)** :
- Navigation
- Recherche
- Messages d'erreur
- Boutons principaux

**Phase 2 (Important)** :
- Profils
- Messagerie
- Paramètres

**Phase 3 (Complémentaire)** :
- Dashboard
- Aide
- Emails

---

## ⚠️ Points d'attention

1. **Routes API** : Ne pas toucher `/api/*`
2. **Images** : Utiliser `/images/logo.png` (pas de préfixe locale)
3. **SEO** : Les URLs avec locale améliorent le SEO
4. **RTL** : Tester l'arabe sur mobile et desktop





