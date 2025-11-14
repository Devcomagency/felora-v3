# 🌍 I18N Implementation TODO - Felora V3

## ✅ Complété (par Claude)

1. **✅ Installation** - next-intl ajouté au package.json
2. **✅ Configuration i18n** - routing.ts et request.ts déjà créés avec 9 langues
3. **✅ Middleware** - middleware.ts créé à la racine
4. **✅ next.config.js** - Configuré avec withNextIntl plugin

## 📝 À Faire (reste)

### 1. Créer les fichiers de traduction (messages/*.json)

Créer 9 fichiers dans `/messages/` :
- `fr.json` (Français - base)
- `de.json` (Allemand)
- `it.json` (Italien)
- `en.json` (Anglais)
- `es.json` (Espagnol)
- `ru.json` (Russe)
- `ar.json` (Arabe - RTL)
- `pt.json` (Portugais)
- `sq.json` (Albanais)

**Structure de base pour tous** :
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
    "yes": "Oui",
    "no": "Non",
    "delete": "Supprimer",
    "edit": "Modifier",
    "confirm": "Confirmer"
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
    "register": "S'inscrire"
  },
  "auth": {
    "login": "Connexion",
    "register": "Inscription",
    "email": "Email",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublié ?",
    "rememberMe": "Se souvenir de moi",
    "or": "ou",
    "continueWith": "Continuer avec {provider}",
    "alreadyHaveAccount": "Déjà un compte ?",
    "dontHaveAccount": "Pas encore de compte ?"
  },
  "profile": {
    "edit": "Modifier le profil",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "photo": "Photo",
    "name": "Nom",
    "bio": "Biographie",
    "location": "Localisation",
    "language": "Langue",
    "verified": "Vérifié"
  },
  "messages": {
    "title": "Messages",
    "newMessage": "Nouveau message",
    "noMessages": "Aucun message",
    "send": "Envoyer",
    "typing": "En train d'écrire...",
    "online": "En ligne",
    "offline": "Hors ligne"
  },
  "filters": {
    "all": "Tous",
    "category": "Catégorie",
    "city": "Ville",
    "canton": "Canton",
    "sortBy": "Trier par",
    "recent": "Récents",
    "relevance": "Pertinence",
    "distance": "Distance",
    "price": "Prix",
    "clear": "Effacer",
    "apply": "Appliquer"
  },
  "categories": {
    "escort": "Escorte",
    "masseuse": "Masseuse Érotique",
    "dominatrice": "Dominatrice BDSM",
    "transsexuel": "Transsexuel"
  },
  "establishments": {
    "club": "Club",
    "salon": "Salon",
    "studio": "Studio",
    "private": "Privé"
  }
}
```

### 2. Adapter le layout principal

**Fichier** : `src/app/layout.tsx`

Ajouter le provider i18n et la détection de locale.

### 3. Créer app/[locale]/layout.tsx

Créer la structure de dossier avec [locale] pour supporter les URLs multilingues :
```
src/app/[locale]/
├── layout.tsx
├── page.tsx
├── search/
│   └── page.tsx
├── map/
│   └── page.tsx
└── ...
```

### 4. Déplacer les pages existantes

Déplacer toutes les pages de `src/app/` vers `src/app/[locale]/` :
- `search/page.tsx` → `[locale]/search/page.tsx`
- `map/page.tsx` → `[locale]/map/page.tsx`
- `messages/page.tsx` → `[locale]/messages/page.tsx`
- etc.

### 5. Remplacer les textes hardcodés

Dans chaque composant, remplacer les textes en dur par `useTranslations()` :

**Avant** :
```tsx
<h1>Recherche</h1>
<input placeholder="Rechercher par nom, ville..." />
```

**Après** :
```tsx
'use client'
import { useTranslations } from 'next-intl'

export default function SearchPage() {
  const t = useTranslations('search')

  return (
    <>
      <h1>{t('title')}</h1>
      <input placeholder={t('placeholder')} />
    </>
  )
}
```

### 6. Adapter StaticNavBar

**Fichier** : `src/components/layout/StaticNavBar.tsx`

Ajouter un sélecteur de langue avec les 9 langues :

```tsx
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
    <nav>
      {/* Navigation existante */}
      <Link href="/">{t('home')}</Link>
      <Link href="/search">{t('search')}</Link>

      {/* Sélecteur de langue */}
      <select value={locale} onChange={(e) => handleLanguageChange(e.target.value)}>
        {Object.entries(languageMetadata).map(([code, meta]) => (
          <option key={code} value={code}>
            {meta.flag} {meta.label}
          </option>
        ))}
      </select>
    </nav>
  )
}
```

### 7. Tester

Pour chaque langue :
- ✅ Navigation fonctionne (/fr/search, /de/search, /en/search, etc.)
- ✅ Sélecteur de langue change l'URL et les traductions
- ✅ Toutes les clés de traduction sont définies
- ✅ Pas d'erreurs dans la console
- ✅ RTL fonctionne pour l'arabe (ar)

## 📚 Ressources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Guide d'implémentation complet](./GUIDE_I18N_IMPLEMENTATION.md)
- [Traductions i18n/routing.ts](./i18n/routing.ts)

## 🎯 Prochaines étapes recommandées

1. **Installer next-intl** : `npm install` (déjà ajouté au package.json)
2. **Créer les fichiers de traduction** (9 fichiers JSON)
3. **Adapter le layout** avec NextIntlClientProvider
4. **Créer [locale]/layout.tsx**
5. **Déplacer les pages** dans [locale]/
6. **Remplacer les textes** avec useTranslations()
7. **Ajouter le sélecteur** de langue dans la nav
8. **Tester** toutes les langues

---

**Note** : Les fichiers `i18n/routing.ts` et `i18n/request.ts` sont déjà configurés avec les 9 langues :
- 🇫🇷 Français (fr) - défaut
- 🇩🇪 Allemand (de)
- 🇮🇹 Italien (it)
- 🇬🇧 Anglais (en)
- 🇪🇸 Espagnol (es)
- 🇷🇺 Russe (ru)
- 🇸🇦 Arabe (ar) - RTL
- 🇵🇹 Portugais (pt)
- 🇦🇱 Albanais (sq)
