# 📊 Guide Dashboard Analytics Felora

## 🎯 Vue d'ensemble

Le dashboard analytics de Felora fournit des insights complets et temps réel sur les performances de la plateforme sans modifier la base de données existante.

## 🚀 Accès

**URL:** `https://www.felora.ch/admin/analytics`

**Prérequis:**
- Être connecté avec un compte ADMIN
- Rôle user : `ADMIN`

## 📊 Onglets Disponibles

### 1️⃣ Vue d'ensemble

**KPIs Principaux:**
- **Escortes actives** : Nombre d'escortes avec `isActive = true` et `status = ACTIVE`
- **Vues totales** : Somme de toutes les vues de profils actifs
- **Contacts (30j)** : Messages + Custom Orders des 30 derniers jours
- **Revenus (30j)** : Abonnements + Transactions diamonds complétées

**Insights Automatiques:**
Le système détecte automatiquement :
- ✅ Forte croissance des inscriptions (+20%)
- ⚠️ Baisse des inscriptions (-15%)
- 💡 Opportunités géographiques (villes avec forte demande)
- 🚨 Signalements en attente (>5)
- 📊 Profils inactifs (>10 inactifs depuis 60j)
- 💰 Évolution des revenus
- ⭐ Top performers de la semaine

**Vérification KYC:**
- Approuvés (%)
- En attente
- Rejetés

**Alertes Système:**
- Signalements en attente
- Comptes suspendus
- Médias flagués

**Top Performers:**
- 5 escorts avec le plus de vues cette semaine

---

### 2️⃣ Utilisateurs & Croissance

**KPIs:**
- Total utilisateurs (toutes catégories)
- Nouveaux utilisateurs (7j, 30j, 90j)
- Escortes actives + vérifiées
- Utilisateurs actifs (7j) + taux de rétention

**Graphiques:**
- **Croissance quotidienne (30j)** : Area Chart montrant l'évolution Escorts vs Clients
- **Répartition par rôle** : Pie Chart (ESCORT, CLIENT, CLUB, ADMIN)
- **Statuts escortes** : ACTIVE, PENDING, SUSPENDED, BANNED

**Métriques calculées:**
- Taux de croissance mensuel
- Rétention jour 7 et jour 30
- Ratio escorts/clients

---

### 3️⃣ Engagement & Conversion

**KPIs:**
- Vues de profil totales
- Likes totaux (profils + médias)
- Messages (7j, 30j)
- **Taux de conversion** : `(Contacts / Vues) * 100`

**Graphiques:**
- **Engagement quotidien** : Bar Chart Messages + Commandes (30j)
- **Top 10 escorts** : Classement par score d'engagement

**Score d'engagement:**
```typescript
engagementScore = views + (likes * 10) + (reacts * 5)
```

**Métriques:**
- Conversations actives (mises à jour < 7j)
- Taux conversion commandes (paid/total)
- Moyenne vues par profil

---

### 4️⃣ Contenu & Médias

**KPIs:**
- Total médias (images + vidéos)
- Uploads récents (7j, 30j)
- Médias signalés
- **Taux de modération** : `(Traités / Total) * 100`

**Graphiques:**
- **Uploads quotidiens** : Line Chart Images vs Vidéos (30j)
- **Répartition par type** : IMAGE vs VIDEO
- **Répartition par visibilité** : PUBLIC, PREMIUM, PRIVATE

**Modération:**
- Signalements totaux
- Signalements récents (30j)
- Signalements traités vs en attente
- Médias supprimés

**Engagement médias:**
- Total likes sur médias
- Total réactions
- Moyenne likes/média
- Moyenne réacts/média

---

### 5️⃣ Géographie & Tendances

**KPIs:**
- Cantons actifs (avec au moins 1 escort)
- Villes couvertes
- Canton #1 (le plus d'escorts)
- Croissance #1 (canton avec meilleure croissance 30j)

