# 🌍 Guide d'implémentation i18n avec next-intl

## 📋 Vue d'ensemble

Ce guide vous explique comment ajouter proprement le support multilingue (Français, Anglais, Allemand, Italien, Espagnol) à Felora V3.

**Solution choisie : `next-intl`** (standard pour Next.js 15 avec App Router)

---

## 🚀 Étape 1 : Installation

```bash
npm install next-intl
# ou
pnpm add next-intl
```

---

## 📁 Étape 2 : Structure des fichiers

Créer la structure suivante :

```
felora-v3/
├── messages/
│   ├── fr.json
│   ├── en.json
│   ├── de.json
│   ├── it.json
│   └── es.json
├── i18n/
│   ├── request.ts
│   └── config.ts
└── middleware.ts (à créer/modifier)
```

---

## ⚙️ Étape 3 : Configuration

### 3.1 Créer `i18n/config.ts`

```typescript
// i18n/config.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Détecter la locale depuis l'URL ou les headers
  let locale = await requestLocale

  // Vérifier que la locale est valide
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
```

### 3.2 Créer `i18n/routing.ts`

```typescript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // Liste des langues supportées
  locales: ['fr', 'en', 'de', 'it', 'es'],
  
  // Langue par défaut
  defaultLocale: 'fr',
  
  // Préfixe de locale dans l'URL (optionnel)
  // Si false: /fr/search, /en/search
  // Si 'as-needed': /search (fr par défaut), /en/search
  localePrefix: 'as-needed'
})

// Navigation typée
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
```

### 3.3 Modifier `next.config.js`

```javascript
// next.config.js
const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... votre config existante
}

module.exports = withNextIntl(nextConfig)
```

### 3.4 Créer `middleware.ts`

```typescript
// middleware.ts (à la racine)
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Matcher pour toutes les routes sauf API, _next, fichiers statiques
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

---

## 📝 Étape 4 : Créer les fichiers de traduction

### 4.1 `messages/fr.json` (Français - base)

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
    "cancel": "Annuler"
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
    "visibleProfiles_other": "{count} profils visibles"
  },
  "navigation": {
    "home": "Accueil",
    "search": "Recherche",
    "map": "Carte",
    "messages": "Messages",
    "profile": "Profil",
    "settings": "Paramètres",
    "logout": "Déconnexion"
  }
}
```

### 4.2 `messages/en.json` (Anglais)

```json
{
  "common": {
    "search": "Search",
    "filters": "Filters",
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "close": "Close",
    "save": "Save",
    "cancel": "Cancel"
  },
  "search": {
    "title": "Search",
    "placeholder": "Search by name, city...",
    "profiles": "Profiles",
    "establishments": "Establishments",
    "noResults": "No results found",
    "loadMore": "Load more",
    "results": "{count} results",
    "results_one": "{count} result",
    "results_other": "{count} results"
  },
  "map": {
    "title": "Interactive Map",
    "loading": "Loading map...",
    "visibleProfiles": "{count} visible profiles",
    "visibleProfiles_one": "{count} visible profile",
    "visibleProfiles_other": "{count} visible profiles"
  },
  "navigation": {
    "home": "Home",
    "search": "Search",
    "map": "Map",
    "messages": "Messages",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout"
  }
}
```

### 4.3 `messages/de.json` (Allemand)

```json
{
  "common": {
    "search": "Suchen",
    "filters": "Filter",
    "loading": "Laden...",
    "error": "Fehler",
    "retry": "Wiederholen",
    "close": "Schließen",
    "save": "Speichern",
    "cancel": "Abbrechen"
  },
  "search": {
    "title": "Suche",
    "placeholder": "Nach Name, Stadt suchen...",
    "profiles": "Profile",
    "establishments": "Einrichtungen",
    "noResults": "Keine Ergebnisse gefunden",
    "loadMore": "Mehr laden",
    "results": "{count} Ergebnisse",
    "results_one": "{count} Ergebnis",
    "results_other": "{count} Ergebnisse"
  },
  "map": {
    "title": "Interaktive Karte",
    "loading": "Karte wird geladen...",
    "visibleProfiles": "{count} sichtbare Profile",
    "visibleProfiles_one": "{count} sichtbares Profil",
    "visibleProfiles_other": "{count} sichtbare Profile"
  },
  "navigation": {
    "home": "Startseite",
    "search": "Suche",
    "map": "Karte",
    "messages": "Nachrichten",
    "profile": "Profil",
    "settings": "Einstellungen",
    "logout": "Abmelden"
  }
}
```

### 4.4 `messages/it.json` (Italien)

