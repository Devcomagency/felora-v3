# 📱 Guide Screenshots Landing Page

## Comment ajouter des screenshots de l'app dans le téléphone de la landing

### 🎯 Objectif
Afficher de vraies captures d'écran de Felora dans le mockup de téléphone sur la page d'accueil.

### 📸 Étapes

#### 1. Prendre les screenshots
Ouvre l'app en **mode mobile** (responsive design) et prends des captures d'écran :

**Screenshots recommandés :**
- `screenshot-1.png` : Feed principal avec profils (page d'accueil)
- `screenshot-2.png` : Page profil escort (avec photos, infos, boutons)
- `screenshot-3.png` : Map interactive avec markers
- `screenshot-4.png` : Page de chat/messagerie
- `screenshot-5.png` : Search/filtres

**Taille recommandée :**
- Largeur : 375px (iPhone standard)
- Hauteur : 812px (iPhone X/11/12)
- Format : PNG avec fond transparent si possible

#### 2. Optimiser les images
```bash
# Réduire la taille des fichiers
# Sur macOS avec ImageOptim ou via CLI :
pngquant --quality=80-90 screenshot-*.png
```

#### 3. Placer les fichiers
Copie les screenshots renommés dans :
```
public/landing/
├── screenshot-1.png  ✅
├── screenshot-2.png  ✅
├── screenshot-3.png  ✅
└── screenshot-4.png  (optionnel)
```

#### 4. Vérifier
Recharge la landing page : les screenshots vont défiler automatiquement toutes les 4 secondes dans le téléphone.

### 🎨 Alternative rapide

**Prendre des screenshots depuis felora.ch en production :**

1. Ouvre https://www.felora.ch
2. Ouvre les DevTools (F12)
3. Active le mode mobile (Ctrl/Cmd + Shift + M)
4. Sélectionne "iPhone 12 Pro" ou "iPhone 14"
5. Navigue vers :
   - `/feed` → Screenshot 1
   - `/profile/[id]` → Screenshot 2
   - `/map` → Screenshot 3
6. Prends les captures avec l'outil DevTools ou ton système

### ✨ Conseils
- **Profils vérifiés** : Utilise des profils avec badge vérifié
- **Photos de qualité** : Choisis des profils avec de belles photos
- **Contenu varié** : Mixe feed/profil/map pour montrer toutes les features
- **Luminosité** : Assure-toi que les screenshots soient bien éclairés

### 🔧 Fallback actuel
Si aucun screenshot n'existe, le téléphone affiche une interface simulée avec :
- Logo Felora
- Cartes de profils avec gradients
- Navigation bottom
- Statut "En ligne"

C'est fonctionnel mais **moins impactant** que de vraies captures.
