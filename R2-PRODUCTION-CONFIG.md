# 🚀 CLOUDFLARE R2 - CONFIGURATION PRODUCTION

## 🔧 Variables Vercel à configurer

### **ÉTAPE 1: Créer Bucket R2**
1. Se connecter à [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Aller dans **R2 Object Storage**
3. Créer un bucket : `felora-media-prod`
4. Noter l'**Account ID** : `abc123def456...`

### **ÉTAPE 2: Générer API Tokens**
1. Dans R2, aller à **Manage R2 API Tokens**  
2. Créer un token avec permissions :
   - **Object Read & Write** sur `felora-media-prod`
   - **Bucket List** (optionnel)
3. Noter :
   - Access Key ID : `f004ba11cafe...`
   - Secret Access Key : `deadbeef1234...`

### **ÉTAPE 3: Configurer CORS**
```json
{
  "AllowedOrigins": [
    "https://felora-v3.vercel.app",
    "https://felora.ch",
    "https://*.vercel.app"
  ],
  "AllowedMethods": ["PUT", "GET", "HEAD", "POST"],
  "AllowedHeaders": [
    "Content-Type",
    "Content-Length",
    "Authorization",
    "x-amz-content-sha256",
    "x-amz-date"
  ],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}
```

### **ÉTAPE 4: Variables Environnement Vercel**

Copier ces variables dans **Vercel Dashboard > Project > Settings > Environment Variables** :

```bash
# === STORAGE R2 ===
STORAGE_PROVIDER=cloudflare-r2
CLOUDFLARE_R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=f004ba11cafe...
CLOUDFLARE_R2_SECRET_KEY=deadbeef1234...  
CLOUDFLARE_R2_BUCKET=felora-media-prod
CLOUDFLARE_R2_ACCOUNT_ID=abc123def456

# === FEATURE FLAGS ===  
FEATURE_UPLOAD=false              # Start disabled
FEATURE_CADEAU=false             # Admin only initially
FEATURE_AUTH_MIDDLEWARE=false    # Gradual activation

# === OBSERVABILITY ===
SENTRY_DSN=https://your-project@sentry.io/123456
SENTRY_ENVIRONMENT=production
```

## ✅ **VALIDATION POST-CONFIG**

### **Test 1: R2 Connectivity**
```bash
curl -X PUT "https://abc123def456.r2.cloudflarestorage.com/felora-media-prod/test.txt" \
  -H "Content-Type: text/plain" \
  -d "Hello R2"
```

### **Test 2: Presign Endpoint** 
```bash
curl -X POST "https://felora-v3.vercel.app/api/media/presign" \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.jpg","contentType":"image/jpeg","size":100000,"visibility":"PUBLIC"}'
```

### **Test 3: Environment Validation**
```bash
# Vérifier les logs Vercel pour :
# ✅ Environment validation passed
# 📊 Environment settings: {"r2Configured": true}
```

## 🚨 **SÉCURITÉ**

### **Access Control**
- ✅ Token R2 limité au bucket `felora-media-prod` uniquement
- ✅ CORS restreint aux domaines Felora
- ✅ Pas d'accès public direct au bucket

### **Monitoring**  
- ✅ Sentry configuré pour tracking uploads
- ✅ Rate limiting actif (20 presign/min)
- ✅ File size validation (10MB max)

## 💰 **COÛTS ESTIMÉS**

```yaml
Cloudflare R2 Pricing:
  Storage: $0.015/GB/month
  Requests: Free up to 1M/month
  Bandwidth: Free egress to internet

Estimation mensuelle:
  10GB storage: $0.15/month
  100K uploads: $0 (under free tier)
  Total: ~$0.15/month (vs AWS S3 ~$0.23)
```

## 📋 **CHECKLIST PRÉ-ACTIVATION**

- [ ] Bucket R2 créé et accessible
- [ ] API tokens générés et testés  
- [ ] CORS policy configurée
- [ ] Variables Vercel déployées
- [ ] Environment validation passe
- [ ] Endpoints presign/confirm répondent
- [ ] Sentry tracking actif
- [ ] Feature flags à false (sécurité)

**✅ Prêt pour activation canary FEATURE_UPLOAD=true à 10%**