# 🖼️ Assets Whitelist - FELORA V3

Liste des domaines d'images et assets à whitelister pour le nouveau design UI.

## 📋 Domaines d'Images Requis

### Images de Test (Picsum)
```
picsum.photos
```

### Vidéos de Test (Google Cloud Storage)
```
commondatastorage.googleapis.com
```

### Images Unsplash (si utilisées)
```
images.unsplash.com
```

### CDN Sanity (si utilisé)
```
cdn.sanity.io
```

### Supabase (si utilisé)
```
*.supabase.co
```

## 🔧 Configuration Next.js

Ajouter ces domaines dans `next.config.ts` :

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'picsum.photos',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'commondatastorage.googleapis.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'cdn.sanity.io',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      port: '',
      pathname: '/**',
    }
  ],
}
```

## 🎨 Assets Statiques Locaux

### Icons (Lucide React)
- ✅ Déjà inclus dans les dépendances
- ✅ Pas de whitelist nécessaire

### Fonts
- ✅ Utilise les fonts système par défaut
- ✅ Pas de whitelist nécessaire

### Lottie Animations (si utilisées)
```
/lottie/*.json
```

## 🚀 Assets de Production

### Cloudflare R2 (si configuré)
```
*.r2.cloudflarestorage.com
```

### AWS S3 (si configuré)
```
*.amazonaws.com
```

## 📝 Notes

1. **Picsum Photos** : Utilisé pour les images de test dans le feed
2. **Google Cloud Storage** : Utilisé pour les vidéos de test
3. **Tous les domaines** : Doivent être ajoutés dans `remotePatterns` de Next.js
4. **Sécurité** : Seuls les domaines listés sont autorisés pour les images externes

## 🔄 Mise à Jour

Cette liste doit être mise à jour si de nouveaux domaines d'images sont ajoutés au design.
