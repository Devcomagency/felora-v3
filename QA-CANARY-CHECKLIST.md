# 🧪 QA & VALIDATION CANARY - PROTOCOLE DE TESTS

## 🎯 **PHASE 1: TESTS UPLOAD (FEATURE_UPLOAD)**

### **✅ Test 1: Upload Image 1MB**
```yaml
Objectif: Valider upload image standard
Procédure:
  1. Connecter utilisateur escort
  2. Upload image 1MB (JPEG)
  3. Vérifier presign → upload → confirm
  4. Vérifier média visible dans galerie
  
Critères succès:
  - Presign retourne URL signée
  - Upload R2 successful (200)
  - Confirm crée record DB
  - Image affichée correctement
  - Sentry event trackUploadEvent présent
```

### **✅ Test 2: Upload Vidéo 6-10MB**
```yaml
Objectif: Valider upload vidéo large
Procédure:
  1. Upload vidéo 8MB (MP4)
  2. Vérifier performance < 30s
  3. Vérifier pas de timeout
  
Critères succès:
  - Upload complète en < 30s
  - Vidéo lisible après upload
  - Thumbnail généré si applicable
  - Pas d'erreur mémoire/timeout
```

### **✅ Test 3: Fallback Base64**
```yaml
Objectif: Tester fallback si R2 indisponible
Procédure:
  1. Temporairement invalider R2_ACCESS_KEY
  2. Upload image 2MB
  3. Vérifier fallback automatique
  4. Restaurer R2_ACCESS_KEY
  
Critères succès:
  - Error handling gracieux
  - Fallback vers POST /api/media/upload
  - Base64 storage fonctionne
  - Utilisateur informé du mode dégradé
```

### **✅ Test 4: Validation Limites**
```yaml
Objectif: Tester limites sécurité
Tests:
  - Upload 15MB → Rejet avec message clair
  - Upload .exe → Rejet type invalid
  - Rate limiting → 21 requêtes/min bloquées
  - Upload sans auth → 401
  
Critères succès:
  - Errors propres et informatifs
  - Pas de crash serveur
  - Logs Sentry appropriés
```

## 🛡️ **PHASE 2: TESTS CSP & SÉCURITÉ**

### **✅ Test 5: Images R2 Rendering**
```yaml
Browser Tests:
  Chrome:
    - [ ] Images R2 s'affichent
    - [ ] Pas d'erreur CSP console
    - [ ] next/image fonctionne
  Firefox:
    - [ ] Compatibilité CSP
    - [ ] Images loadent correctly  
  Safari:
    - [ ] WebKit compatibility
```

### **✅ Test 6: Services Externes**
```yaml
Vérifications:
  - [ ] Mapbox tiles chargent
  - [ ] Sentry errors reportés
  - [ ] WebSocket connections OK
  - [ ] Console 0 violation CSP
```

## 🛣️ **PHASE 3: TESTS REDIRECTS**

### **✅ Test 7: Routes Canoniques**
```yaml
Redirects à tester:
  /dashboard-escort/profil → /escort/profil (307)
  /api/profiles/123 → /api/profile/123 (307)  
  /api/geocode/search → /api/geo/search (307)
  
Critères:
  - [ ] Redirects 307 fonctionnels
  - [ ] Pas de 404 inattendus
  - [ ] SEO préservé (301 permanent)
  - [ ] Links internes mis à jour
```

## 📊 **PHASE 4: MONITORING & OBSERVABILITY**

### **✅ Test 8: Sentry Events**
```yaml
Events à vérifier:
  Upload success: trackUploadEvent(success: true)
  Upload failure: trackUploadEvent(success: false)
  Feature flag: trackFeatureFlagEvent("FEATURE_UPLOAD", true)
  Performance: trackPerformanceEvent si > 10s
  
Dashboard Sentry:
  - [ ] Events présents avec métadata
  - [ ] PII scrubbed (userId redacted)
  - [ ] Error grouping correct
```

### **✅ Test 9: Environment Validation**
```yaml
Déploiement tests:
  Production:
    - [ ] env.ts validation passes
    - [ ] Zod schema validé
    - [ ] R2 config complète
    - [ ] Fail-fast si vars critiques manquent
    
  Development:
    - [ ] Continue avec warnings si invalid
    - [ ] Logs de configuration visibles
```

## 🎚️ **PHASE 5: CANARY DEPLOYMENT**

### **✅ Activation Progressive**

#### **Semaine 1: FEATURE_UPLOAD=false → 10% users**
```yaml
Actions:
  1. Set CANARY_UPLOAD_PERCENTAGE=10
  2. Monitor 48h:
     - Upload success rate > 95%
     - No 500 errors
     - Sentry alerts < baseline
  3. User feedback collection
  
Rollback triggers:
  - Upload success < 90%
  - 500 errors > 1%
  - User complaints > 5
```

#### **Semaine 2: 10% → 50% → 100%**
```yaml
Progression:
  Day 1: 10% → 25%
  Day 3: 25% → 50% 
  Day 5: 50% → 100% (FEATURE_UPLOAD=true)
  
Success metrics:
  - Core Web Vitals stable
  - Business metrics maintained
  - Zero critical issues
```

## 🚨 **CRITÈRES D'ARRÊT (STOP CRITERIA)**

```yaml
Rollback immédiat si:
  Critical:
    - Upload success rate < 80%
    - 500 errors > 5% pendant 5min
    - Database corruption détectée
    - Security incident
    
  Warning (investigation):
    - Response time > 3x baseline
    - Memory usage > 90%
    - R2 quota dépassé
    - Support tickets spike > 200%
```

## ✅ **VALIDATION FINALE**

### **Production Ready Checklist**
```yaml
Infrastructure:
  - [ ] 3 PRs merged et testés
  - [ ] R2 configuré avec CORS
  - [ ] Environment validation passes
  - [ ] Feature flags à false (safe start)
  - [ ] Monitoring actif (Sentry + Vercel)
  
Security:
  - [ ] CSP updated sans violations
  - [ ] Redirects fonctionnels
  - [ ] Rate limiting actif
  - [ ] PII scrubbing vérifié
  
Performance:
  - [ ] Upload < 30s pour 10MB
  - [ ] Fallback < 5s si R2 down
  - [ ] Core Web Vitals stable
  - [ ] No memory leaks detected
  
Business:
  - [ ] User experience preserved
  - [ ] Gallery sync functional
  - [ ] Profile photos display OK
  - [ ] Mobile compatibility verified
```

**🎯 SUCCESS CRITERIA MET = GO FOR PRODUCTION ROLLOUT**