**Graphiques:**
- **Top villes** : Bar Chart horizontal par vues totales

**Opportunités Géographiques:**
Détection automatique des villes avec :
- **Forte demande** : Ratio vues/escort > 100
- **Offre limitée** : < 20 escorts
- **Potentiel élevé** : Classement par ratio

**Exemple:**
```
🎯 Zürich : Opportunité d'expansion
Forte demande (1,245 vues) mais seulement 12 escorts
→ Action : Lancer campagne acquisition ciblée Zürich
```

**Métriques par ville:**
- Nombre d'escorts
- Vues totales
- Vues moyennes par escort
- Croissance 30j (%)

---

## 🔧 Endpoints API

Tous les endpoints nécessitent une authentification ADMIN.

### Overview
```
GET /api/admin/analytics/overview
```

**Retourne:**
```json
{
  "kpis": {
    "activeEscorts": { "value": 127, "change": "+12.5" },
    "totalViews": { "value": 45200, "change": "+8.3" },
    "totalContacts": { "value": 892, "change": "+15.7" },
    "totalRevenue": { "value": 12450, "change": "+22.1", "currency": "CHF" }
  },
  "verification": {
    "approved": 89,
    "pending": 15,
    "rejected": 7,
    "total": 111,
    "approvalRate": "80.2"
  },
  "alerts": {
    "pendingReports": 3,
    "suspendedAccounts": 0,
    "flaggedMedia": 1
  },
  "topPerformers": [
    { "name": "Sofia", "views": 1243 }
  ]
}
```

### Users
```
GET /api/admin/analytics/users
```

**Retourne:**
- `overview`: Total users, nouveaux, actifs, taux croissance
- `byRole`: Répartition ESCORT/CLIENT/CLUB/ADMIN
- `escorts`: Total, actifs, vérifiés, par statut
- `kyc`: Stats vérifications
- `moderation`: Suspendus, bannis
- `retention`: Rétention jour 7 et 30
- `dailyGrowth`: Croissance quotidienne (30j)

### Engagement
```
GET /api/admin/analytics/engagement
```

**Retourne:**
- `overview`: Vues, likes, messages, taux conversion
- `recent`: Activité 7j et 30j
- `conversations`: Total, actives, taux
- `orders`: Total, payées, taux conversion
- `media`: Likes et réactions médias
- `topEscorts`: Top 10 par engagement
- `dailyEngagement`: Messages + commandes quotidiens (30j)

### Content
```
GET /api/admin/analytics/content
```

**Retourne:**
- `overview`: Total médias, uploads, signalements, taux modération
- `byType`: IMAGE vs VIDEO
- `byVisibility`: PUBLIC/PREMIUM/PRIVATE
- `byOwner`: Répartition par owner type
- `engagement`: Likes et réactions
- `reports`: Signalements (total, récents, traités)
- `topMedias`: Top 20 médias par engagement
- `dailyUploads`: Uploads quotidiens (30j)

### Geography
```
GET /api/admin/analytics/geography
```

**Retourne:**
- `overview`: Cantons, villes, top canton, croissance
- `byState`: Escorts par canton
- `byCity`: Escorts par ville avec vues
- `growth`: Croissance par canton (30j)
- `newProfiles`: Nouveaux profils par canton (30j)
- `categoriesByCity`: Distribution catégories (top 5 villes)
- `opportunities`: Villes sous-servies (demande > offre)

### Insights
```
GET /api/admin/analytics/insights
```

**Retourne:**
```json
{
  "insights": [
    {
      "type": "success|warning|opportunity|info|alert",
      "icon": "TrendingUp|AlertTriangle|MapPin|etc",
      "title": "Titre de l'insight",
      "message": "Description détaillée",
      "action": "Action recommandée",
      "data": { /* données associées */ },
      "priority": 10
    }
  ],
  "summary": {
    "total": 7,
    "alerts": 1,
    "warnings": 2,
    "opportunities": 1,
    "success": 3
  }
}
```

