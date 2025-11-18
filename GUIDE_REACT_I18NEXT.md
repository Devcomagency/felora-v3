# 🌍 Guide react-i18next (Alternative)

## ⚠️ Note importante

**`react-i18next` fonctionne mais est moins optimal pour Next.js 15 App Router.**

Si vous avez déjà `react-i18next-master` dans vos téléchargements et voulez l'utiliser, voici comment faire.

---

## 📦 Installation

```bash
pnpm add i18next react-i18next next-i18next
```

---

## ⚙️ Configuration

### 1. Créer `next-i18next.config.js` (racine)

```javascript
module.exports = {
  i18n: {
    locales: ['fr', 'en', 'de', 'it', 'es', 'ru', 'ar', 'pt', 'tr', 'pl'],
    defaultLocale: 'fr',
    localeDetection: true
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development'
}
```

### 2. Structure des fichiers

```
public/
└── locales/
    ├── fr/
    │   └── common.json
    ├── en/
    │   └── common.json
    ├── de/
    │   └── common.json
    ├── it/
    │   └── common.json
    ├── es/
    │   └── common.json
    ├── ru/
    │   └── common.json
    ├── ar/
    │   └── common.json
    ├── pt/
    │   └── common.json
    ├── tr/
    │   └── common.json
    └── pl/
        └── common.json
```

### 3. Modifier `next.config.js`

```javascript
const { i18n } = require('./next-i18next.config')

const nextConfig = {
  i18n,
  // ... reste de votre config
}

module.exports = nextConfig
```

### 4. Créer `src/pages/_app.tsx` (Pages Router requis)

```typescript
import { appWithTranslation } from 'next-i18next'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default appWithTranslation(MyApp)
```

⚠️ **Problème** : Next.js 15 utilise App Router, pas Pages Router. `react-i18next` nécessite Pages Router.

---

## 🚨 Problème majeur

**`react-i18next` avec `next-i18next` ne fonctionne PAS avec App Router !**

Vous devriez :
1. ✅ **Utiliser `next-intl`** (recommandé - fonctionne avec App Router)
2. ❌ **OU** migrer vers Pages Router (pas recommandé - perte de fonctionnalités)

---

## 💡 Solution : Utiliser next-intl (recommandé)

J'ai déjà configuré `next-intl` pour vous avec **10 langues** :
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇩🇪 Allemand
- 🇮🇹 Italien
- 🇪🇸 Espagnol
- 🇷🇺 **Russe** (ajouté)
- 🇸🇦 **Arabe** (ajouté - RTL)
- 🇵🇹 **Portugais** (ajouté)
- 🇹🇷 **Turc** (ajouté)
- 🇵🇱 **Polonais** (ajouté)

**C'est prêt à utiliser !** Il suffit d'installer `next-intl` et suivre le guide.

---

## 🎯 Recommandation finale

**Utilisez `next-intl`** car :
- ✅ Compatible App Router
- ✅ Plus simple
- ✅ Meilleure performance
- ✅ Meilleur SEO
- ✅ Configuration déjà faite

Si vous voulez vraiment `react-i18next`, il faudra :
- ❌ Migrer vers Pages Router (énorme refonte)
- ❌ Perdre des fonctionnalités App Router
- ❌ Plus de maintenance



