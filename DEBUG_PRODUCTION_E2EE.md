# 🐛 Debug Production E2EE - Médias Indisponibles

**Date** : 14 octobre 2025  
**Statut** : ✅ **RÉSOLU**

---

## 🔴 Problème Initial

Les médias E2EE s'envoyaient correctement en production mais affichaient **"Média indisponible"** lors de l'ouverture.

### Symptômes
- ✅ Upload réussi
- ✅ Message envoyé avec pièce jointe
- ❌ Affichage du média = erreur "Média indisponible"

---

## 🔍 Cause Racine

### 1. **Client passait seulement le filename**
```typescript
// ❌ AVANT (E2EEThread.tsx ligne 774-776)
const safePath = urlObj.pathname.split('/').pop() || ''
const resp = await fetch(`/api/e2ee/attachments/get?path=${safePath}...`)
// Résultat: path = "file.bin"
```

### 2. **Serveur attendait l'URL complète pour R2**
```typescript
// Route API /api/e2ee/attachments/get
if (path.startsWith('http://') || path.startsWith('https://')) {
  const response = await fetch(path) // ❌ Ne recevait jamais l'URL complète
  ...
}
```

### 3. **Bucket R2 privé → URLs statiques ne fonctionnent pas**
```typescript
// ❌ AVANT (storage.ts)
const cdnUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${key}`
// URLs non-signées → 403 Forbidden sur bucket privé
```

---

## ✅ Solutions Appliquées

### **Commit** : `83dbd36`
### **Message** : "fix(e2ee): correction accès médias R2 en production avec URLs signées"

### 1. **Client - Passer l'URL complète** 
**Fichier** : `src/components/chat/E2EEThread.tsx`
```typescript
// ✅ APRÈS (ligne 774-776)
const attachmentUrl = String(env.attachmentUrl)
const resp = await fetch(`/api/e2ee/attachments/get?path=${encodeURIComponent(attachmentUrl)}...`)
// Résultat: path = "https://r2.cloudflarestorage.com/bucket/e2ee/file.bin?signature=..."
```

### 2. **Serveur - Meilleure gestion erreurs R2**
**Fichier** : `src/app/api/e2ee/attachments/get/route.ts`
```typescript
// ✅ APRÈS (ligne 54-80)
if (path.startsWith('http://') || path.startsWith('https://')) {
  console.log('[E2EE GET] Fetching from R2:', path.substring(0, 80))
  try {
    const response = await fetch(path)
    if (!response.ok) {
      console.error('[E2EE GET] R2 fetch failed:', response.status, response.statusText)
      return NextResponse.json({ error: `Fichier introuvable sur R2 (${response.status})` }, { status: 404 })
    }
    const buffer = await response.arrayBuffer()
    console.log('[E2EE GET] ✅ Fichier récupéré depuis R2:', buffer.byteLength, 'bytes')
    return new Response(buffer, { ... })
  } catch (error) {
    console.error('[E2EE GET] Erreur fetch R2:', error)
    return NextResponse.json({ error: `Erreur lors du fetch R2: ${error.message}` }, { status: 500 })
  }
}
```

### 3. **Storage - URLs signées (presigned)**
**Fichier** : `src/lib/storage.ts`
```typescript
// ✅ APRÈS (ligne 233-286)
private async uploadE2EEToR2(buffer: Buffer, filename: string): Promise<UploadResult> {
  const { S3Client, PutObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  
  // Upload vers R2
  await s3.send(new PutObjectCommand({ Bucket, Key, Body: buffer, ... }))
  
  // ✨ Générer URL signée valide 7 jours
  const signedUrl = await getSignedUrl(
    s3 as any, 
    new GetObjectCommand({ Bucket: bucketName, Key: key }) as any, 
    { expiresIn: 60 * 60 * 24 * 7 } // 7 jours
  )
  
  return { url: signedUrl, success: true, key }
}
```

---

## 🎯 Résultats

### ✅ Tests Réussis
- ✅ Build Vercel passe
- ✅ Déploiement production OK
- ✅ Upload de médias E2EE fonctionnel
- ✅ Téléchargement et déchiffrement OK
- ✅ Affichage des médias en production

### 🔐 Sécurité Améliorée
- URLs signées temporaires (7 jours)
- Bucket R2 reste privé
- Authentification requise pour accéder aux médias
- Logs détaillés pour monitoring production

### 📊 Performance
- URLs signées avec cache 1 an (fichiers chiffrés immuables)
- Déchiffrement en parallèle (max 3 médias simultanés)
- Fallback local pour développement

---

## 📝 Commits Associés

1. **`73af102`** - `fix(build): ajout .npmrc pour résoudre conflits peer dependencies Vercel`
2. **`d08c43f`** - `fix(build): ajout styled-components pour dépendance @sanity/ui`
3. **`83dbd36`** - `fix(e2ee): correction accès médias R2 en production avec URLs signées`

---

## 🚀 Déploiement

**Branche** : `main`  
**Environnement** : Production (Vercel)  
**Status** : ✅ **LIVE et FONCTIONNEL**

---

## 💡 Leçons Apprises

1. **Buckets R2 privés** nécessitent des URLs signées (presigned URLs)
2. **Toujours passer les URLs complètes** entre client/serveur pour l'upload cloud
3. **Logs détaillés en production** sont essentiels pour déboguer rapidement
4. **Cache agressif** (1 an) pour fichiers chiffrés immuables = performance optimale
5. **Expiration 7 jours** pour URLs signées = bon compromis sécurité/UX

---

**Auteur** : AI Assistant  
**Validé par** : Nordine  
**Date de résolution** : 14 octobre 2025 18:30

