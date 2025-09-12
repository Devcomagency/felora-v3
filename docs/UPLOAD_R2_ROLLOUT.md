# FELORA V3 — Rollout Upload Cloudflare R2 (presign/confirm)

Objectif: activer l’upload de médias >4MB en production via PUT direct sur R2, avec confirmation serveur et rollback simple.

## 1) Variables d’environnement (prod)

Ajouter/valider dans l’env de production:

- `FEATURE_UPLOAD=true` (canary au début)
- `CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`
- `CLOUDFLARE_R2_BUCKET=<bucket-name>`
- `CLOUDFLARE_R2_ACCESS_KEY=...`
- `CLOUDFLARE_R2_SECRET_KEY=...`

Optionnel (mémo): `CLOUDFLARE_R2_ACCOUNT_ID=<account-id>`

## 2) CORS bucket R2

Configurer CORS sur le bucket côté Cloudflare (Dashboard R2 → Bucket → Settings → CORS):

```
[
  {
    "AllowedOrigins": [
      "https://felora-v3.vercel.app",
      "https://*.vercel.app"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD", "OPTIONS"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 300
  }
]
```

Adapter `AllowedOrigins` avec votre domaine de prod.

## 3) Flux côté client (exemple)

```
// 1) Presign
const r1 = await fetch('/api/media/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    size: file.size,
    visibility: 'PUBLIC', // ou PRIVATE / REQUESTABLE
    price: undefined
  })
})
const p = await r1.json()
if (!r1.ok) throw new Error(p.error || 'presign_failed')

// 2) Upload direct vers R2
await fetch(p.presignedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file
})

// 3) Confirm côté serveur
const r3 = await fetch('/api/media/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ uploadId: p.uploadId, key: p.key, actualSize: file.size })
})
const c = await r3.json()
if (!r3.ok) throw new Error(c.error || 'confirm_failed')
// c.mediaId, c.url
```

## 4) Tests canary (prod)

- Activer canary (navigateur): `document.cookie = 'canary=1; path=/; max-age=31536000'`
- Image 1–2MB: presign → PUT → confirm → visible dans la galerie/public
- Vidéo 6–10MB: idem; vérifier lecture et domaine images whitelisted (déjà inclus `*.r2.cloudflarestorage.com`)
- Logs/Sentry: aucun 5xx; temps de PUT raisonnable; `trackUploadEvent` OK

Voir aussi: `docs/PROD_CANARY_TESTS.md` (section upload).

## 5) Rollback

- Mettre `FEATURE_UPLOAD=false` (retour au fallback base64 pour petits fichiers)
- Pas d’impact DB: les entrées non confirmées expirent (UploadSession) et peuvent être purgées.

## 6) FAQ

- Erreur CORS sur PUT: vérifier `AllowedOrigins` et `AllowedHeaders=Content-Type`.
- URL R2 non lisible: on utilise l’endpoint S3 `https://<account>.r2.cloudflarestorage.com/<bucket>/<key>` (déjà supporté par `next/image`).
- Fichiers >10MB: augmenter `MAX_VIDEO_SIZE` au besoin (code presign) + CORS/timeout CDN.

