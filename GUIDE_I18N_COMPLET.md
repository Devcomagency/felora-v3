# 🌍 Guide i18n Complet - Felora V3

## 📊 Comparaison : react-i18next vs next-intl

### ⚠️ **Recommandation : Utiliser `next-intl`**

| Critère | react-i18next | next-intl |
|---------|---------------|-----------|
| **Compatibilité Next.js 15** | ⚠️ Nécessite Pages Router | ✅ Optimisé pour App Router |
| **Performance** | ⚠️ Moins optimisé | ✅ Code splitting automatique |
| **TypeScript** | ⚠️ Support basique | ✅ Support complet avec types |
| **Facilité** | ⚠️ Configuration complexe | ✅ Configuration simple |
| **SEO** | ⚠️ Moins bon | ✅ Excellent (URLs localisées) |
| **Maintenance** | ⚠️ Moins actif | ✅ Très actif (2024) |

**Verdict** : `next-intl` est **beaucoup mieux** pour Next.js 15 App Router.

---

## 🗣️ Langues supportées (10 langues)

### Langues principales (Suisse)
1. **Français (fr)** 🇫🇷 - Langue par défaut
2. **Deutsch (de)** 🇩🇪 - Allemand
3. **Italiano (it)** 🇮🇹 - Italien

### Langues internationales
4. **English (en)** 🇬🇧 - Anglais
5. **Español (es)** 🇪🇸 - Espagnol
6. **Русский (ru)** 🇷🇺 - Russe
7. **العربية (ar)** 🇸🇦 - Arabe (RTL)

### Langues additionnelles (communautés importantes en Suisse)
8. **Português (pt)** 🇵🇹 - Portugais
9. **Türkçe (tr)** 🇹🇷 - Turc
10. **Polski (pl)** 🇵🇱 - Polonais

---

## 🚀 Installation rapide

```bash
# Installer next-intl
pnpm add next-intl

# OU si vous préférez react-i18next (non recommandé)
pnpm add i18next react-i18next next-i18next
```

---

## 📁 Structure des fichiers

```
felora-v3/
├── messages/
│   ├── fr.json  (Français - base)
│   ├── en.json  (Anglais)
│   ├── de.json  (Allemand)
│   ├── it.json  (Italien)
│   ├── es.json  (Espagnol)
│   ├── ru.json  (Russe)
│   ├── ar.json  (Arabe - RTL)
│   ├── pt.json  (Portugais)
│   ├── tr.json  (Turc)
│   └── pl.json  (Polonais)
├── i18n/
│   ├── routing.ts    ✅ (déjà créé)
│   └── request.ts    ✅ (déjà créé)
└── middleware.ts     (à créer)
```

---

## ⚙️ Configuration complète

### 1. Modifier `next.config.js`

```javascript
const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... votre config existante
}

module.exports = withNextIntl(nextConfig)
```

### 2. Créer `middleware.ts` (racine)

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### 3. Adapter `src/app/layout.tsx`

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

## 📝 Exemple de fichiers de traduction

### `messages/fr.json` (Base - Français)

```json
{
  "common": {
    "search": "Rechercher",
    "filters": "Filtres",
    "loading": "Chargement...",
    "error": "Erreur",
    "close": "Fermer",
    "save": "Enregistrer"
  },
  "search": {
    "title": "Recherche",
    "placeholder": "Rechercher par nom, ville...",
    "profiles": "Profils",
    "noResults": "Aucun résultat trouvé",
    "results": "{count} résultats"
  }
}
```

### `messages/ar.json` (Arabe - RTL)

```json
{
  "common": {
    "search": "بحث",
    "filters": "مرشحات",
    "loading": "جاري التحميل...",
    "error": "خطأ",
    "close": "إغلاق",
    "save": "حفظ"
  },
  "search": {
    "title": "بحث",
    "placeholder": "البحث بالاسم، المدينة...",
    "profiles": "الملفات الشخصية",
    "noResults": "لم يتم العثور على نتائج",
    "results": "{count} نتائج"
  }
}
```

### `messages/ru.json` (Russe)

```json
{
  "common": {
    "search": "Поиск",
    "filters": "Фильтры",
    "loading": "Загрузка...",
    "error": "Ошибка",
    "close": "Закрыть",
    "save": "Сохранить"
  },
  "search": {
    "title": "Поиск",
    "placeholder": "Поиск по имени, городу...",
    "profiles": "Профили",
    "noResults": "Результаты не найдены",
    "results": "{count} результатов"
  }
}
```

---

## 🎨 Sélecteur de langue amélioré

```typescript
// src/components/layout/LanguageSwitcher.tsx
'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { languageMetadata } from '@/i18n/routing'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
    // Sauvegarder la préférence
    localStorage.setItem('felora-language', newLocale)
  }

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white"
      >
        {Object.entries(languageMetadata).map(([code, meta]) => (
          <option key={code} value={code} className="bg-gray-900 text-white">
            {meta.flag} {meta.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

---

## 🔄 Migration depuis react-i18next (si nécessaire)

Si vous avez déjà du code avec `react-i18next`, voici comment migrer :

### Avant (react-i18next)
```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation('common')
  return <p>{t('welcome')}</p>
}
```

### Après (next-intl)
```typescript
import { useTranslations } from 'next-intl'

function Component() {
  const t = useTranslations('common')
  return <p>{t('welcome')}</p>
}
```

**C'est presque identique !** La migration est simple.

---

## ✅ Checklist d'implémentation

- [ ] Installer `next-intl`
- [ ] Créer les 10 fichiers JSON dans `messages/`
- [ ] Configurer `next.config.js`
- [ ] Créer `middleware.ts`
- [ ] Adapter `layout.tsx`
- [ ] Créer `app/[locale]/layout.tsx`
- [ ] Déplacer les pages dans `app/[locale]/`
- [ ] Remplacer les textes hardcodés
- [ ] Tester toutes les langues
- [ ] Tester le RTL pour l'arabe

---

## 🎯 Priorités de traduction

### Phase 1 (Essentiel)
1. Navigation principale
2. Pages de recherche
3. Messages d'erreur
4. Formulaires de base

### Phase 2 (Important)
5. Profils utilisateurs
6. Messagerie
7. Paramètres
8. Dashboard

### Phase 3 (Complémentaire)
9. Aide et FAQ
10. Notifications
11. Emails

---

## 💡 Astuces

1. **Traduction automatique** : Utiliser Google Translate API ou DeepL pour une première version
2. **Relecture** : Toujours faire relire par un natif
3. **Pluriels** : next-intl gère automatiquement les pluriels
4. **Dates** : Utiliser `date-fns` avec locales
5. **RTL** : Tester l'arabe sur mobile et desktop

---

## 📚 Ressources

- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [Google Translate API](https://cloud.google.com/translate)
- [DeepL API](https://www.deepl.com/pro-api)






