# 📱 FELORA - Setup Capacitor (iOS/Android)

## ✅ Installation terminée

Les packages suivants sont installés :
- `@capacitor/core` + `@capacitor/cli`
- `@capacitor/ios` + `@capacitor/android`
- `@capacitor-community/camera-preview`
- `@capacitor/haptics`

## 🚀 Commandes disponibles

### Build l'app mobile
```bash
npm run build:mobile
```
Cette commande :
1. Build Next.js en mode static (avec `next.config.capacitor.js`)
2. Sync le build vers iOS/Android (`npx cap sync`)

### Ajouter les plateformes (première fois uniquement)
```bash
# iOS
npm run cap:add:ios

# Android
npm run cap:add:android
```

### Ouvrir dans Xcode/Android Studio
```bash
# iOS
npm run cap:open:ios

# Android
npm run cap:open:android
```

### Sync manuel (après modification du code)
```bash
npm run cap:sync
```

## 📝 Configuration

### Fichiers créés
- `capacitor.config.ts` - Config Capacitor principale
- `next.config.capacitor.js` - Config Next.js pour static export
- `package.json` - Scripts ajoutés

### App ID et nom
- **App ID**: `com.felora.app`
- **App Name**: `Felora`
- **Web Dir**: `out` (dossier du build Next.js)

## 🎥 Utiliser la caméra native

### Exemple d'utilisation de CameraPreview

```typescript
import { CameraPreview } from '@capacitor-community/camera-preview'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// Démarrer la caméra native en arrière-plan
await CameraPreview.start({
  position: 'rear',
  width: window.screen.width,
  height: window.screen.height,
  x: 0,
  y: 0,
  toBack: true, // La caméra passe en arrière-plan de ton UI web
  enableZoom: true,
  enableOpacity: true
})

// Prendre une photo
const result = await CameraPreview.capture({ quality: 90 })
const base64 = result.value

// Haptic feedback
await Haptics.impact({ style: ImpactStyle.Medium })

// Arrêter la caméra
await CameraPreview.stop()
```

### Interface recommandée
1. **Preview caméra native** en arrière-plan (toBack: true)
2. **UI Next.js** par-dessus (boutons, swipe, etc.)
3. **Swipe** pour changer photo/vidéo
4. **Bouton Upload** en bas à droite
5. **Haptic feedback** pour les interactions

## 📱 Workflow complet

1. **Développement web** : `npm run dev`
2. **Build pour mobile** : `npm run build:mobile`
3. **Ouvrir dans IDE natif** : `npm run cap:open:ios` ou `npm run cap:open:android`
4. **Run sur simulateur/device** depuis Xcode/Android Studio
5. **Debug web** : Safari Web Inspector (iOS) ou Chrome DevTools (Android)

## 🔧 Prochaines étapes

1. Créer le composant caméra avec CameraPreview
2. Ajouter swipe entre photo/vidéo
3. Intégrer upload vers R2
4. Ajouter haptic feedback
5. Tester sur device réel

## 📚 Documentation
- [Capacitor Docs](https://capacitorjs.com/docs)
- [CameraPreview Plugin](https://github.com/capacitor-community/camera-preview)
- [Haptics Plugin](https://capacitorjs.com/docs/apis/haptics)
