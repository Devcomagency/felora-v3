# FELORA V3 — Guide de contributions UI (Cursor)

Objectif: intégrer le design/UX V2 dans V3 sans risque prod. UI uniquement, derrière des flags, avec PRs petites et vérifiables.

## 1) Scope & Garde‑fous
- Interdits: pas de modifications sous `src/app/api/**`, `src/lib/**`, `next.config.js`, `.env*`.
- Flags obligatoires: nouvelles vues activées via `NEXT_PUBLIC_FEATURE_UI_*` + canary (`document.cookie = 'canary=1; path=/'`).
- Dépendances: aucune nouvelle dépendance sans validation.
- Réutilisation: privilégier `packages/ui/**`; éviter les duplications dans `src/ui/**`.

## 2) Règles PR
- Unité: 1 PR = 1 page (ou 1 onglet dashboard).
- Taille: ≤ 30 fichiers modifiés; pas d’assets inutilisés.
- Preuves: screenshots avant/après (+ courte vidéo scroll/states).
- Accessibilité/Perf: pas de régression Lighthouse; focus/contraste/zones clic OK.

## 3) Lots de migration

### Lot 1 — Public (priorité)
- Profil public (`/profile/[id]`): porter la UI « profile test » vers la vraie route, derrière `NEXT_PUBLIC_FEATURE_UI_PROFILE`. Aucune modif data‑fetching.
- Search (`/search`): harmoniser filtres/empty states, tokens `felora-*`.
- Liste de profils (`/profiles`): cartes, hover, pagination visuelle.

### Lot 2 — Messages
- Conversation + liste (`/messages`): bulles, composer, pièces jointes. Ne pas toucher hooks/WS; UI uniquement.

### Lot 3 — Escort Dashboard
- Onglets: Profil, Médias, Statistiques, Paramètres, Activité (1 PR par onglet). Layouts/tables/cards V2; conserver actions existantes.

### Lot 4 — Club / Admin
- Club: unifier `(dashboard)/club/**` et `club/**` (choisir canon visuel); l’autre sera retiré ultérieurement.
- Admin: Comments/KYC/Reports — tables, filtres, états; pas d’API.

### Map & Marketplace (après 1–4)
- Map: corriger uniquement UI/layout de la page; les fixes TypeScript de packages seront traités séparément.
- Marketplace cadeaux: rester dans `marketplace-test/*` (canary); pas de route prod tant que la gouvernance wallet n’est pas validée.

## 4) Exigences transverses
- Lib UI: ne créer que les composants réellement utilisés par le lot; supprimer le reste en fin de lot.
- Assets: fournir la liste des domaines/images à whitelister (sera traité dans `next.config.js`).
- Flags doc: mentionner l’usage de `NEXT_PUBLIC_FEATURE_UI_HOME`/`NEXT_PUBLIC_FEATURE_UI_PROFILE` dans chaque PR.
- Routes test: toute nouvelle route de test doit être sous `profile-test/*` ou `marketplace-test/*` (protégées canary).

## 5) Critères d’acceptation (chaque PR)
- Visuel: parité V2 (sections, spacing, états). Captures fournies.
- Fonctionnel: aucune erreur console; navigation/scroll/hover OK.
- Perf: pas de régression Lighthouse notable.
- Sécurité: pas d’accès public non flaggé aux pages de test.
- Diff propre: pas de fichiers backend/config; ≤ 30 fichiers; pas de composants morts.

## 6) Activation en prod (responsable: Codex/DevOps)
- Déploiement avec flags désactivés par défaut.
- Canary ciblé (cookie `canary=1`) pour validation en prod.
- Activation progressive via `NEXT_PUBLIC_FEATURE_UI_*` après validation.

