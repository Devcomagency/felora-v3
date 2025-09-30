"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  X, 
  RotateCcw, 
  Upload,
  Play,
  Pause,
  Square,
  ArrowRight,
  Filter,
  Smile,
  Crop,
  Trash2,
  ChevronLeft,
  MapPin,
  Eye,
  EyeOff,
  Crown,
  MoreHorizontal
} from 'lucide-react'

// Tokens Felora
const FELORA_TOKENS = {
  bg: '#0B0B0B',
  panel: '#14171D',
  text: '#EAECEF',
  textSecondary: '#A1A5B0',
  primary: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
  focus: '#4FD1C7',
  public: '#FF6B9D',
  private: '#B794F6',
  premium: '#4FD1C7',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassBlur: '12px'
}

type RecordState = 'idle' | 'recording' | 'paused'
type VisibilityType = 'public' | 'private' | 'premium'

interface CameraScreenProps {
  onClose: () => void
  onCapture: (videoBlob: Blob, description?: string) => void
}

export default function CameraScreenTest({ onClose, onCapture }: CameraScreenProps) {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [recordingTime, setRecordingTime] = useState(0)
  const [isFrontCamera, setIsFrontCamera] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [capturedVideo, setCapturedVideo] = useState<Blob | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [capturedImageBlob, setCapturedImageBlob] = useState<Blob | null>(null)
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('public')
  const [price, setPrice] = useState('')
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [recentMedia, setRecentMedia] = useState<string[]>([])
  
  // États pour les filtres et crop
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Récupérer les derniers médias de la galerie
  const loadRecentMedia = useCallback(async () => {
    try {
      // Simulation de récupération des derniers médias
      // Dans une vraie app, vous utiliseriez l'API File System Access ou d'autres méthodes
      const mockRecentMedia = [
        '/api/placeholder/300/400',
        '/api/placeholder/300/400',
        '/api/placeholder/300/400'
      ]
      setRecentMedia(mockRecentMedia)
    } catch (error) {
      console.error('Erreur lors du chargement des médias récents:', error)
    }
  }, [])

  // Initialiser la caméra
  useEffect(() => {
    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('API getUserMedia non disponible')
          return
        }

        // Arrêter le stream existant avant d'en créer un nouveau
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: isFrontCamera ? 'user' : 'environment',
            width: { ideal: 1080 },
            height: { ideal: 1920 }
          },
          audio: true
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          setCameraPermission('granted')
        }
      } catch (error: any) {
        console.error('Erreur accès caméra:', error)
        
        if (error.name === 'NotAllowedError') {
          setCameraPermission('denied')
        } else if (error.name === 'NotFoundError') {
          alert('Aucune caméra trouvée sur cet appareil.')
        } else if (error.name === 'NotReadableError') {
          alert('La caméra est déjà utilisée par une autre application.')
        } else {
          alert('Erreur d\'accès à la caméra: ' + error.message)
        }
      }
    }

    const timer = setTimeout(initCamera, 100)
    loadRecentMedia() // Charger les médias récents
    
    return () => {
      clearTimeout(timer)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [isFrontCamera, loadRecentMedia])

  // Réinitialiser la caméra quand on revient de la preview/details
  useEffect(() => {
    if (!showPreview && !showPublish) {
      // Réinitialiser complètement la caméra
      const reinitCamera = async () => {
        try {
          // Arrêter le stream existant
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }

          // Attendre un peu puis recréer le stream
          setTimeout(async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                  facingMode: isFrontCamera ? 'user' : 'environment',
                  width: { ideal: 1080 },
                  height: { ideal: 1920 }
                },
                audio: true
              })
              
              if (videoRef.current) {
                videoRef.current.srcObject = stream
                streamRef.current = stream
                await videoRef.current.play()
              }
            } catch (error) {
              console.error('Erreur lors de la réinitialisation de la caméra:', error)
            }
          }, 200)
        } catch (error) {
          console.error('Erreur lors de la réinitialisation:', error)
        }
      }

      reinitCamera()
    }
  }, [showPreview, showPublish, isFrontCamera])

  // Timer d'enregistrement
  useEffect(() => {
    if (recordState === 'recording') {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [recordState])

  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      console.error('❌ Aucun stream disponible pour l\'enregistrement')
      return
    }

    try {
      const supportedTypes = [
        'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'
      ]
      let mimeType = ''
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type
          break
        }
      }
      
      const mediaRecorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined)
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: mimeType || 'video/webm' })
        if (videoBlob.size > 0) {
          setCapturedVideo(videoBlob)
          setShowPreview(true)
        } else {
          alert('Erreur: Aucune vidéo n\'a été enregistrée')
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      setRecordState('recording')
      setRecordingTime(0)
    } catch (error) {
      console.error('Erreur d\'enregistrement:', error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordState === 'recording') {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
      setRecordingTime(0)
      mediaRecorderRef.current.stop()
      setRecordState('idle')
    }
  }, [recordState])

  const takePhoto = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          setCapturedImageBlob(blob); // Stocker aussi le blob
          setShowPreview(true);
        } else {
          alert('Erreur: Impossible de prendre la photo');
        }
      }, 'image/png');
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    longPressTimeoutRef.current = setTimeout(() => {
      startRecording();
    }, 500); // 500ms pour un appui long
  }, [startRecording]);

  const handleMouseUp = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
      if (recordState === 'idle') {
        // Appui court, prendre une photo
        takePhoto();
      } else if (recordState === 'recording') {
        // Appui long terminé, arrêter l'enregistrement
        stopRecording();
      }
    }
  }, [recordState, takePhoto, stopRecording]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setCapturedVideo(file);
        setShowPreview(true);
      } else if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        setCapturedImage(imageUrl);
        setShowPreview(true);
      } else {
        alert('Type de fichier non supporté. Veuillez télécharger une image ou une vidéo.');
      }
    }
    // Réinitialiser la valeur de l'input pour permettre de re-télécharger le même fichier
    event.target.value = '';
  }, []);

  const handlePublish = async () => {
    if (capturedVideo || capturedImage) {
      console.log('🚀 Publication du contenu avec les paramètres:')
      console.log('  - Visibilité:', visibility)
      console.log('  - Description:', description.length > 0 ? `${description.substring(0, 50)}...` : 'Vide')
      console.log('  - Prix (si premium):', visibility === 'premium' ? price || 'Non spécifié' : 'N/A')
      
      // Upload du média avant la redirection
      try {
        console.log('📤 Upload du média...')
        onCapture(capturedVideo || capturedImageBlob, description) // Passer le média capturé et la description
        onClose() // Fermer l'écran de la caméra
        return // La redirection sera gérée par onCapture
      } catch (error) {
        console.error('❌ Erreur lors de l\'upload:', error)
        return
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (cameraPermission === 'denied') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl font-bold mb-4">Accès Caméra Refusé</h2>
        <p className="text-center mb-6">
          Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur pour utiliser cette fonctionnalité.
        </p>
        <button onClick={onClose} className="px-6 py-3 bg-white/10 rounded-full text-white">
          Fermer
        </button>
      </div>
    )
  }

  // Écran de publication - Simplifié
  if (showPublish) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto" style={{ backgroundColor: '#0B0B0B', fontFamily: 'Inter' }}>
        {/* Bouton retour en haut à gauche */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => {
              setShowPublish(false)
              setShowPreview(true)
            }}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-200"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 p-6 pt-20 space-y-8">
          {/* Preview miniature premium */}
          <div className="flex justify-center">
            <div className="relative w-32 h-40 rounded-2xl overflow-hidden shadow-2xl" style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)'
            }}>
              {capturedVideo ? (
                <video
                  className="w-full h-full object-cover"
                  src={URL.createObjectURL(capturedVideo)}
                  muted
                />
              ) : capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>

          {/* Formulaire premium glassmorphism */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décris ton contenu (hashtags, @)..."
                rows={3}
                className="w-full px-4 py-4 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4FD1C7] focus:border-transparent resize-none transition-all duration-200"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(12px)'
                }}
              />
            </div>

            {/* Visibilité - Cards Premium */}
            <div>
              <label className="block text-xl font-bold mb-4 text-white">
                📱 Visibilité du contenu
              </label>
              <p className="text-sm mb-6 text-white/80">
                Choisissez qui peut voir votre contenu
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { 
                    key: 'public', 
                    label: 'Publique', 
                    description: 'Visible par tous',
                    color: '#FF6B9D', 
                    icon: Eye 
                  },
                  { 
                    key: 'private', 
                    label: 'Privée', 
                    description: 'Seulement vous',
                    color: '#B794F6', 
                    icon: EyeOff 
                  },
                  { 
                    key: 'premium', 
                    label: 'Premium', 
                    description: 'Contenu payant',
                    color: '#4FD1C7', 
                    icon: Crown 
                  }
                ].map(({ key, label, description, color, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setVisibility(key as VisibilityType)}
                    className="p-4 rounded-2xl text-center transition-all duration-200 hover:scale-105"
                    style={{
                      background: visibility === key 
                        ? `rgba(${key === 'public' ? '255, 107, 157' : key === 'private' ? '183, 148, 246' : '79, 209, 199'}, 0.15)`
                        : 'rgba(255, 255, 255, 0.08)',
                      border: visibility === key 
                        ? `2px solid ${color}` 
                        : '1px solid rgba(255, 255, 255, 0.14)',
                      backdropFilter: 'blur(12px)',
                      boxShadow: visibility === key ? `0 0 20px ${color}40` : 'none'
                    }}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" style={{ color }} />
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-white/70 mt-1">{description}</div>
                  </button>
                ))}
              </div>
              
              {/* Prix pour Premium */}
              {visibility === 'premium' && (
                <div className="mt-4">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Prix (CHF)"
                    className="w-full px-4 py-4 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4FD1C7] focus:border-transparent transition-all duration-200"
                    style={{ 
                      background: 'rgba(79, 209, 199, 0.1)',
                      border: '1px solid rgba(79, 209, 199, 0.3)',
                      backdropFilter: 'blur(12px)'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bouton Publier */}
          <div className="pt-6">
            <button 
              onClick={handlePublish}
              className="w-full py-4 rounded-2xl text-white font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                boxShadow: '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(255, 107, 157, 0.2)'
              }}
            >
              Publier
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Écran de prévisualisation - Simplifié
  if (showPreview && (capturedVideo || capturedImage)) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0B0B0B', fontFamily: 'Inter' }}>
        {/* Bouton retour en haut à gauche */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => {
              setShowPreview(false)
              // La caméra sera réinitialisée automatiquement par le useEffect
            }}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-200"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Bouton suivant en haut à droite */}
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={() => {
              setShowPreview(false)
              setShowPublish(true)
            }}
            className="px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
              boxShadow: '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(255, 107, 157, 0.2)'
            }}
          >
            Suivant
          </button>
        </div>

        {/* Preview principal - Même taille que caméra */}
        <div className="flex-1 relative p-4">
          <div className="relative w-full h-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '9/16' }}>
            {capturedVideo ? (
              <video
                className="w-full h-full object-cover"
                src={URL.createObjectURL(capturedVideo)}
                controls
                autoPlay
                loop
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>

        {/* Actions flottantes à droite - Premium Glassmorphism */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setSelectedFilter('brightness')}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ 
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(12px)',
                boxShadow: selectedFilter === 'brightness' ? '0 0 20px rgba(79, 209, 199, 0.4)' : 'none'
              }}
            >
              <Filter className="w-6 h-6 text-white" />
            </button>
            <button 
              onClick={() => {}}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ 
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <Smile className="w-6 h-6 text-white" />
            </button>
            <button 
              onClick={() => {}}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ 
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <Crop className="w-6 h-6 text-white" />
            </button>
            <button 
              onClick={() => {
                setCapturedVideo(null)
                setCapturedImage(null)
                setCapturedImageBlob(null)
                setShowPreview(false)
                setShowPublish(false)
                // La caméra sera réinitialisée automatiquement par le useEffect
              }}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ 
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <Trash2 className="w-6 h-6 text-red-400" />
            </button>
          </div>
        </div>

        {/* Sliders pour les filtres - Premium */}
        {selectedFilter === 'brightness' && (
          <div className="absolute bottom-32 left-6 right-6 z-10">
            <div className="rounded-2xl p-6 space-y-6" style={{ 
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(12px)'
            }}>
              <div>
                <label className="block text-sm font-medium text-white mb-3">Luminosité</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      outline: 'none'
                    }}
                  />
                  <div 
                    className="absolute top-0 h-2 rounded-lg pointer-events-none"
                    style={{ 
                      width: `${(brightness / 200) * 100}%`,
                      background: 'linear-gradient(90deg, #4FD1C7 0%, #FF6B9D 100%)'
                    }}
                  />
                </div>
                <span className="text-sm text-white/80 mt-2 block">{brightness}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-3">Contraste</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      outline: 'none'
                    }}
                  />
                  <div 
                    className="absolute top-0 h-2 rounded-lg pointer-events-none"
                    style={{ 
                      width: `${(contrast / 200) * 100}%`,
                      background: 'linear-gradient(90deg, #4FD1C7 0%, #FF6B9D 100%)'
                    }}
                  />
                </div>
                <span className="text-sm text-white/80 mt-2 block">{contrast}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Écran caméra principal - MODIFIÉ pour test-media-simple
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0B0B0B', fontFamily: 'Inter' }}>
      {/* Bouton retour en haut à gauche - SEUL élément en haut */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          onClick={onClose}
          className="p-3 rounded-full hover:bg-white/10 transition-all duration-200"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Timer d'enregistrement en haut au centre */}
      {recordState === 'recording' && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center space-x-3 px-4 py-2 rounded-full" style={{ 
            background: 'rgba(255, 107, 157, 0.15)', 
            border: '1px solid rgba(255, 107, 157, 0.3)',
            backdropFilter: 'blur(12px)'
          }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FF6B9D' }} />
            <span className="text-sm font-mono text-white">{formatTime(recordingTime)}</span>
          </div>
        </div>
      )}

      {/* Preview caméra 9:16 avec arrondis - Plein écran */}
      <div className="flex-1 relative p-4">
        <div className="relative w-full h-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '9/16' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Overlay gradient premium */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      </div>

      {/* Boutons en bas à droite - NOUVEAU POSITIONNEMENT */}
      <div className="absolute bottom-8 right-6 z-10 flex flex-col gap-4">
        {/* Upload photo */}
        <div 
          onClick={handleUpload}
          className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
          style={{ 
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {recentMedia.length > 0 ? (
            <div className="w-full h-full relative">
              <img 
                src={recentMedia[0]} 
                alt="Recent media" 
                className="w-full h-full object-cover absolute inset-0" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              {recentMedia.length > 1 && (
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">+{recentMedia.length - 1}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-white/70" />
            </div>
          )}
        </div>

        {/* Switch caméra */}
        <button 
          onClick={() => setIsFrontCamera(!isFrontCamera)}
          className="p-3 rounded-full hover:bg-white/10 transition-all duration-200"
          style={{ 
            minWidth: '44px', 
            minHeight: '44px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Bouton record centré en bas */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            recordState === 'recording' 
              ? 'scale-110' 
              : 'hover:scale-105'
          }`}
          style={{
            background: recordState === 'recording' 
              ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
              : 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
            boxShadow: recordState === 'recording'
              ? '0 0 30px rgba(239, 68, 68, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)'
              : '0 0 20px rgba(255, 107, 157, 0.4), 0 0 40px rgba(255, 107, 157, 0.2)'
          }}
        >
          {recordState === 'recording' ? (
            <Square className="w-8 h-8 text-white" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full" style={{ 
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)' 
              }} />
            </div>
          )}
          
          {/* Anneau progress pour recording */}
          {recordState === 'recording' && (
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          )}
        </button>
      </div>

      {/* Input file caché pour upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}
