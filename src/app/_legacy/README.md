# 🗄️ Legacy Pages

Ce dossier contient les anciennes versions de pages qui ne sont plus utilisées en production.

## ⚠️ Important

- **Ces fichiers sont conservés uniquement pour référence historique**
- **Ne pas les déployer en production**
- **Ne pas créer de routes vers ces pages**
- Le préfixe `_` empêche Next.js de générer des routes pour ce dossier

## 📋 Fichiers archivés

| Fichier | Date | Raison |
|---------|------|--------|
| `old-home-page.tsx` | Oct 2024 | Remplacé par nouvelle homepage |
| `page-old.tsx` | Oct 2024 | Ancienne version page d'accueil |
| `admin-media-page-old.tsx` | Sep 2024 | Remplacé par version optimisée |
| `admin-media-page-old-backup.tsx` | Sep 2024 | Backup admin media |
| `profile-page-old.tsx` | - | Ancien système profils |
| `escort-profile-old.tsx` | - | Ancien profil escort |
| `test-media-simple-old.tsx` | Sep 2024 | Page de test média |

## 🗑️ Nettoyage futur

Ces fichiers pourront être supprimés définitivement après :
- 3 mois sans incident en production
- Validation que les nouvelles versions fonctionnent correctement
- Confirmation qu'aucune fonctionnalité importante n'a été perdue

## 📝 Notes

Pour restaurer un fichier :
```bash
git mv src/app/_legacy/filename.tsx src/app/target/filename.tsx
```

Pour supprimer définitivement :
```bash
rm src/app/_legacy/filename.tsx
git add -A && git commit -m "chore: delete legacy file"
```
