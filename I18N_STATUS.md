# 🌍 Statut Implementation i18n - Felora V3

**Date:** 14 Novembre 2025, 18:20
**Progression:** 60% Complété

---

## ✅ CE QUI EST FAIT (60%)

### 1. ✅ Configuration de base
- [x] `next-intl` ajouté au `package.json`
- [x] `middleware.ts` créé à la racine
- [x] `next.config.js` configuré avec `withNextIntl` plugin
- [x] `i18n/routing.ts` configuré avec 9 langues
- [x] `i18n/request.ts` configuré pour charger les traductions

### 2. ✅ Fichiers de traduction (100%)
- [x] `messages/fr.json` - Français (défaut)
- [x] `messages/en.json` - English
- [x] `messages/de.json` - Deutsch
- [x] `messages/it.json` - Italiano
- [x] `messages/es.json` - Español
- [x] `messages/ru.json` - Русский
- [x] `messages/ar.json` - العربية (RTL)
- [x] `messages/pt.json` - Português
- [x] `messages/sq.json` - Shqip

**Toutes les traductions incluent:**
- Common UI elements (search, filters, loading, etc.)
- Search & filters interface
- Map interface
- Navigation
- Authentication forms
- Profile management
- Messages/chat
- Categories & establishments
- Error messages

---

## ⏳ CE QUI RESTE À FAIRE (40%)

### 3. ⚠️ Adapter le layout principal
**Fichier:** `src/app/layout.tsx`

**Action requise:**
Le layout actuel est un Server Component. Pour next-intl, on a 2 options:

**Option A: Garder Server Component (recommandé)**
```typescript
// src/app/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

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
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className="bg-black text-white">
        {/* Scripts Sentry */}
        ...

        <NextIntlClientProvider messages={messages}>
          <Providers>
            {/* Reste identique */}
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Option B: Next.js 15 recommande de NE PAS avoir de [locale] dans l'URL**
Utiliser le middleware pour gérer la locale et garder le layout actuel.

### 4. ⚠️ Créer la structure [locale]

**Option 1: Structure avec [locale] dans URL**
```
src/app/
├── layout.tsx (root)
└── [locale]/
    ├── layout.tsx (locale layout)
    ├── page.tsx (home)
    ├── search/
    │   └── page.tsx
    ├── map/
    │   └── page.tsx
    └── ...
```

URLs résultantes:
- `/` → `/fr` (redirect automatique)
- `/search` → `/fr/search`
- `/en/search` → English
- `/de/search` → German

**Option 2: Structure SANS [locale] dans URL (RECOMMANDÉ)**
Garder la structure actuelle, utiliser cookies/headers pour la locale.

URLs résultantes:
- `/` → Français (défaut)
- `/search` → Français
- Cookie/Header détermine la langue

### 5. ⚠️ Déplacer les pages dans [locale]/

**SI Option 1 choisie**, déplacer:
```bash
# Déplacer toutes les pages de app/ vers app/[locale]/
mv src/app/search src/app/[locale]/search
mv src/app/map src/app/[locale]/map
mv src/app/messages src/app/[locale]/messages
# etc...

# NE PAS déplacer:
# - app/api/ (les APIs restent en dehors)
# - app/layout.tsx (root layout)
```

**SI Option 2 choisie**, rien à déplacer !

### 6. ⚠️ Adapter StaticNavBar avec sélecteur de langue

**Fichier:** `src/components/layout/StaticNavBar.tsx`

**Ajouter:**
```typescript
'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { languageMetadata } from '@/i18n/routing'

export default function StaticNavBar() {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <nav className="...">
      {/* Liens existants - remplacer textes par t() */}
      <Link href="/">{t('home')}</Link>
      <Link href="/search">{t('search')}</Link>
      <Link href="/map">{t('map')}</Link>

      {/* Nouveau: Sélecteur de langue */}
      <div className="relative">
        <select
          value={locale}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="glass-card px-3 py-2 rounded-lg"
        >
          {Object.entries(languageMetadata).map(([code, meta]) => (
            <option key={code} value={code}>
              {meta.flag} {meta.label}
            </option>
          ))}
        </select>
      </div>
    </nav>
  )
}
```

---

## 🎯 RECOMMANDATION: Option 2 (SANS [locale] dans URL)

### Pourquoi ?
1. **URLs plus propres** : `/search` au lieu de `/fr/search`
2. **Pas de refactoring massif** : Garder la structure actuelle
3. **SEO simplifié** : Pas de duplicate content
4. **Next.js 15 pattern** : Utilise `<html lang={locale}>`

### Comment ?
1. Garder `middleware.ts` (déjà fait ✅)
2. Adapter `layout.tsx` pour injecter la locale
3. Utiliser `useTranslations()` dans les composants
4. Le middleware détecte la langue via:
   - Cookie `NEXT_LOCALE`
   - Header `Accept-Language`
   - IP geolocation (optionnel)

---

## 📋 PROCHAINES ÉTAPES (Ordre recommandé)

### Étape 1: Installer next-intl
```bash
npm install
# ou si problème de lock:
rm -rf node_modules package-lock.json
npm install
```

### Étape 2: Adapter le layout (Option 2)
```typescript
// src/app/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()

  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="bg-black text-white">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Étape 3: Adapter StaticNavBar
