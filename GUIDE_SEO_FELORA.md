# 🚀 GUIDE SEO COMPLET - FELORA

## ✅ CORRECTIONS APPLIQUÉES

### 1. **robots.txt public créé** ✅
- Fichier : `/public/robots.txt`
- Autorise l'indexation des pages publiques
- Bloque les pages privées (dashboard, admin, etc.)
- Déclare le sitemap

### 2. **Métadonnées optimisées** ✅
- Titre : "Felora — Escort Suisse Premium | Genève, Zürich, Lausanne"
- Description ciblée avec villes suisses
- 19 mots-clés stratégiques ajoutés
- OpenGraph et Twitter Cards mis à jour

### 3. **Sitemap amélioré** ✅
- Génération dynamique avec Prisma
- Inclusion automatique de tous les profils actifs
- Priorités et fréquences optimisées
- Limite à 1000 escorts + 500 clubs

### 4. **Vérification moteurs de recherche** ✅
- Placeholder pour Google Search Console
- Support Bing et Yandex
- Balises canoniques ajoutées

---

## 📋 ACTIONS À FAIRE MAINTENANT

### 🔴 URGENT : Déployer les changements

```bash
# 1. Commit et push
git add .
git commit -m "🚀 SEO: Optimize metadata, sitemap, robots.txt for Swiss escort keywords"
git push

# 2. Vérifier le déploiement Vercel
# Attendre 2-3 minutes que Vercel déploie
```

### 🔴 CRITIQUE : Google Search Console

#### Étape 1 : Créer compte Google Search Console
1. Aller sur : https://search.google.com/search-console
2. Se connecter avec compte Google
3. Cliquer "Ajouter une propriété"
4. Choisir "Préfixe d'URL" : `https://www.felora.ch`

#### Étape 2 : Vérifier le site
**MÉTHODE RECOMMANDÉE : Balise HTML**
1. Google vous donnera un code comme : `google-site-verification=ABC123XYZ`
2. Copier ce code
3. Ouvrir `src/app/layout.tsx`
4. Remplacer `VOTRE_CODE_GOOGLE_SEARCH_CONSOLE` par le code
5. Commit + push
6. Attendre déploiement (2-3 min)
7. Retourner sur Google Search Console → Cliquer "Vérifier"

#### Étape 3 : Soumettre le sitemap
1. Dans Google Search Console → Menu "Sitemaps"
2. Entrer : `https://www.felora.ch/sitemap.xml`
3. Cliquer "Envoyer"
4. **Délai d'indexation : 1-7 jours**

---

## 🎯 OPTIMISATIONS SEO SUPPLÉMENTAIRES

### 1. **Créer contenu par ville** (Prioritaire)

Créer des pages SEO pour chaque ville suisse majeure :

```
/escort-geneve
/escort-zurich
/escort-lausanne
/escort-berne
/escort-bale
/escort-lugano
```

**Chaque page doit contenir :**
- H1 avec ville : "Escort Premium à Genève"
- 300-500 mots de contenu unique
- Liste des profils de cette ville
- Map centrée sur la ville
- FAQ locale

### 2. **Schema.org - Structured Data**

Ajouter JSON-LD dans les pages profils :

```typescript
// src/app/profile/[id]/page.tsx
export default function ProfilePage({ params }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.stageName,
    "image": profile.profilePhoto,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": profile.city,
      "addressCountry": "CH"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Contenu profil */}
    </>
  )
}
```

### 3. **Optimiser les images**

**Problème actuel :** Images sans attributs alt

**Solution :**
```tsx
// Exemple dans ProfileCard
<Image
  src={profile.photo}
  alt={`Escort ${profile.name} à ${profile.city} - Profil vérifié`}
  width={400}
  height={600}
/>
```

### 4. **Améliorer les URLs**

**Actuellement :** `/profile/cm123abc456` (pas SEO-friendly)

**Recommandation :** `/escort/geneve/sophie-premium` (meilleur pour SEO)

Mais **ATTENTION** : changer URLs = rediriger les anciennes → Complexe

**Solution simple :** Garder URLs actuelles mais ajouter :
```tsx
// Metadata dynamique par profil
export async function generateMetadata({ params }) {
  const profile = await getProfile(params.id)
  return {
    title: `${profile.stageName} — Escort à ${profile.city}`,
    description: `Rencontrez ${profile.stageName}, escort premium vérifiée à ${profile.city}. ${profile.bio?.substring(0, 100)}...`
  }
}
```

### 5. **Créer un blog SEO** (Long terme)

Articles optimisés :
- "Guide escort Genève 2025"
- "Sécurité rencontres premium Suisse"
- "Différence escort indépendante vs salon"
- "Législation escort en Suisse"

