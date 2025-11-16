# État de la Traduction - Dashboard Escort Profil

## 📊 Progrès Global: 30%

### ✅ TERMINÉ

#### 1. Clés de traduction créées (100%)
- ✅ fr.json: +300 clés ajoutées dans `dashboardEscort.profil`
- ✅ en.json: +300 clés ajoutées (traductions anglaises)
- ✅ Toutes les sections couvertes:
  - clubs (invitations, my clubs)
  - tabs (basic, appearance, services, pricing, agenda, clubs)
  - completion status
  - requiredChecks
  - basic (photo, info, location, phone, geo blocking)
  - appearance (height, body types, hair, eyes, ethnicity, etc.)
  - services (clientele, service modes)
  - pricing (durations, custom pricing)
  - agenda (days, schedules, pause, absences)
  - save messages

#### 2. Hooks ajoutés (100%)
- ✅ Import `useTranslations` dans ModernProfileEditor.tsx
- ✅ Hook `const t = useTranslations('dashboardEscort.profil')` ajouté
- ✅ Hook dans MyClubsTab: `const t = useTranslations('dashboardEscort.profil.clubs')`

#### 3. Sections traduites (10%)
- ✅ Tabs (onglets) - lignes 854-861
  - `t('tabs.basic.label')` etc.

### 🔄 EN COURS

#### ModernProfileEditor.tsx - Reste ~200 emplacements

**Fichier: 3156 lignes total**
**Sections à traduire:**

1. **MyClubsTab (lignes 171-461)** - 0% traduit
   - [ ] Ligne 253: "Invitations ({pendingInvitations.length})" → `{t('tabs.invitations')} ({...})`
   - [ ] Ligne 263: "Mes clubs ({clubs.length})" → `{t('tabs.myClubs')} ({...})`
   - [ ] Ligne 269: Loading spinner
   - [ ] Ligne 303: "Invitation reçue le" → `{t('invitations.received')}`
   - [ ] Ligne 311: "Expire le" → `{t('invitations.expires')}`
   - [ ] Ligne 322: "Accepter" → `{t('invitations.accept')}`
   - [ ] Ligne 329: "Refuser" → `{t('invitations.decline')}`
   - [ ] Ligne 337: "Aucune invitation en attente" → `{t('invitations.noInvitations')}`
   - [ ] Ligne 339: "Les clubs peuvent..." → `{t('invitations.noInvitationsDescription')}`
   - [ ] Ligne 347: "Historique" → `{t('invitations.history')}`
   - [ ] Ligne 379-385: Statuts (Acceptée, Refusée, Expirée)
   - [ ] Ligne 433: "Voir profil" → `{t('myClubs.viewProfile')}`
   - [ ] Ligne 438: title="Quitter le club" → `title={t('myClubs.leaveClub')}`
   - [ ] Ligne 222: confirm message → `{t('myClubs.leaveConfirm', { clubName })}`
   - [ ] Ligne 449: "Vous n'êtes affiliée..." → `{t('myClubs.noClubs')}`
   - [ ] Ligne 451: "Acceptez une invitation..." → `{t('myClubs.noClubsDescription')}`

2. **Required Checks (lignes 1023-1031)** - 0% traduit
   - [ ] Ligne 1026: 'Photo de profil' → `{t('requiredChecks.profilePhoto')}`
   - [ ] Ligne 1027: 'Pseudo' → `{t('requiredChecks.stageName')}`
   - [ ] Ligne 1028: 'Âge' → `{t('requiredChecks.age')}`
   - [ ] Ligne 1029: 'Description (≥ 200 car.)' → `{t('requiredChecks.description')}`

3. **Completion Status (lignes 1583-1620)** - 0% traduit
   - [ ] Ligne 1583: "Complétude du profil" → `{t('completion.title')}`
   - [ ] Ligne 1599: "Vérifié" → `{t('completion.verified')}`
   - [ ] Ligne 1604: "En vérification" → `{t('completion.verifying')}`
   - [ ] Ligne 1609: "Certifier" → `{t('completion.certify')}`
   - [ ] Ligne 1620: "Actions requises" → `{t('completion.requiredActions')}`