---

## 🎨 Design

**Charte graphique Felora:**
- Aurora : `#FF6B9D` (Rose)
- Plasma : `#B794F6` (Violet)
- Quantum : `#4FD1C7` (Turquoise)
- Neon : `#00F5FF` (Cyan)
- Neural : `#7C3AED` (Violet neural)

**Style:**
- Glassmorphism cards
- Bento Grid layout
- Gradients sur tabs actifs
- Animations smooth
- Responsive mobile-first

---

## ⚡ Performance

**Optimisations:**
- Requêtes groupées (groupBy, aggregate)
- Calculs incrémentaux (30j rolling)
- Pas de table historique (calcul à la demande)
- Client-side caching React
- Lazy loading charts (useEffect)

**Temps de réponse estimé:**
- Overview : ~200ms
- Users : ~500ms (30 jours de calculs)
- Engagement : ~400ms
- Content : ~300ms
- Geography : ~350ms
- Insights : ~600ms (analyses multiples)

---

## 🚨 Erreurs Communes

### 401 Unauthorized
**Cause:** Pas connecté ou pas ADMIN
**Solution:** Se connecter avec un compte admin

### 500 Internal Server Error
**Causes possibles:**
1. Base de données non accessible
2. Données manquantes (division par zéro)
3. Erreur dans les calculs de dates

**Debug:**
```bash
# Vérifier les logs serveur
npm run dev

# Tester un endpoint spécifique
curl -H "Cookie: next-auth.session-token=XXX" \
  http://localhost:3000/api/admin/analytics/overview
```

### Graphiques vides
**Cause:** Pas de données dans la période sélectionnée
**Solution:** Ajouter des données de test ou vérifier les filtres de dates

---

## 🔮 Futures Améliorations Possibles

### Phase 2 (Optionnel)
- [ ] Export CSV/PDF des données
- [ ] Filtres de période personnalisés (7j/30j/90j/custom)
- [ ] Comparaison période précédente
- [ ] Alertes email automatiques
- [ ] Webhooks pour insights critiques
- [ ] Dashboard temps réel (WebSocket)

### Phase 3 (Avancé)
- [ ] Tables historiques (DailyAnalytics)
- [ ] Snapshots quotidiens (cron job)
- [ ] Prédictions ML (tendances futures)
- [ ] A/B testing analytics
- [ ] Cohort analysis avancée
- [ ] Custom dashboards per admin

---

## 📚 Documentation Technique

### Stack
- **Frontend:** Next.js 14, React 18, TypeScript
- **Charts:** Recharts 2.x
- **Dates:** date-fns
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js

### Structure Fichiers
```
src/
├── app/
│   ├── admin/
│   │   └── analytics/
│   │       └── page.tsx          # Dashboard UI principal
│   └── api/
│       └── admin/
│           └── analytics/
│               ├── overview/route.ts
│               ├── users/route.ts
│               ├── engagement/route.ts
│               ├── content/route.ts
│               ├── geography/route.ts
│               └── insights/route.ts
└── lib/
    └── prisma.ts                  # Prisma client
```

### Ajout de Nouvelles Métriques

**1. Créer un nouvel endpoint:**
```typescript
// src/app/api/admin/analytics/custom/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vos calculs ici
  const data = await prisma.yourTable.findMany()

  return NextResponse.json({ data })
}
```

**2. Ajouter dans le dashboard:**
```typescript
// Dans page.tsx
const [customData, setCustomData] = useState(null)

useEffect(() => {
  fetch('/api/admin/analytics/custom')
    .then(r => r.json())
    .then(setCustomData)
}, [])
```

---

## 💡 Support

Pour toute question ou problème :
1. Vérifier cette documentation
2. Consulter les logs serveur (`npm run dev`)
3. Tester les endpoints individuellement
4. Vérifier les permissions ADMIN

---

**Créé avec Claude Code**
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>
