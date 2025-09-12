# Sécurité des secrets — Hooks Git et bonnes pratiques

Ce dépôt inclut des hooks Git pour éviter les fuites accidentelles de secrets.

## Activation des hooks (local)

1) Définir le dossier des hooks pour ce repo:
```
git config core.hooksPath scripts/git-hooks
```

2) Vérifier les permissions (déjà appliquées):
```
chmod +x scripts/git-hooks/pre-commit scripts/git-hooks/pre-push
```

## Ce que font les hooks

- `pre-commit`:
  - Bloque tout fichier `.env*` dans l'index (staged)
  - Scanne les lignes ajoutées pour des patterns sensibles courants (DATABASE_URL, NEXTAUTH_SECRET, SMTP_PASS, R2, etc.)

- `pre-push`:
  - Bloque le push si des fichiers `.env*` sont TRACKÉS par Git

Ajuster les patterns: éditez `scripts/git-hooks/pre-commit` (tableau `patterns`) si besoin.

## Bonnes pratiques

- Ne pas commiter de secrets dans le dépôt
- Utiliser `.env` local non versionné (voir `.gitignore`) et `.env.example` pour la documentation
- Déclarer les secrets dans l’hébergeur (Vercel) pour prod/preview
- Séparer secrets “staging/dev” et “prod finals”; rotation avant mise en prod

## Nettoyage si un secret a fuité

- Révoquer la clé/secret côté provider
- Changer la valeur dans l’hébergeur
- Retirer le fichier du dépôt (`git rm --cached`) et amender l’historique si nécessaire (BFG / filter-repo)

