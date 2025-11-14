'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import dynamic from 'next/dynamic'
import { 
  Plus,
  ChevronLeft
} from 'lucide-react'

// Lazy loading du composant caméra pour de meilleures performances
const CameraScreenTest = dynamic(() => import('@/components/camera/CameraScreenTest'), {
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p>Chargement de la caméra...</p>
      </div>
    </div>
  )
})

// Types simplifiés
interface MediaFile {
  file: File | Blob
  previewUrl: string
  type: 'image' | 'video'
  size: number
  timestamp: number
}

// Composant galerie memoizé pour les performances
const MediaGallery = memo(({ media, onSelect }: { 
  media: MediaFile[], 
  onSelect: (media: MediaFile) => void 
}) => {
  if (media.length === 0) return null

  return (
    <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {media.slice(0, 6).map((item, index) => (
        <div 
          key={index}
          className="aspect-square rounded-xl overflow-hidden bg-gray-800 cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => onSelect(item)}
        >
          {item.type === 'image' ? (
            <img 
              src={item.previewUrl} 
              alt={`Media ${index + 1}`} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <video 
              src={item.previewUrl} 
              className="w-full h-full object-cover"
              muted
            />
          )}
        </div>
      ))}
    </div>
  )
})

MediaGallery.displayName = 'MediaGallery'

export default function TestMediaSimplePage() {
  // États essentiels seulement
  const [showCamera, setShowCamera] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentMedia, setRecentMedia] = useState<MediaFile[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Charger les médias récents depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('felora-recent-media')
      if (saved) {
        const media = JSON.parse(saved)
        setRecentMedia(media)
      }
    } catch (error) {
      console.error('Erreur chargement médias récents:', error)
    }
  }, [])

  // Sauvegarder les médias récents
  const saveRecentMedia = useCallback((media: MediaFile) => {
    setRecentMedia(prev => {
      const updated = [media, ...prev].slice(0, 10) // Garder seulement les 10 derniers
      localStorage.setItem('felora-recent-media', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Handler pour la capture vidéo/photo depuis CameraScreen
  const handleVideoCapture = useCallback((mediaBlob: Blob | File) => {
    setIsLoading(true)
    
    try {
      const mediaFile: MediaFile = {
        file: mediaBlob,
        previewUrl: URL.createObjectURL(mediaBlob),
        type: mediaBlob.type.startsWith('video/') ? 'video' : 'image',
        size: mediaBlob.size,
        timestamp: Date.now()
      }
      
      saveRecentMedia(mediaFile)
      setMessage('Média capturé avec succès !')
      setShowCamera(false)
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setError('Erreur lors de la capture du média')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }, [saveRecentMedia])

  // Handler pour sélectionner un média de la galerie
  const handleMediaSelect = useCallback((media: MediaFile) => {
    setMessage(`Média sélectionné: ${media.type === 'image' ? 'Image' : 'Vidéo'}`)
    setTimeout(() => setMessage(null), 2000)
  }, [])

  // Masquer le footer et la navigation au montage du composant
  useEffect(() => {
    const timer = setTimeout(() => {
      const style = document.createElement('style')
      style.id = 'test-media-hide-nav'
      style.textContent = `
        /* Masquer le footer et la navigation du layout principal */
        footer.w-full.py-6.border-t,
        div[data-static-nav="true"],
        nav[data-dashboard-mobile-nav] {
          display: none !important;
        }
        
        /* Ajuster le body pour cette page */
        body {
          padding-bottom: 0 !important;
        }
        
        /* Ajuster le conteneur principal */
        div[data-app-shell] {
          padding-bottom: 0 !important;
        }
      `
      
      // Supprimer l'ancien style s'il existe
      const existingStyle = document.getElementById('test-media-hide-nav')
      if (existingStyle) {
        existingStyle.remove()
      }
      
      document.head.appendChild(style)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      const style = document.getElementById('test-media-hide-nav')
      if (style) {
        style.remove()
      }
    }
  }, [])

  return (
    <div 
      className="min-h-screen text-white overflow-hidden"
      style={{ 
        backgroundColor: '#0B0B0B',
        paddingBottom: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      {/* Header simplifié */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-full">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="Retour"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Studio médias</h1>
          <div style={{ minWidth: '44px', minHeight: '44px' }} />
        </div>
      </div>

      {/* Messages de feedback */}
      {message && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          {message}
        </div>
      )}
      
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Page principale */}
      <div className="pt-14 flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4">
        <div className="text-center">
          {/* Bouton + avec animation de chargement */}
          <div 
            className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer ${
              isLoading ? 'animate-pulse scale-95' : ''
            }`}
            onClick={() => {
              if (!isLoading) {
                setShowCamera(true)
              }
            }}
          >
            <Plus className={`w-16 h-16 text-white transition-transform duration-200 ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          
          <p className="text-white/80 text-lg font-medium">
            {isLoading ? 'Chargement...' : 'Créer du contenu'}
          </p>
          <p className="text-white/60 text-sm mt-2">
            {isLoading ? 'Veuillez patienter' : 'Appuyez pour commencer'}
          </p>
        </div>

        {/* Galerie des médias récents */}
        <MediaGallery 
          media={recentMedia} 
          onSelect={handleMediaSelect}
        />
      </div>

      {/* Écran caméra avec lazy loading */}
      {showCamera && (
        <CameraScreenTest
          onClose={() => setShowCamera(false)}
          onCapture={handleVideoCapture}
        />
      )}
    </div>
  )
}