```json
{
  "common": {
    "search": "Cerca",
    "filters": "Filtri",
    "loading": "Caricamento...",
    "error": "Errore",
    "retry": "Riprova",
    "close": "Chiudi",
    "save": "Salva",
    "cancel": "Annulla"
  },
  "search": {
    "title": "Ricerca",
    "placeholder": "Cerca per nome, città...",
    "profiles": "Profili",
    "establishments": "Stabilimenti",
    "noResults": "Nessun risultato trovato",
    "loadMore": "Carica di più",
    "results": "{count} risultati",
    "results_one": "{count} risultato",
    "results_other": "{count} risultati"
  },
  "map": {
    "title": "Mappa interattiva",
    "loading": "Caricamento mappa...",
    "visibleProfiles": "{count} profili visibili",
    "visibleProfiles_one": "{count} profilo visibile",
    "visibleProfiles_other": "{count} profili visibili"
  },
  "navigation": {
    "home": "Home",
    "search": "Ricerca",
    "map": "Mappa",
    "messages": "Messaggi",
    "profile": "Profilo",
    "settings": "Impostazioni",
    "logout": "Disconnetti"
  }
}
```

### 4.5 `messages/es.json` (Espagnol)

```json
{
  "common": {
    "search": "Buscar",
    "filters": "Filtros",
    "loading": "Cargando...",
    "error": "Error",
    "retry": "Reintentar",
    "close": "Cerrar",
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "search": {
    "title": "Búsqueda",
    "placeholder": "Buscar por nombre, ciudad...",
    "profiles": "Perfiles",
    "establishments": "Establecimientos",
    "noResults": "No se encontraron resultados",
    "loadMore": "Cargar más",
    "results": "{count} resultados",
    "results_one": "{count} resultado",
    "results_other": "{count} resultados"
  },
  "map": {
    "title": "Mapa interactivo",
    "loading": "Cargando mapa...",
    "visibleProfiles": "{count} perfiles visibles",
    "visibleProfiles_one": "{count} perfil visible",
    "visibleProfiles_other": "{count} perfiles visibles"
  },
  "navigation": {
    "home": "Inicio",
    "search": "Búsqueda",
    "map": "Mapa",
    "messages": "Mensajes",
    "profile": "Perfil",
    "settings": "Configuración",
    "logout": "Cerrar sesión"
  }
}
```

---

## 🔧 Étape 5 : Adapter le layout

### 5.1 Modifier `src/app/layout.tsx`

```typescript
// src/app/layout.tsx
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
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

// Générer les segments statiques pour toutes les locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
```

### 5.2 Créer `src/app/[locale]/layout.tsx`

```typescript
// src/app/[locale]/layout.tsx
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

## 📦 Étape 6 : Utiliser les traductions dans les composants

### 6.1 Dans un composant serveur

```typescript
// src/app/[locale]/search/page.tsx
import { useTranslations } from 'next-intl'

export default function SearchPage() {
  const t = useTranslations('search')

  return (
    <div>
      <h1>{t('title')}</h1>
      <input placeholder={t('placeholder')} />
      <p>{t('results', { count: 42 })}</p>
    </div>
  )
}
```

### 6.2 Dans un composant client

```typescript
'use client'

import { useTranslations } from 'next-intl'

export default function SearchButton() {
  const t = useTranslations('common')

  return <button>{t('search')}</button>
}
```

### 6.3 Navigation avec locale

```typescript
'use client'

import { useRouter, usePathname } from '@/i18n/routing'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const changeLanguage = (locale: string) => {
    router.replace(pathname, { locale })
  }

  return (
    <select onChange={(e) => changeLanguage(e.target.value)}>
      <option value="fr">Français</option>
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="it">Italiano</option>
      <option value="es">Español</option>
    </select>
  )
}
```

---

## 🎯 Étape 7 : Adapter StaticNavBar

```typescript
// src/components/layout/StaticNavBar.tsx
'use client'

import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'

export default function StaticNavBar() {
  const t = useTranslations('navigation')
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ]

  const handleLanguageChange = (langCode: string) => {
    router.replace(pathname, { locale: langCode })
  }

  return (
    <nav>
      <Link href="/">{t('home')}</Link>
      <Link href="/search">{t('search')}</Link>
      <Link href="/map">{t('map')}</Link>
      
      {/* Sélecteur de langue */}
      <select value={locale} onChange={(e) => handleLanguageChange(e.target.value)}>
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </nav>
  )
}
```

---

## ✅ Checklist d'implémentation

- [ ] Installer `next-intl`
- [ ] Créer la structure `messages/` avec les 5 langues
- [ ] Créer `i18n/config.ts` et `i18n/routing.ts`
- [ ] Modifier `next.config.js`
- [ ] Créer/modifier `middleware.ts`
- [ ] Adapter `layout.tsx` pour supporter les locales
- [ ] Créer `app/[locale]/layout.tsx`
- [ ] Déplacer les pages dans `app/[locale]/`
- [ ] Remplacer les textes hardcodés par `useTranslations()`
- [ ] Tester toutes les langues

---

## 🚨 Points d'attention

1. **Routes API** : Les routes `/api/*` ne sont pas affectées par i18n
2. **Images et assets** : Utiliser `/images/logo.png` (pas de préfixe locale)
3. **SEO** : Les URLs avec locale améliorent le SEO
4. **Performance** : Les traductions sont chargées à la demande

---

## 📚 Ressources

- [Documentation next-intl](https://next-intl-docs.vercel.app/)
- [Exemples GitHub](https://github.com/amannn/next-intl/tree/main/examples)

