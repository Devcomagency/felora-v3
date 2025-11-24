'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Plus,
  ChevronLeft
} from 'lucide-react'
import CameraScreenTest from '@/components/camera/CameraScreenTest'

// Types simplifiés - seulement ceux utilisés
interface MediaFile {
  file: File | Blob
  previewUrl: string
  type: 'image' | 'video'
  size: number
}

export default function TestMediaSimplePage() {
  // États principaux
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentMedia, setRecentMedia] = useState<MediaFile[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(65) // Position par défaut (65%)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  
  // États du formulaire
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('PUBLIC')
  const [premiumPrice, setPremiumPrice] = useState(10)
  
  // États pour la visibilité
  const [showInSearch, setShowInSearch] = useState(true)
  const [allowComments, setAllowComments] = useState(true)
  const [allowDownload, setAllowDownload] = useState(false)

  // États pour Undo/Redo
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // États pour les filtres
  const [filters, setFilters] = useState<FilterState>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sepia: 0,
    vintage: 0,
    blackwhite: 0
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filteredPreviewUrl, setFilteredPreviewUrl] = useState<string | null>(null)
  const [isApplyingFilter, setIsApplyingFilter] = useState(false)

  // États pour retry intelligent
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(3)
  const [retryDelay, setRetryDelay] = useState(1000)
  const [isRetrying, setIsRetrying] = useState(false)

  // États pour les filtres visuels
  const [visualFilters] = useState<VisualFilter[]>([
    {
      id: 'original',
      name: 'Original',
      icon: '📷',
      preview: 'original',
      filters: {}
    },
    {
      id: 'vintage',
      name: 'Vintage',
      icon: '📸',
      preview: 'vintage',
      filters: { vintage: 80, sepia: 20, contrast: 110 }
    },
    {
      id: 'blackwhite',
      name: 'Noir & Blanc',
      icon: '⚫',
      preview: 'bw',
      filters: { blackwhite: 100, contrast: 120 }
    },
    {
      id: 'dramatic',
      name: 'Dramatique',
      icon: '🎭',
      preview: 'dramatic',
      filters: { contrast: 150, brightness: 80, saturation: 120 }
    },
    {
      id: 'warm',
      name: 'Chaud',
      icon: '🌅',
      preview: 'warm',
      filters: { hue: 30, saturation: 130, brightness: 110 }
    },
    {
      id: 'cool',
      name: 'Froid',
      icon: '❄️',
      preview: 'cool',
      filters: { hue: -30, saturation: 120, brightness: 90 }
    },
    {
      id: 'soft',
      name: 'Doux',
      icon: '🌸',
      preview: 'soft',
      filters: { blur: 2, brightness: 110, contrast: 90 }
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      icon: '🌈',
      preview: 'vibrant',
      filters: { saturation: 150, contrast: 120, brightness: 105 }
    },
    {
      id: 'sepia',
      name: 'Sépia',
      icon: '🟤',
      preview: 'sepia',
      filters: { sepia: 100, contrast: 110, brightness: 95 }
    },
    {
      id: 'fade',
      name: 'Fade',
      icon: '🌫️',
      preview: 'fade',
      filters: { brightness: 120, contrast: 80, saturation: 70 }
    },
    {
      id: 'clarendon',
      name: 'Clarendon',
      icon: '☀️',
      preview: 'clarendon',
      filters: { contrast: 130, brightness: 110, saturation: 120, hue: 10 }
    },
    {
      id: 'lark',
      name: 'Lark',
      icon: '🐦',
      preview: 'lark',
      filters: { brightness: 115, contrast: 110, saturation: 130, hue: -5 }
    }
  ])
  const [selectedVisualFilter, setSelectedVisualFilter] = useState<string>('original')

  // États pour les stickers interactifs
  const [stickers] = useState<Sticker[]>([
    // Émotions (24)
    { id: 'heart', name: 'Cœur', emoji: '❤️', category: 'emotions', isPremium: false },
    { id: 'fire', name: 'Feu', emoji: '🔥', category: 'emotions', isPremium: false },
    { id: 'star', name: 'Étoile', emoji: '⭐', category: 'emotions', isPremium: false },
    { id: 'thumbs', name: 'Pouce', emoji: '👍', category: 'emotions', isPremium: false },
    { id: 'clap', name: 'Applaudir', emoji: '👏', category: 'emotions', isPremium: false },
    { id: 'party', name: 'Fête', emoji: '🎉', category: 'emotions', isPremium: false },
    { id: 'love', name: 'Amour', emoji: '💕', category: 'emotions', isPremium: false },
    { id: 'kiss', name: 'Bisou', emoji: '💋', category: 'emotions', isPremium: false },
    { id: 'wink', name: 'Clin d\'œil', emoji: '😉', category: 'emotions', isPremium: false },
    { id: 'laugh', name: 'Rire', emoji: '😂', category: 'emotions', isPremium: false },
    { id: 'cry', name: 'Pleurer', emoji: '😢', category: 'emotions', isPremium: false },
    { id: 'angry', name: 'En colère', emoji: '😠', category: 'emotions', isPremium: false },
    { id: 'smile', name: 'Sourire', emoji: '😊', category: 'emotions', isPremium: false },
    { id: 'laugh2', name: 'Rire aux éclats', emoji: '🤣', category: 'emotions', isPremium: false },
    { id: 'love_eyes', name: 'Yeux en cœur', emoji: '🥰', category: 'emotions', isPremium: false },
    { id: 'kiss_face', name: 'Visage bisou', emoji: '😘', category: 'emotions', isPremium: false },
    { id: 'thinking', name: 'Réfléchir', emoji: '🤔', category: 'emotions', isPremium: false },
    { id: 'shy', name: 'Timide', emoji: '😳', category: 'emotions', isPremium: false },
    { id: 'cool', name: 'Cool', emoji: '😎', category: 'emotions', isPremium: false },
    { id: 'sleepy', name: 'Endormi', emoji: '😴', category: 'emotions', isPremium: false },
    { id: 'dizzy', name: 'Étourdi', emoji: '😵', category: 'emotions', isPremium: false },
    { id: 'sick', name: 'Malade', emoji: '🤒', category: 'emotions', isPremium: false },
    { id: 'nerd', name: 'Intello', emoji: '🤓', category: 'emotions', isPremium: false },
    { id: 'sunglasses', name: 'Lunettes de soleil', emoji: '🕶️', category: 'emotions', isPremium: false },
    
    // Objets (24)
    { id: 'camera', name: 'Appareil', emoji: '📷', category: 'objects', isPremium: false },
    { id: 'phone', name: 'Téléphone', emoji: '📱', category: 'objects', isPremium: false },
    { id: 'music', name: 'Musique', emoji: '🎵', category: 'objects', isPremium: false },
    { id: 'coffee', name: 'Café', emoji: '☕', category: 'objects', isPremium: false },
    { id: 'food', name: 'Nourriture', emoji: '🍕', category: 'objects', isPremium: false },
    { id: 'car', name: 'Voiture', emoji: '🚗', category: 'objects', isPremium: false },
    { id: 'plane', name: 'Avion', emoji: '✈️', category: 'objects', isPremium: false },
    { id: 'house', name: 'Maison', emoji: '🏠', category: 'objects', isPremium: false },
    { id: 'gift', name: 'Cadeau', emoji: '🎁', category: 'objects', isPremium: false },
    { id: 'book', name: 'Livre', emoji: '📚', category: 'objects', isPremium: false },
    { id: 'game', name: 'Jeu', emoji: '🎮', category: 'objects', isPremium: false },
    { id: 'ball', name: 'Ballon', emoji: '⚽', category: 'objects', isPremium: false },
    { id: 'laptop', name: 'Ordinateur', emoji: '💻', category: 'objects', isPremium: false },
    { id: 'watch', name: 'Montre', emoji: '⌚', category: 'objects', isPremium: false },
    { id: 'headphones', name: 'Casque', emoji: '🎧', category: 'objects', isPremium: false },
    { id: 'camera2', name: 'Caméra vidéo', emoji: '📹', category: 'objects', isPremium: false },
    { id: 'tv', name: 'Télévision', emoji: '📺', category: 'objects', isPremium: false },
    { id: 'radio', name: 'Radio', emoji: '📻', category: 'objects', isPremium: false },
    { id: 'bike', name: 'Vélo', emoji: '🚲', category: 'objects', isPremium: false },
    { id: 'bus', name: 'Bus', emoji: '🚌', category: 'objects', isPremium: false },
    { id: 'train', name: 'Train', emoji: '🚂', category: 'objects', isPremium: false },
    { id: 'ship', name: 'Bateau', emoji: '🚢', category: 'objects', isPremium: false },
    { id: 'rocket', name: 'Fusée', emoji: '🚀', category: 'objects', isPremium: false },
    { id: 'umbrella', name: 'Parapluie', emoji: '☂️', category: 'objects', isPremium: false },
    
    // Symboles (24)
    { id: 'check', name: 'Valider', emoji: '✅', category: 'symbols', isPremium: false },
    { id: 'cross', name: 'Annuler', emoji: '❌', category: 'symbols', isPremium: false },
    { id: 'warning', name: 'Attention', emoji: '⚠️', category: 'symbols', isPremium: false },
    { id: 'info', name: 'Info', emoji: 'ℹ️', category: 'symbols', isPremium: false },
    { id: 'question', name: 'Question', emoji: '❓', category: 'symbols', isPremium: false },
    { id: 'exclamation', name: 'Exclamation', emoji: '❗', category: 'symbols', isPremium: false },
    { id: 'plus', name: 'Plus', emoji: '➕', category: 'symbols', isPremium: false },
    { id: 'minus', name: 'Moins', emoji: '➖', category: 'symbols', isPremium: false },
    { id: 'arrow', name: 'Flèche', emoji: '➡️', category: 'symbols', isPremium: false },
    { id: 'recycle', name: 'Recyclage', emoji: '♻️', category: 'symbols', isPremium: false },
    { id: 'peace', name: 'Paix', emoji: '☮️', category: 'symbols', isPremium: false },
    { id: 'yin', name: 'Yin Yang', emoji: '☯️', category: 'symbols', isPremium: false },
    { id: 'star2', name: 'Étoile brillante', emoji: '✨', category: 'symbols', isPremium: false },
    { id: 'sparkles', name: 'Paillettes', emoji: '💫', category: 'symbols', isPremium: false },
    { id: 'rainbow', name: 'Arc-en-ciel', emoji: '🌈', category: 'symbols', isPremium: false },
    { id: 'sun', name: 'Soleil', emoji: '☀️', category: 'symbols', isPremium: false },
    { id: 'moon', name: 'Lune', emoji: '🌙', category: 'symbols', isPremium: false },
    { id: 'cloud', name: 'Nuage', emoji: '☁️', category: 'symbols', isPremium: false },
    { id: 'snowflake', name: 'Flocon', emoji: '❄️', category: 'symbols', isPremium: false },
    { id: 'droplet', name: 'Goutte', emoji: '💧', category: 'symbols', isPremium: false },
    { id: 'flower', name: 'Fleur', emoji: '🌸', category: 'symbols', isPremium: false },
    { id: 'rose', name: 'Rose', emoji: '🌹', category: 'symbols', isPremium: false },
    { id: 'leaf', name: 'Feuille', emoji: '🍃', category: 'symbols', isPremium: false },
    { id: 'tree', name: 'Arbre', emoji: '🌳', category: 'symbols', isPremium: false },
    
    // Premium (24)
    { id: 'crown', name: 'Couronne', emoji: '👑', category: 'premium', isPremium: true },
    { id: 'diamond', name: 'Diamant', emoji: '💎', category: 'premium', isPremium: true },
    { id: 'trophy', name: 'Trophée', emoji: '🏆', category: 'premium', isPremium: true },
    { id: 'medal', name: 'Médaille', emoji: '🏅', category: 'premium', isPremium: true },
    { id: 'gem', name: 'Gemme', emoji: '💠', category: 'premium', isPremium: true },
    { id: 'sparkles', name: 'Étincelles', emoji: '✨', category: 'premium', isPremium: true },
    { id: 'rainbow', name: 'Arc-en-ciel', emoji: '🌈', category: 'premium', isPremium: true },
    { id: 'unicorn', name: 'Licorne', emoji: '🦄', category: 'premium', isPremium: true },
    { id: 'rocket', name: 'Fusée', emoji: '🚀', category: 'premium', isPremium: true },
    { id: 'star2', name: 'Étoile filante', emoji: '🌠', category: 'premium', isPremium: true },
    { id: 'comet', name: 'Comète', emoji: '☄️', category: 'premium', isPremium: true },
    { id: 'galaxy', name: 'Galaxie', emoji: '🌌', category: 'premium', isPremium: true },
    { id: 'money', name: 'Argent', emoji: '💰', category: 'premium', isPremium: true },
    { id: 'bank', name: 'Banque', emoji: '🏦', category: 'premium', isPremium: true },
    { id: 'credit', name: 'Carte de crédit', emoji: '💳', category: 'premium', isPremium: true },
    { id: 'gold', name: 'Or', emoji: '🥇', category: 'premium', isPremium: true },
    { id: 'silver', name: 'Argent', emoji: '🥈', category: 'premium', isPremium: true },
    { id: 'bronze', name: 'Bronze', emoji: '🥉', category: 'premium', isPremium: true },
    { id: 'ring', name: 'Bague', emoji: '💍', category: 'premium', isPremium: true },
    { id: 'crown2', name: 'Couronne dorée', emoji: '👑', category: 'premium', isPremium: true },
    { id: 'star3', name: 'Étoile dorée', emoji: '⭐', category: 'premium', isPremium: true },
    { id: 'fire2', name: 'Flamme dorée', emoji: '🔥', category: 'premium', isPremium: true },
    { id: 'lightning2', name: 'Éclair doré', emoji: '⚡', category: 'premium', isPremium: true },
    { id: 'diamond2', name: 'Diamant bleu', emoji: '💎', category: 'premium', isPremium: true }
  ])
  const [selectedStickers, setSelectedStickers] = useState<Sticker[]>([])
  const [showStickers, setShowStickers] = useState(false)
  const [stickerCategory, setStickerCategory] = useState<'emotions' | 'objects' | 'symbols' | 'premium'>('emotions')
  
  // États pour stickers interactifs
  const [activeStickers, setActiveStickers] = useState<Array<{
    id: string
    sticker: Sticker
    x: number
    y: number
    scale: number
    rotation: number
    zIndex: number
  }>>([])
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  const [isDraggingSticker, setIsDraggingSticker] = useState(false)
  const [isScalingSticker, setIsScalingSticker] = useState(false)
  const [isRotatingSticker, setIsRotatingSticker] = useState(false)
  
  // États pour filtres avec intensité
  const [filterIntensity, setFilterIntensity] = useState(100)
  const [showIntensitySlider, setShowIntensitySlider] = useState(false)

  // Handlers pour stickers interactifs
  const handleStickerAdd = (sticker: Sticker) => {
    const newSticker = {
      id: `${sticker.id}-${Date.now()}`,
      sticker,
      x: 50, // Centre de l'image
      y: 50,
      scale: 1,
      rotation: 0,
      zIndex: activeStickers.length + 1
    }
    setActiveStickers([...activeStickers, newSticker])
    setSelectedStickerId(newSticker.id)
  }

  const handleStickerMouseDown = (e: React.MouseEvent, stickerId: string) => {
    e.preventDefault()
    setSelectedStickerId(stickerId)
    setIsDraggingSticker(true)
    // Logique de drag à implémenter
  }

  const handleStickerTouchStart = (e: React.TouchEvent, stickerId: string) => {
    e.preventDefault()
    setSelectedStickerId(stickerId)
    setIsDraggingSticker(true)
    // Logique de touch à implémenter
  }

  const handleFilterSelect = (filterId: string) => {
    setSelectedVisualFilter(filterId)
    setShowIntensitySlider(filterId !== 'original')
    setFilterIntensity(100)
    // Appliquer le filtre avec l'intensité
    applyVisualFilter(filterId)
  }

  // Handlers pour vidéo
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  
  // États pour l'interface Snapchat
  const [showFilterSelector, setShowFilterSelector] = useState(false)
  const [currentFilterIndex, setCurrentFilterIndex] = useState(0)
  const [isDraggingFilter, setIsDraggingFilter] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartY, setDragStartY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  // États pour validation en temps réel
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)

  // États pour error reporting
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([])
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null)
  
  // État pour l'écran caméra
  const [showCamera, setShowCamera] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const frameSelectorRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fonctions utilitaires pour le tracking des erreurs
  const trackError = useCallback((error: Omit<ErrorReport, 'id' | 'timestamp'>) => {
    const errorReport: ErrorReport = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }
    setErrorReports(prev => [...prev, errorReport])
  }, [])

  // Validation en temps réel
  const validateFile = useCallback(async (file: File): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
    const errors: string[] = []
    const warnings: string[] = []

    // Validation de la taille
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      errors.push(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB > 100MB)`)
    } else if (file.size > 50 * 1024 * 1024) {
      warnings.push(`Fichier volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB) - upload plus lent`)
    }

    // Validation du type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Format non supporté: ${file.type}`)
    }

    // Validation des dimensions pour les images
    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await getImageDimensions(file)
        if (dimensions.width < 100 || dimensions.height < 100) {
          warnings.push('Image de faible résolution - qualité réduite')
        }
        if (dimensions.width > 4000 || dimensions.height > 4000) {
          warnings.push('Image très haute résolution - traitement plus long')
        }
      } catch (error) {
        warnings.push('Impossible de valider les dimensions de l\'image')
      }
    }

    // Validation de la durée pour les vidéos
    if (file.type.startsWith('video/')) {
      try {
        const duration = await getVideoDuration(file)
        if (duration > 300) { // 5 minutes
          warnings.push('Vidéo longue (>5min) - traitement plus long')
        }
        if (duration > 600) { // 10 minutes
          errors.push('Vidéo trop longue (>10min)')
        }
      } catch (error) {
        warnings.push('Impossible de valider la durée de la vidéo')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = reject
      video.src = URL.createObjectURL(file)
    })
  }

  // Fonctions pour Undo/Redo
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      title,
      tags: [...tags],
      visibility,
      premiumPrice,
      selectedFrame,
      filters: { ...filters }
    }

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newState)
      return newHistory.slice(-50) // Garder seulement les 50 dernières actions
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
    setCanUndo(true)
    setCanRedo(false)
  }, [title, tags, visibility, premiumPrice, selectedFrame, filters, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setTitle(prevState.title)
      setTags(prevState.tags)
      setVisibility(prevState.visibility)
      setPremiumPrice(prevState.premiumPrice)
      setSelectedFrame(prevState.selectedFrame)
      setFilters(prevState.filters)
      setHistoryIndex(prev => prev - 1)
      setCanUndo(historyIndex > 1)
      setCanRedo(true)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setTitle(nextState.title)
      setTags(nextState.tags)
      setVisibility(nextState.visibility)
      setPremiumPrice(nextState.premiumPrice)
      setSelectedFrame(nextState.selectedFrame)
      setFilters(nextState.filters)
      setHistoryIndex(prev => prev + 1)
      setCanUndo(true)
      setCanRedo(historyIndex < history.length - 2)
    }
  }, [history, historyIndex])

  // Fonction pour appliquer un filtre visuel
  const applyVisualFilter = useCallback(async (filterId: string) => {
    if (!selectedFile || selectedFile.type !== 'image') return

    const visualFilter = visualFilters.find(f => f.id === filterId)
    if (!visualFilter) return

    setSelectedVisualFilter(filterId)
    setIsApplyingFilter(true)
    
    if (filterId === 'original') {
      if (filteredPreviewUrl) {
        URL.revokeObjectURL(filteredPreviewUrl)
        setFilteredPreviewUrl(null)
      }
      setIsApplyingFilter(false)
      return
    }

    try {
      const newFilters = { ...filters, ...visualFilter.filters }
      const filteredUrl = await applyFilters(selectedFile.previewUrl, newFilters)
      if (filteredPreviewUrl) {
        URL.revokeObjectURL(filteredPreviewUrl)
      }
      setFilteredPreviewUrl(filteredUrl)
      setFilters(newFilters)
    } catch (error) {
      console.error('Visual filter application error:', error)
      trackError({
        type: 'processing',
        message: 'Erreur lors de l\'application du filtre visuel',
        details: { filterId, error: error instanceof Error ? error.message : String(error) },
        retryCount: 0,
        resolved: false
      })
    } finally {
      setIsApplyingFilter(false)
    }
  }, [selectedFile, visualFilters, filters, filteredPreviewUrl, trackError])

  // Fonctions pour l'interface Snapchat
  const handleFilterSwipe = useCallback((direction: 'left' | 'right') => {
    if (isApplyingFilter) return
    
    setIsSwiping(true)
    setSwipeDirection(direction)
    
    const newIndex = direction === 'left' 
      ? (currentFilterIndex + 1) % visualFilters.length
      : (currentFilterIndex - 1 + visualFilters.length) % visualFilters.length
    
    setCurrentFilterIndex(newIndex)
    const filter = visualFilters[newIndex]
    applyVisualFilter(filter.id)
    
    // Arrêter l'animation après 300ms
    setTimeout(() => {
      setIsSwiping(false)
      setSwipeDirection(null)
    }, 300)
  }, [currentFilterIndex, visualFilters, applyVisualFilter, isApplyingFilter])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDraggingFilter(true)
    setDragStartX(e.touches[0].clientX)
    setDragStartY(e.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingFilter) return
    e.preventDefault()
  }, [isDraggingFilter])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDraggingFilter) return
    
    const deltaX = e.changedTouches[0].clientX - dragStartX
    const deltaY = e.changedTouches[0].clientY - dragStartY
    
    // Swipe horizontal pour changer de filtre
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handleFilterSwipe('right')
      } else {
        handleFilterSwipe('left')
      }
    }
    // Swipe vers le haut pour ouvrir le sélecteur
    else if (deltaY < -50) {
      setShowFilterSelector(true)
    }
    
    setIsDraggingFilter(false)
  }, [isDraggingFilter, dragStartX, dragStartY, handleFilterSwipe])

  // Fonctions pour les filtres
  const applyFilters = useCallback(async (imageUrl: string, filterState: FilterState): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Appliquer les filtres
        ctx.filter = `
          brightness(${filterState.brightness}%)
          contrast(${filterState.contrast}%)
          saturate(${filterState.saturation}%)
          hue-rotate(${filterState.hue}deg)
          blur(${filterState.blur}px)
          sepia(${filterState.sepia}%)
        `

        ctx.drawImage(img, 0, 0)
        
        // Appliquer les filtres spéciaux
        if (filterState.vintage > 0) {
          applyVintageFilter(ctx, canvas.width, canvas.height, filterState.vintage)
        }
        if (filterState.blackwhite > 0) {
          applyBlackWhiteFilter(ctx, canvas.width, canvas.height, filterState.blackwhite)
        }

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.onerror = reject
      img.src = imageUrl
    })
  }, [])

  const applyVintageFilter = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const factor = intensity / 100

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Effet vintage (sépia + contraste)
      const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
      const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
      const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))

      data[i] = r + (newR - r) * factor
      data[i + 1] = g + (newG - g) * factor
      data[i + 2] = b + (newB - b) * factor
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const applyBlackWhiteFilter = (ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const factor = intensity / 100

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Conversion en niveaux de gris
      const gray = (r * 0.299) + (g * 0.587) + (b * 0.114)

      data[i] = r + (gray - r) * factor
      data[i + 1] = g + (gray - g) * factor
      data[i + 2] = b + (gray - b) * factor
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // Fonction de retry intelligent
  const retryUpload = useCallback(async () => {
    if (retryCount >= maxRetries) {
      trackError({
        type: 'upload',
        message: 'Nombre maximum de tentatives atteint',
        details: { retryCount, maxRetries },
        retryCount,
        resolved: false
      })
      return
    }

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    // Délai exponentiel
    const delay = retryDelay * Math.pow(2, retryCount - 1)
    
    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await handleUpload()
        setIsRetrying(false)
      } catch (error) {
        console.error('Retry failed:', error)
        setIsRetrying(false)
      }
    }, delay)
  }, [retryCount, maxRetries, retryDelay, trackError])

  // Gestion du sélection de fichier
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Nettoyer l'ancien preview
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl)
    }
    if (filteredPreviewUrl) {
      URL.revokeObjectURL(filteredPreviewUrl)
    }

    // Validation en temps réel
    setIsValidating(true)
    setValidationErrors([])
    setValidationWarnings([])

    try {
      const validation = await validateFile(file)
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        trackError({
          type: 'validation',
          message: 'Fichier invalide',
          details: { errors: validation.errors, file: { name: file.name, size: file.size, type: file.type } },
          retryCount: 0,
          resolved: false
        })
        setIsValidating(false)
        return
      }

      setValidationWarnings(validation.warnings)

      // Obtenir les dimensions pour les images
      let dimensions: { width: number; height: number } | undefined
      if (file.type.startsWith('image/')) {
        try {
          dimensions = await getImageDimensions(file)
        } catch (error) {
          console.warn('Could not get image dimensions:', error)
        }
    }

    const previewUrl = URL.createObjectURL(file)
    const mediaFile: MediaFile = {
      file,
      previewUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        dimensions,
        validation
    }

    setSelectedFile(mediaFile)
    setTitle('')
    setTags([])
    setUploadStatus('idle')
    setUploadProgress(0)
    setActiveTab('details')
      setFilteredPreviewUrl(null)
      
      // Réinitialiser l'historique
      setHistory([])
      setHistoryIndex(-1)
      setCanUndo(false)
      setCanRedo(false)

      // Sauvegarder l'état initial
      setTimeout(() => saveToHistory(), 100)

    } catch (error) {
      console.error('File validation error:', error)
      trackError({
        type: 'validation',
        message: 'Erreur lors de la validation du fichier',
        details: { error: error instanceof Error ? error.message : String(error), file: { name: file.name, size: file.size, type: file.type } },
        retryCount: 0,
        resolved: false
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Créer un événement simulé pour handleFileSelect
      const mockEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(mockEvent)
    }
  }

  // Gestion de la vidéo (fonction déjà définie plus haut)

  // Gestion des gestes de swipe pour le bottom sheet
  const handleSheetTouchStart = (e: React.TouchEvent) => {
    setIsDraggingFilter(true)
    setDragStartY(e.touches[0].clientY)
  }

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingFilter) return

    const currentY = e.touches[0].clientY
    const deltaY = dragStartY - currentY
    const windowHeight = window.innerHeight
    const newHeight = Math.min(Math.max(15, sheetHeight + (deltaY / windowHeight) * 100), 85)
    
    setSheetHeight(newHeight)
  }

  const handleSheetTouchEnd = () => {
    if (!isDraggingFilter) return
    setIsDraggingFilter(false)
    
    // Snap to nearest position (15%, 68%, 85%)
    if (sheetHeight < 40) {
      setSheetHeight(15) // Mini - voir tout le média
    } else if (sheetHeight < 75) {
      setSheetHeight(68) // Normal - position par défaut
    } else {
      setSheetHeight(85) // Max - formulaire complet
    }
  }

  // Gestion des tags
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      triggerHaptic('light')
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    triggerHaptic('light')
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Extraction de frame vidéo
  const extractFrame = (videoElement: HTMLVideoElement, time: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      const originalTime = videoElement.currentTime
      videoElement.currentTime = time
      
      const handleSeeked = () => {
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        const frameDataURL = canvas.toDataURL('image/jpeg', 0.8)
        videoElement.currentTime = originalTime
        videoElement.removeEventListener('seeked', handleSeeked)
        resolve(frameDataURL)
      }
      
      videoElement.addEventListener('seeked', handleSeeked)
    })
  }

  // Sélectionner une frame
  const selectFrame = async (time: number) => {
    if (!selectedFile || !frameSelectorRef.current) return

    try {
      triggerHaptic('light')
      const frameDataURL = await extractFrame(frameSelectorRef.current, time)
      setSelectedFrame(frameDataURL)
      setShowFrameSelector(false)
    } catch (error) {
      console.error('Erreur extraction frame:', error)
      alert('Erreur lors de l\'extraction de la frame')
    }
  }

  // Haptics feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      }
      navigator.vibrate(patterns[type])
    }
  }

  // Upload du média
  const handleUpload = async () => {
    if (!selectedFile) return

    triggerHaptic('medium')
    setUploadStatus('uploading')
    setUploadProgress(0)

    // Progress bar
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile.file)
      formData.append('title', title || selectedFile.file.name)
      formData.append('tags', JSON.stringify(tags))
      formData.append('visibility', visibility)
      if (visibility === 'PREMIUM') {
        formData.append('price', premiumPrice.toString())
      }
      if (selectedFrame) {
        formData.append('thumbnail', selectedFrame)
      }
      
      // Ajouter les filtres si appliqués
      if (filteredPreviewUrl) {
        formData.append('filters', JSON.stringify(filters))
      }
      
      // Ajouter les stickers si sélectionnés
      if (selectedStickers.length > 0) {
        formData.append('stickers', JSON.stringify(selectedStickers))
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        setUploadStatus('processing')
        
        // Transcodage simulé (~45s)
        setTimeout(() => {
          setUploadStatus('success')
          triggerHaptic('heavy')
        }, 45000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      clearInterval(progressInterval)
      setUploadStatus('error')
      
      // Tracker l'erreur
      trackError({
        type: 'upload',
        message: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'upload',
        details: { 
          error: error instanceof Error ? error.message : String(error), 
          status: (error as any)?.status,
          retryCount
        },
        retryCount,
        resolved: false
      })

      triggerHaptic('heavy')
    }
  }

  // Fonctions pour les filtres
  const handleFilterChange = useCallback(async (filterType: FilterType, value: number) => {
    const newFilters = { ...filters, [filterType]: value }
    setFilters(newFilters)
    
    if (selectedFile && selectedFile.type === 'image') {
      try {
        const filteredUrl = await applyFilters(selectedFile.previewUrl, newFilters)
        if (filteredPreviewUrl) {
          URL.revokeObjectURL(filteredPreviewUrl)
        }
        setFilteredPreviewUrl(filteredUrl)
      } catch (error) {
        console.error('Filter application error:', error)
        trackError({
          type: 'processing',
          message: 'Erreur lors de l\'application du filtre',
          details: { filterType, value, error: error instanceof Error ? error.message : String(error) },
          retryCount: 0,
          resolved: false
        })
      }
    }
  }, [filters, selectedFile, filteredPreviewUrl, applyFilters, trackError])

  const resetFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      vintage: 0,
      blackwhite: 0
    }
    setFilters(defaultFilters)
    if (filteredPreviewUrl) {
      URL.revokeObjectURL(filteredPreviewUrl)
      setFilteredPreviewUrl(null)
    }
  }, [filteredPreviewUrl])

  // Fonction pour optimiser la mémoire
  const cleanupMemory = useCallback(() => {
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl)
    }
    if (filteredPreviewUrl) {
      URL.revokeObjectURL(filteredPreviewUrl)
    }
    if (selectedFrame) {
      URL.revokeObjectURL(selectedFrame)
    }
  }, [selectedFile, filteredPreviewUrl, selectedFrame])

  // Handler pour la capture vidéo
  const handleVideoCapture = (videoBlob: Blob) => {
    console.log('🎬 handleVideoCapture appelé avec blob:', videoBlob.size, 'bytes')
    // Créer un fichier à partir du blob
    const videoFile = new File([videoBlob], `video-${Date.now()}.webm`, { type: 'video/webm' })
    
    // Nettoyer l'ancien preview
    if (selectedFile?.previewUrl) {
      URL.revokeObjectURL(selectedFile.previewUrl)
    }
    if (filteredPreviewUrl) {
      URL.revokeObjectURL(filteredPreviewUrl)
    }

    const previewUrl = URL.createObjectURL(videoFile)
    const mediaFile: MediaFile = {
      file: videoFile,
      previewUrl,
      type: 'video',
      size: videoFile.size,
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      }
    }

    setSelectedFile(mediaFile)
    setTitle('')
    setTags([])
    setUploadStatus('idle')
    setUploadProgress(0)
    setActiveTab('details')
    setFilteredPreviewUrl(null)
    
    // Réinitialiser l'historique
    setHistory([])
    setHistoryIndex(-1)
    setCanUndo(false)
    setCanRedo(false)
    
    // Fermer la caméra après la capture
    setShowCamera(false)
    
    console.log('✅ Vidéo ajoutée à la page principale, selectedFile:', mediaFile.type, mediaFile.size, 'bytes')

    // Sauvegarder l'état initial
    setTimeout(() => saveToHistory(), 100)
  }

  // Reset
  const resetUpload = () => {
    cleanupMemory()
    setSelectedFile(null)
    setTitle('')
    setTags([])
    setVisibility('PUBLIC')
    setPremiumPrice(10)
    setUploadStatus('idle')
    setUploadProgress(0)
    setActiveTab('details')
    setIsPlaying(false)
    setVideoDuration(0)
    setCurrentTime(0)
    setSelectedFrame(null)
    setShowFrameSelector(false)
    setFilteredPreviewUrl(null)
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      vintage: 0,
      blackwhite: 0
    })
    setSelectedVisualFilter('original')
    setSelectedStickers([])
    setShowStickers(false)
    setStickerCategory('emotions')
    setHistory([])
    setHistoryIndex(-1)
    setCanUndo(false)
    setCanRedo(false)
    setRetryCount(0)
    setValidationErrors([])
    setValidationWarnings([])
    setErrorReports([])
    setShowErrorDetails(false)
    setSelectedError(null)
    
    // Nettoyer les timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
      validationTimeoutRef.current = null
    }
  }

  // Sauvegardes automatiques pour Undo/Redo
  useEffect(() => {
    if (selectedFile) {
      const timeoutId = setTimeout(() => {
        saveToHistory()
      }, 1000) // Sauvegarder 1 seconde après le changement
      return () => clearTimeout(timeoutId)
    }
  }, [title, tags, visibility, premiumPrice, selectedFrame, filters, selectedFile, saveToHistory])

  // Initialiser le filtre actuel quand une image est sélectionnée
  useEffect(() => {
    if (selectedFile && selectedFile.type === 'image') {
      setCurrentFilterIndex(0)
      setSelectedVisualFilter('original')
    }
  }, [selectedFile])

  // Nettoyage de la mémoire
  useEffect(() => {
    return () => {
      cleanupMemory()
    }
  }, [cleanupMemory])

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [])

  // Masquer le footer et la navigation au montage du composant
  useEffect(() => {
    // Attendre que le DOM soit prêt
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
          <div style={{ minWidth: '44px', minHeight: '44px' }} /> {/* Spacer pour centrer le titre */}
        </div>
      </div>

      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        .slider::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 8px;
          border-radius: 4px;
        }
        
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(135deg, #FF6B9D, #B794F6);
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
        
        .slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 8px;
          border-radius: 4px;
          border: none;
        }
        
        .slider::-moz-range-thumb {
          background: linear-gradient(135deg, #FF6B9D, #B794F6);
          height: 20px;
          width: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
      `}</style>
      {/* Page principale simplifiée - juste le bouton + */}
      <div className="pt-14 flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="text-center">
          <div 
            className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => setShowCamera(true)}
          >
            <Plus className="w-16 h-16 text-white" />
          </div>
          <p className="text-white/80 text-lg font-medium">Créer du contenu</p>
          <p className="text-white/60 text-sm mt-2">Appuyez pour commencer</p>
        </div>
      </div>


      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Écran caméra */}
      {showCamera && (
        <CameraScreenTest
          onClose={() => setShowCamera(false)}
          onCapture={handleVideoCapture}
        />
      )}
    </div>
  )
}