4. **Basic Tab - Photo Section (lignes 1689-1965)** - 0% traduit
   - [ ] Ligne 1689: "Photo de profil" → `{t('basic.profilePhoto')}`
   - [ ] Ligne 1690: "⚠️ 1 photo de profil obligatoire" → `{t('basic.profilePhotoRequired')}`
   - [ ] Ligne 1696: label: 'Photo de profil' → `{t('basic.profilePhoto')}`
   - [ ] Ligne 1696: note: 'Obligatoire - Photo uniquement' → `{t('basic.notePhotoOnly')}`
   - [ ] Ligne 1705: setSaveMsg 'Créez d\'abord votre profil...' → `{t('basic.profileRequired')}`
   - [ ] Ligne 1718: 'Compression vidéo échouée' → `{t('basic.compressionFailed', { error })}`
   - [ ] Ligne 1723: 'Fichier trop volumineux' → `{t('basic.fileTooLarge')}`
   - [ ] Ligne 1805: 'Média uploadé ✅' → `{t('basic.mediaUploaded')}`
   - [ ] Ligne 1808: 'Échec de l\'upload' → `{t('basic.uploadFailed')}`
   - [ ] Ligne 1861: "OBLIGATOIRE" → `{t('basic.mandatory')}`
   - [ ] Ligne 1890: "Retirer" → `{t('basic.remove')}`
   - [ ] Ligne 1898: "OK" → `{t('basic.ok')}`
   - [ ] Ligne 1917: "Déposez ou cliquez pour ajouter" → `{t('basic.dropOrClick')}`
   - [ ] Ligne 1922: "Photo uniquement (max 500MB)" → `{t('basic.photoOnly')}`
   - [ ] Ligne 1920: "Photo ou vidéo (max 500MB)" → `{t('basic.photoOrVideo')}`
   - [ ] Ligne 1938: "Upload en cours..." → `{t('basic.uploadProgress')}`
   - [ ] Ligne 1943: "Préparation…" → `{t('basic.preparing')}`

5. **Basic Tab - Info Section (lignes 1967-2330)** - 0% traduit
   - [ ] Ligne 1967: "Informations de base" → `{t('basic.title')}`
   - [ ] Ligne 1971: "Pseudo *" → `{t('basic.stageName')} *`
   - [ ] Ligne 1980: "Catégorie *" → `{t('basic.category')} *`
   - [ ] Ligne 1986: "Sélectionner" → `{t('basic.selectCategory')}`
   - [ ] Lignes 1987-1991: Options catégories → `{t('basic.categories.escort')}` etc.
   - [ ] Ligne 1996: "Âge *" → `{t('basic.age')} *`
   - [ ] Ligne 2003: "Sélectionner" → `{t('basic.selectCategory')}`
   - [ ] Lignes 2004-2023: optgroup labels → `{t('basic.ageGroups.18-25')}` etc.
   - [ ] Ligne 2006: "{age} ans" → `{age} {t('basic.years')}`
   - [ ] Ligne 2026: "Certifier mon âge" → `{t('basic.certifyAge')}`
   - [ ] Ligne 2032: "Description *" → `{t('basic.description')} *`
   - [ ] Ligne 2037: placeholder → `{t('basic.descriptionPlaceholder')}`
   - [ ] Ligne 2044: "Langues parlées" → `{t('basic.languages')}`
   - [ ] Ligne 2045: "Évaluez votre niveau..." → `{t('basic.languagesHelp')}`
   - [ ] Ligne 2066: "Localisation" → `{t('basic.location.title')}`
   - [ ] Ligne 2067: "Requis" → `{t('basic.location.required')}`
   - [ ] Ligne 2075: "Canton" → `{t('basic.location.canton')}`
   - [ ] Ligne 2102: "Ville" → `{t('basic.location.city')}`
   - [ ] Ligne 2116: placeholder → `{t('basic.location.cityPlaceholder')}`
   - [ ] Ligne 2133: "Adresse complète" → `{t('basic.location.fullAddress')}`
   - [ ] Ligne 2148: placeholder → `{t('basic.location.addressPlaceholder')}`
   - [ ] Ligne 2191: "Précise" → `{t('basic.location.privacy.precise')}`
   - [ ] Ligne 2202: "Approximative (±150m)" → `{t('basic.location.privacy.approximate')}`
   - [ ] Ligne 2212: "Contact téléphonique" → `{t('basic.phone.title')}`
   - [ ] Ligne 2215: "Numéro de téléphone" → `{t('basic.phone.number')}`
   - [ ] Ligne 2220: placeholder → `{t('basic.phone.numberPlaceholder')}`
   - [ ] Ligne 2225: "Visibilité du numéro" → `{t('basic.phone.visibility')}`
   - [ ] Ligne 2236: "📞 Numéro visible..." → `{t('basic.phone.visible')}`
   - [ ] Ligne 2247: "📞 Numéro caché..." → `{t('basic.phone.hidden')}`
   - [ ] Ligne 2258: "🔒 Messagerie privée uniquement" → `{t('basic.phone.none')}`
   - [ ] Ligne 2269: "Blocage géographique" → `{t('basic.geoBlocking.title')}`
   - [ ] Ligne 2270: "Optionnel" → `{t('basic.geoBlocking.optional')}`
   - [ ] Ligne 2274: "Bloquez l'accès..." → `{t('basic.geoBlocking.description')}`
   - [ ] Ligne 2323: "{count} pays bloqué" → `{t('basic.geoBlocking.blockedCount', { count })}` + plural

