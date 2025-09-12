# FELORA V3 — Plan de tests canary (prod)

Objectif: valider les parcours critiques en production sans impacter tous les utilisateurs.

## Préparation
- Déployer avec les flags à false par défaut
  - FEATURE_UPLOAD=false
  - FEATURE_CADEAU=false
  - NEXT_PUBLIC_FEATURE_UI_PROFILE=false
  - NEXT_PUBLIC_ENABLE_TEST_PAGES=false
- Activer le mode canary côté navigateur (admin/testeurs):
  ```js
  document.cookie = 'canary=1; path=/; max-age=31536000'
  ```

## 1) Profil ↔ Dashboard (galerie)
- Créer un compte escort (ou se connecter à un compte de test)
- Vérifier Dashboard → Profil affiche stageName/infos cohérents
- Aller sur `/profile/[id]` (flag activé si PR UI profil merge) et valider parité visuelle

## 2) Upload médias (image de 1–2MB)
- Depuis Dashboard → Médias, uploader une image ~1–2MB
- Attendu: succès → apparition dans la liste et dans la galerie publique
- Logs: vérifier l’absence d’erreurs 4xx/5xx; Sentry events upload OK

## 3) Upload vidéo (6–10MB)
- Si R2 configuré: tester 6–10MB via parcours Upload (presign/confirm)
- Attendu: succès; URL R2 accessible; rendu sur profil
- Si R2 non configuré: échec contrôlé (message taille); fallback base64 non utilisé

## 4) Auth/Inscription + Email
- Inscription (parcours v2)
- Attendu: email de vérification reçu (SMTP recommandé); liens fonctionnels
- Vérifier ré-authentification et redirections

## 5) Cadeaux/Wallet (admin only)
- Top-up (admin/canary) d’un petit montant (ex: 100)
- Envoi d’un cadeau à un profil de test
- Attendu: balance décrémentée; event cadeau créé; aucun 5xx

## 6) Search / Map
- Search: filtres (ville/prix/services), empty states, chargements
- Map: affichage basique (si tokens présents), aucune erreur console

## 7) Observabilité
- Sentry: erreurs API 5xx et warnings upload/gifts visibles
- Logs: vérifier taille/type upload, temps de réponse, taux d’erreur bas

## Rollback
- En cas d’anomalie: remettre flags à false; invalider canary (supprimer cookie)
- Revenir au tag baseline v3 si nécessaire

