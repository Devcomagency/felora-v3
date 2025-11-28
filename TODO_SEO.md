# ✅ TODO SEO - FELORA

**Score Actuel** : 82/100 🟡 → **Cible** : 98/100 🟢

---

## 🔴 PRIORITÉ 1 : IMAGES (2-3h) - AVANT PROD

### Fichier 1 : `packages/ui/profile-test/ProfileHeader.tsx`
- [ ] Importer `next/image`
- [ ] Remplacer `<img>` avatar par `<Image>`
- [ ] Ajouter `priority={true}` (image hero)
- [ ] Alt text : `Portrait de ${name}, ${age} ans — ${city}`

**Exemple** :
```tsx
import Image from 'next/image'

<Image
  src={avatar}
  alt={`Portrait de ${name}, ${age} ans — ${city}`}
  width={400}
  height={600}
  priority
  className="rounded-3xl"
/>
```

---

### Fichier 2 : `packages/ui/profile-test/MediaFeedWithGallery.tsx`
- [ ] Importer `next/image`
- [ ] Remplacer tous les `<img>` par `<Image>`
- [ ] Lazy loading sur toutes les images (sauf 4 premières)
- [ ] Alt text : `Photo ${index + 1} de ${profileName}`

**Exemple** :
```tsx
{media.map((item, index) => (
  <Image
    key={index}
    src={item.url}
    alt={`Photo ${index + 1} de ${profileName}`}
    width={400}
    height={600}
    loading={index < 4 ? undefined : 'lazy'}
    priority={index < 4}
  />
))}
```

---

### Fichier 3 : `src/components/search/EscortCard2025.tsx`
- [ ] Importer `next/image`
- [ ] Remplacer `<img>` par `<Image>`
- [ ] Priority sur les 4 premières cards
- [ ] Alt text : `${escort.name}, ${escort.age} ans — ${escort.city}`

---

### Fichier 4 : `src/components/search/ClubCard.tsx`
- [ ] Importer `next/image`
- [ ] Remplacer `<img>` par `<Image>`
- [ ] Lazy loading
- [ ] Alt text : `${club.name} — ${club.city}`

---

## 🟠 PRIORITÉ 2 : ALT TEXT (1-2h) - AVANT PROD

### Vérification Automatique
```bash
# Détecter les images sans alt
npm run seo:validate
```

### Règles Alt Text
- **Format** : `[Sujet] — [Contexte] — [Détails]`
- **Longueur** : 80-125 caractères
- **Mots-clés** : Inclure naturellement
- **Vide uniquement** si image décorative (`alt=""`)

**Exemples** :
```tsx
// ❌ Mauvais
alt="img"
alt="photo"
alt=""  // sauf si décoratif

// ✅ Bon
alt="Portrait de Sofia, 25 ans, escort premium à Genève"
alt="Photo de profil vérifiée de Sofia en robe de soirée élégante"
alt="Club Luxe Geneva — Salon premium au cœur de Genève"
```

---

## 🟡 PRIORITÉ 3 : H1 UNIQUE (1h) - AVANT PROD

### Pages à Vérifier
- [ ] `src/app/page.tsx` (homepage)
- [ ] `src/app/search/page.tsx`
- [ ] `src/app/map/page.tsx`
- [ ] `src/app/profiles/page.tsx`
- [ ] `src/app/clubs/page.tsx`

### Règles H1
- **Un seul h1 par page**
- **Descriptif et concis**
- **Inclure mots-clés principaux**

**Exemples** :
```tsx
// Homepage
<h1>Découvrez Felora — Plateforme Premium Suisse</h1>

// Search
<h1>Recherche de Profils et Clubs Premium</h1>

// Map
<h1>Carte Interactive — Profils Géolocalisés</h1>

// Profiles
<h1>Tous les Profils Vérifiés</h1>

// Clubs
<h1>Clubs & Salons Premium en Suisse</h1>
```

---

## 🟢 OPTIONNEL (POST-PROD)

### 1. Sitemap Dynamique (30min)
**Fichier** : `src/app/sitemap.ts`

```typescript
// Ajouter profils dynamiques
const profiles = await prisma.user.findMany({
  where: { verified: true, suspended: false },
  select: { id: true, handle: true, updatedAt: true },
  take: 1000,
})

const profileRoutes = profiles.map(profile => ({
  url: `${host}/profile/${profile.handle || profile.id}`,
  lastModified: profile.updatedAt,
  changeFrequency: 'weekly' as const,
  priority: 0.7,
}))
```

---

### 2. Schema.org Profils (1h)
**Fichier** : `src/app/profile/[id]/page.tsx`

```typescript
import { PersonSchema } from '@/components/seo/StructuredData'

<PersonSchema
  name={profile.name}
  description={profile.description}
  url={`https://felora.ch/profile/${profile.id}`}
  image={profile.avatar}
  address={{
    addressLocality: profile.city,
    addressCountry: 'CH'
  }}
  knowsLanguage={profile.languages}
/>
```

---

### 3. Schema.org Clubs (1h)
**Fichier** : `src/app/clubs/page.tsx`

```typescript
import { LocalBusinessSchema } from '@/components/seo/StructuredData'

<LocalBusinessSchema
  name={club.name}
  description={club.description}
  url={`https://felora.ch/profile/${club.id}`}
  address={{
    streetAddress: club.address,
    addressLocality: club.city,
    addressCountry: 'CH'
  }}
  priceRange="CHF 200-500"
/>
```

---

## 📊 VALIDATION

### Avant Déploiement
```bash
# Valider SEO
npm run seo:validate

# Vérifier types
npm run typecheck

# Build production
npm run build
```

### Après Déploiement
- [ ] Test Lighthouse (Chrome DevTools)
- [ ] PageSpeed Insights : https://pagespeed.web.dev/
- [ ] Rich Results Test : https://search.google.com/test/rich-results
- [ ] Schema Validator : https://validator.schema.org/

### Configuration Post-Prod
- [ ] Soumettre sitemap à Google Search Console
- [ ] Soumettre sitemap à Bing Webmaster
- [ ] Vérifier indexation après 48h
- [ ] Surveiller Core Web Vitals

---

## 🎯 OBJECTIFS

| Métrique | Avant | Actuel | Cible |
|----------|-------|--------|-------|
| **Score SEO** | 35/100 🔴 | 82/100 🟡 | 98/100 🟢 |
| **LCP** | ~4s | ~3s | <2.5s |
| **Lighthouse** | 60/100 | 75/100 | >90/100 |
| **Images optimisées** | 0% | 0% | 100% |
| **Alt text** | 20% | 20% | 100% |

---

## 📚 RESSOURCES

- **Guide complet** : `docs/SEO_COMPLETE_GUIDE.md`
- **Guide images** : `docs/SEO_IMAGE_OPTIMIZATION.md`
- **Audit final** : `docs/SEO_AUDIT_FINAL.md`
- **Composants SEO** : `src/components/seo/StructuredData.tsx`

---

**⏰ Temps Total Estimé** : 4-6 heures
**🎯 Impact** : Score SEO 82/100 → 98/100 (+16 points)