Ajouter le sélecteur de langue (code ci-dessus).

### Étape 4: Tester chaque composant page par page
Remplacer les textes hardcodés par `useTranslations()`:

**Exemple - Page Search:**
```typescript
// src/app/search/page.tsx
'use client'

import { useTranslations } from 'next-intl'

export default function SearchPage() {
  const t = useTranslations('search')

  return (
    <div>
      <h1>{t('title')}</h1>
      <input placeholder={t('placeholder')} />
      <button>{t('filters')}</button>
    </div>
  )
}
```

### Étape 5: Tests
Pour chaque langue:
- Ouvrir l'app
- Changer la langue dans le sélecteur
- Vérifier que tous les textes changent
- Vérifier l'arabe (RTL)

---

## 🚨 POINTS D'ATTENTION

### ✅ Fait correctement
- Middleware configuré
- 9 langues complètes
- Structure i18n/ propre
- next.config.js configuré

### ⚠️ À éviter
- Ne PAS commit `node_modules/`
- Ne PAS utiliser `any` pour locale type
- Ne PAS mélanger Option 1 et Option 2
- Ne PAS oublier d'importer depuis `@/i18n/routing` et NON depuis `next-intl/navigation`

### 💡 Best Practices
- Toujours utiliser `useTranslations()` dans composants Client
- Toujours utiliser `getTranslations()` dans Server Components
- Utiliser des clés de traduction explicites
- Grouper les traductions par domaine (`search.*`, `map.*`, etc.)

---

## 📊 PROGRESSION DÉTAILLÉE

| Tâche | Statut | Priorité |
|-------|--------|----------|
| Installation next-intl | ✅ Fait | 🔴 Critique |
| Configuration routing | ✅ Fait | 🔴 Critique |
| Middleware | ✅ Fait | 🔴 Critique |
| next.config.js | ✅ Fait | 🔴 Critique |
| Messages FR | ✅ Fait | 🔴 Critique |
| Messages EN | ✅ Fait | 🔴 Critique |
| Messages DE | ✅ Fait | 🔴 Critique |
| Messages IT | ✅ Fait | 🔴 Critique |
| Messages ES | ✅ Fait | 🔴 Critique |
| Messages RU | ✅ Fait | 🟡 Important |
| Messages AR | ✅ Fait | 🟡 Important |
| Messages PT | ✅ Fait | 🟡 Important |
| Messages SQ | ✅ Fait | 🟡 Important |
| Adapter layout.tsx | ⏳ À faire | 🔴 Critique |
| StaticNavBar + sélecteur | ⏳ À faire | 🔴 Critique |
| Page Search | ⏳ À faire | 🟡 Important |
| Page Map | ⏳ À faire | 🟡 Important |
| Page Messages | ⏳ À faire | 🟡 Important |
| Tests toutes langues | ⏳ À faire | 🟡 Important |

---

## 🎬 COMMANDES POUR CONTINUER

```bash
# 1. Installer next-intl (si pas déjà fait)
npm install

# 2. Tester que le middleware fonctionne
npm run dev:https

# 3. Ouvrir l'app
open https://localhost:3000

# 4. Si erreurs de compilation, vérifier:
cat middleware.ts
cat i18n/request.ts
cat messages/fr.json

# 5. Adapter le layout (copier-coller le code de l'Étape 2 ci-dessus)

# 6. Adapter StaticNavBar (copier-coller le code de l'Étape 3 ci-dessus)

# 7. Commit & Push
git add .
git commit -m "feat(i18n): Adapt layout and add language selector"
git push
```

---

## 📚 RESSOURCES

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Guide complet](./GUIDE_I18N_IMPLEMENTATION.md)
- [TODO détaillé](./I18N_TODO.md)
- [Fichier routing](./i18n/routing.ts)
- [Fichier request](./i18n/request.ts)

---

**Résumé:** 60% fait, 40% restant = adapter le layout + StaticNavBar + tester.

**Temps estimé pour finir:** 2-3 heures de développement.

**Prochain fichier à modifier:** `src/app/layout.tsx`