6. **Appearance Tab (lignes 2332-2500)** - 0% traduit
   - Tous les labels, options de sélection à traduire

7. **Services Tab (lignes 2496-2570)** - 0% traduit
   - Labels clientèle, mode de service

8. **Pricing Tab (lignes 2574-2890)** - 0% traduit
   - Tarifs, durées personnalisées, tooltips

9. **Agenda Tab (lignes 2892-3150)** - 0% traduit
   - Jours, horaires, pause, absences, templates

10. **Save Messages (dispersés)** - 0% traduit
    - Messages de succès/erreur/retry

### 📝 Stratégie Recommandée

Pour finir la traduction efficacement:

**Option 1: Modification manuelle par sections** (~ 3-4 heures)
- Modifier section par section
- Tester après chaque section
- 10 sections × ~20-30 minutes = 3-4h

**Option 2: Script de remplacement automatique** (~ 1 heure)
- Créer un script sed/awk avec tous les remplacements
- Exécuter en une fois
- Tester et corriger les éventuelles erreurs
- Risque: peut casser la syntaxe si mal fait

**Option 3: Approche hybride** (~ 2 heures) ✅ RECOMMANDÉE
1. Finir les sections les plus visibles d'abord:
   - MyClubsTab (invitations, clubs)
   - Completion status
   - Required checks
   - Photo section
2. Commit intermédiaire
3. Continuer avec Basic info, Appearance, Services
4. Commit intermédiaire
5. Finir avec Pricing et Agenda
6. Commit final

### 🎯 Prochaines Actions

1. ✅ Commit actuel (clés + hooks + tabs)
2. 🔄 Traduire MyClubsTab (30 min)
3. 🔄 Traduire Completion + Required checks (15 min)
4. 🔄 Traduire Photo section (30 min)
5. ⏳ Traduire Basic info section (45 min)
6. ⏳ Traduire Appearance tab (30 min)
7. ⏳ Traduire Services tab (20 min)
8. ⏳ Traduire Pricing tab (45 min)
9. ⏳ Traduire Agenda tab (45 min)
10. ⏳ Test complet + corrections

**Temps estimé total: ~4h30**

### 📌 Notes Importantes

- Le fichier fait 3156 lignes - très volumineux
- ~200-250 emplacements de texte à remplacer
- Hooks déjà en place, juste besoin de remplacer les textes
- Toutes les clés de traduction sont prêtes
- Structure fr.json/en.json complète et cohérente

---

**Dernière mise à jour:** 2025-11-16
**Auteur:** Claude