**Impact :** +50% trafic organique en 6 mois

---

## 📊 SUIVI ET ANALYTICS

### Google Analytics 4 (GA4)
1. Créer propriété GA4 : https://analytics.google.com
2. Récupérer l'ID de mesure : `G-XXXXXXXXXX`
3. Ajouter dans `.env.local` :
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
4. Installer le tracking (déjà fait avec Umami, à adapter)

### KPIs à suivre
- **Impressions** : Combien de fois le site apparaît dans Google
- **CTR** : % de clics sur vos résultats
- **Position moyenne** : Rang moyen dans les résultats
- **Pages indexées** : Nombre de pages dans Google

**Objectifs 30 jours :**
- 50+ pages indexées
- 1000+ impressions/jour
- Position moyenne < 30 (top 3 pages Google)

**Objectifs 90 jours :**
- 500+ pages indexées
- 5000+ impressions/jour
- Top 10 pour "escort genève", "escort zürich"

---

## 🚨 ERREURS À ÉVITER

### ❌ **Sur-optimisation**
- Ne pas bourrer de mots-clés
- Garder contenu naturel et humain

### ❌ **Duplicate content**
- Chaque profil = description unique
- Pas de copier-coller entre profils

### ❌ **Liens cassés**
- Vérifier tous les liens internes
- Mettre redirections 301 si changements d'URLs

### ❌ **Temps de chargement**
- Optimiser images (WebP, lazy loading)
- Utiliser Next.js Image component partout

---

## 📅 CALENDRIER D'ACTION

### **Semaine 1 (MAINTENANT)**
- [x] Deploy corrections SEO
- [ ] Inscrire Google Search Console
- [ ] Soumettre sitemap
- [ ] Vérifier indexation après 3 jours

### **Semaine 2**
- [ ] Créer pages /escort-geneve, /escort-zurich, /escort-lausanne
- [ ] Ajouter attributs alt à toutes les images
- [ ] Implémenter Schema.org sur profils

### **Semaine 3-4**
- [ ] Créer 3-5 articles de blog SEO
- [ ] Optimiser meta descriptions de toutes les pages
- [ ] Obtenir premiers backlinks (annuaires, forums)

### **Mois 2-3**
- [ ] Analyser positions dans Google Search Console
- [ ] Ajuster stratégie selon résultats
- [ ] Créer contenu supplémentaire pour villes secondaires

---

## 🎯 MOTS-CLÉS STRATÉGIQUES

### **Primaires (concurrence moyenne)**
- escort suisse
- escort genève
- escort zürich
- escort lausanne
- escort premium suisse

### **Secondaires (longue traîne)**
- escort indépendante genève
- escort vip zürich
- escort de luxe lausanne
- call girl suisse romande
- escort suisse alémanique

### **Locaux (faible concurrence)**
- escort berne
- escort bâle
- escort lugano
- escort fribourg
- escort neuchâtel

---

## 💰 BUDGET SEO (Optionnel)

### **Gratuit (DIY)**
- Google Search Console ✅
- Google Analytics ✅
- Bing Webmaster Tools ✅
- **Total : 0 CHF/mois**

### **Basique**
- Ahrefs Lite : $99/mois (analyse concurrence)
- Semrush : €119/mois (suivi positions)
- **Total : ~200 CHF/mois**

### **Pro**
- SEO Consultant : 1000-2000 CHF/mois
- Content Writer : 500-1000 CHF/mois
- **Total : 1500-3000 CHF/mois**

**Recommandation :** Commencer gratuit, puis basique après 3 mois

---

## 📞 SUPPORT

**Questions SEO ?**
- Documentation Next.js SEO : https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Google Search Console Help : https://support.google.com/webmasters

**Problèmes techniques ?**
- Vérifier les logs Vercel
- Tester sitemap : https://www.felora.ch/sitemap.xml
- Valider robots.txt : https://www.felora.ch/robots.txt

---

## ✅ CHECKLIST FINALE

Avant de lancer le SEO, vérifier :

- [x] robots.txt accessible publiquement
- [x] sitemap.xml génère tous les profils
- [x] Métadonnées optimisées avec mots-clés
- [ ] Google Search Console configuré et vérifié
- [ ] Sitemap soumis à Google
- [ ] Toutes les images ont attribut alt
- [ ] Temps de chargement < 3 secondes
- [ ] Version mobile optimisée
- [ ] Pas d'erreurs 404

---

**Dernière mise à jour :** 2025-12-06
**Prochaine révision :** 2026-01-06 (après 30 jours d'indexation)
