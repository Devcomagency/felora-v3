'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  ArrowLeft, 
  X, 
  Play, 
  Pause, 
  Upload, 
  Hash, 
  Eye, 
  EyeOff, 
  Download,
  Globe,
  Lock,
  Crown,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  RefreshCw,
  Sparkles,
  Zap,
  Undo2,
  Redo2,
  Filter,
  Settings,
  BarChart3,
  Activity,
  Shield,
  RotateCcw,
  AlertTriangle,
  Info,
  Camera,
  Palette,
  Contrast,
  Sun,
  Moon,
  Droplets
} from 'lucide-react'

type UploadStep = 'details' | 'filters' | 'visibility' | 'publish'
type VisibilityType = 'PUBLIC' | 'PRIVATE' | 'PREMIUM'
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error' | 'retrying'
type FilterType = 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur' | 'sepia' | 'vintage' | 'blackwhite'

interface MediaFile {
  file: File
  previewUrl: string
  type: 'image' | 'video'
  duration?: number
  size: number
  dimensions?: { width: number; height: number }
  validation?: {
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
}

interface HistoryState {
  id: string
  timestamp: number
  title: string
  tags: string[]
  visibility: VisibilityType
  premiumPrice: number
  selectedFrame: string | null
  filters: FilterState
}

interface FilterState {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
  sepia: number
  vintage: number
  blackwhite: number
}

interface VisualFilter {
  id: string
  name: string
  icon: string
  preview: string
  filters: Partial<FilterState>
}

interface ErrorReport {
  id: string
  timestamp: number
  type: 'upload' | 'validation' | 'processing' | 'network'
  message: string
  details: any
  retryCount: number
  resolved: boolean
}

interface PerformanceMetrics {
  uploadStartTime: number
  uploadEndTime: number
  processingStartTime: number
  processingEndTime: number
  totalSize: number
  retryCount: number
  errorCount: number
  successRate: number
}

interface AnalyticsData {
  interactions: {
    fileSelect: number
    filterApplied: number
    undoRedo: number
    retryAttempt: number
    publishAttempt: number
  }
  performance: PerformanceMetrics
  errors: ErrorReport[]
}

export default function TestMediaSimplePage() {
  // États principaux
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [activeTab, setActiveTab] = useState<UploadStep>('details')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sheetHeight, setSheetHeight] = useState(68) // Position par défaut
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  
  // États du formulaire
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('PUBLIC')
  const [premiumPrice, setPremiumPrice] = useState(10)

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
    }
  ])
  const [selectedVisualFilter, setSelectedVisualFilter] = useState<string>('original')

  // États pour validation en temps réel
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)

  // États pour error reporting
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([])
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null)

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
    
    if (filterId === 'original') {
      if (filteredPreviewUrl) {
        URL.revokeObjectURL(filteredPreviewUrl)
        setFilteredPreviewUrl(null)
      }
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
    }
  }, [selectedFile, visualFilters, filters, filteredPreviewUrl, trackError])

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
  const handleFileSelect = async (files: FileList | null) => {
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
    handleFileSelect(e.dataTransfer.files)
  }

  // Gestion de la vidéo
  const togglePlayPause = () => {
    if (!videoRef.current || !selectedFile) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
    triggerHaptic('light')
  }

  // Gestion des gestes de swipe pour le bottom sheet
  const handleSheetTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
  }

  const handleSheetTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const currentY = e.touches[0].clientY
    const deltaY = dragStartY - currentY
    const windowHeight = window.innerHeight
    const newHeight = Math.min(Math.max(15, sheetHeight + (deltaY / windowHeight) * 100), 85)
    
    setSheetHeight(newHeight)
  }

  const handleSheetTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
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

  return (
    <div>
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
      <div 
        className="min-h-screen text-white overflow-hidden"
        style={{ 
          backgroundColor: '#0B0B0B',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
      {/* Header translucide (56px) */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between h-full px-4 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Boutons Undo/Redo */}
            {selectedFile && (
              <div className="flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-2 text-white/60 hover:text-white disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                  title="Annuler"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-2 text-white/60 hover:text-white disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                  title="Rétablir"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <h1 className="text-lg font-semibold text-white/90">
            Publier une vidéo
          </h1>
          
          <button
            onClick={resetUpload}
            className="text-white/90 hover:text-white transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Zone Preview (ratio 9:16, arrondi 16) */}
      <div className="fixed top-14 left-0 right-0 z-40 px-4">
        <div 
          className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <>
              {selectedFile.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={selectedFile.previewUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setVideoDuration(videoRef.current.duration)
                    }
                  }}
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime)
                    }
                  }}
                />
              ) : (
                <img
                  src={selectedFile.previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay gradient bas (lisibilité) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Indicateurs de validation */}
              {isValidating && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 text-white/90">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Validation en cours...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Erreurs de validation */}
              {validationErrors.length > 0 && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
                    <div className="flex items-center gap-2 text-red-300 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Erreurs de validation</span>
                    </div>
                    <div className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <p key={index} className="text-xs text-red-200">{error}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Avertissements de validation */}
              {validationWarnings.length > 0 && !validationErrors.length && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30">
                    <div className="flex items-center gap-2 text-yellow-300 mb-2">
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">Avertissements</span>
                    </div>
                    <div className="space-y-1">
                      {validationWarnings.map((warning, index) => (
                        <p key={index} className="text-xs text-yellow-200">{warning}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton Filtres pour les images */}
              {selectedFile && selectedFile.type === 'image' && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setActiveTab('filters')}
                    className="bg-black/40 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/60 transition-colors"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                    title="Filtres"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bouton play/pause au centre */}
              {selectedFile.type === 'video' && (
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </div>
                </button>
              )}

              {/* Scrubber miniature (barre fine + timecode) */}
              {selectedFile.type === 'video' && videoDuration > 0 && (
                <div className="absolute bottom-16 left-4 right-4">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-white/90 mb-2">
                      <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
                      <span>{Math.floor(videoDuration / 60)}:{(videoDuration % 60).toFixed(0).padStart(2, '0')}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] h-1 rounded-full transition-all duration-100"
                        style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress bar d'upload (jauge fine sous la Preview) */}
              {uploadStatus === 'uploading' && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2">
                    <div className="flex items-center justify-between text-xs text-white/90 mb-1">
                      <span>Upload en cours...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status overlay */}
              {uploadStatus === 'processing' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[#4FD1C7] animate-spin mx-auto mb-2" />
                    <p className="text-sm text-white/90">Traitement en cours (~45s)</p>
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-white/90">Vidéo publiée</p>
                    <p className="text-xs text-white/70 mt-1">Visible après traitement</p>
                    <button
                      onClick={() => {
                        triggerHaptic('light')
                        resetUpload()
                      }}
                      className="mt-3 px-4 py-2 bg-[#4FD1C7] text-black rounded-lg text-xs font-medium hover:bg-[#4FD1C7]/80 transition-colors"
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    >
                      Nouveau média
              </button>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-white/90">Erreur d'upload</p>
                    <p className="text-xs text-white/70 mb-3">
                      Tentative {retryCount}/{maxRetries}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={retryUpload}
                        disabled={retryCount >= maxRetries || isRetrying}
                        className="px-4 py-2 bg-[#4FD1C7] text-black rounded-lg text-xs font-medium hover:bg-[#4FD1C7]/80 disabled:bg-gray-500/50 disabled:cursor-not-allowed transition-colors"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        {isRetrying ? (
                          <div className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Retry...
                          </div>
                        ) : (
                          'Réessayer'
                        )}
                      </button>
                      <button
                        onClick={() => setUploadStatus('idle')}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg text-xs font-medium hover:bg-white/30 transition-colors"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Zone de drop vide */
            <div 
              className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:border-[#FF6B9D] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-white/40 mb-4" />
              <p className="text-white/60 text-sm mb-2">Glissez votre fichier ici</p>
              <p className="text-white/40 text-xs">ou cliquez pour sélectionner</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet (glassmorphism, 64-72% hauteur) */}
      <div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-t border-white/10 rounded-t-3xl transition-all duration-300 ease-out"
        style={{ 
          height: `${sheetHeight}%`,
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
        onTouchStart={handleSheetTouchStart}
        onTouchMove={handleSheetTouchMove}
        onTouchEnd={handleSheetTouchEnd}
      >
        {/* Handle pour swipe */}
        <div className="flex justify-center pt-3 pb-2 touch-none">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Tabs condensées: Détails · Filtres · Visibilité · Publier */}
        <div className="flex px-4 border-b border-white/10 overflow-x-auto">
          {(['details', 'filters', 'visibility', 'publish'] as UploadStep[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                triggerHaptic('light')
                setActiveTab(tab)
              }}
              className={`flex-shrink-0 flex items-center justify-center gap-2 py-3 px-3 text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'border-b-2 border-[#FF6B9D] text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              {tab === 'details' && 'Détails'}
              {tab === 'filters' && (
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtres</span>
                </div>
              )}
              {tab === 'visibility' && 'Visibilité'}
              {tab === 'publish' && 'Publier'}
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Titre (max 60) */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Donnez un titre à votre vidéo"
                  maxLength={60}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#4FD1C7] focus:ring-2 focus:ring-[#4FD1C7]/20 transition-all"
                  style={{ minHeight: '44px' }}
                />
                <p className="text-xs text-white/50 mt-1">{title.length}/60</p>
              </div>

              {/* #Tags (chips + auto-complétion) */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ajoutez des #tags (ex. #Genève #Afterwork)"
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#4FD1C7] focus:ring-2 focus:ring-[#4FD1C7]/20 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    style={{ minHeight: '44px' }}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-3 bg-[#4FD1C7] text-black rounded-xl font-medium hover:bg-[#4FD1C7]/80 transition-colors"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Hash className="w-4 h-4" />
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-[#FF6B9D]/20 text-[#FF6B9D] px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-[#FF6B9D]/70"
                          style={{ minWidth: '20px', minHeight: '20px' }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Miniature (auto + "Choisir une frame") */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Miniature
                </label>
                <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                  {selectedFile && selectedFile.type === 'video' ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-xs mx-auto">
                        {selectedFrame ? (
                          <img
                            src={selectedFrame}
                            alt="Frame sélectionnée"
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={selectedFile.previewUrl}
                            className="w-full h-24 object-cover rounded-lg"
                            muted
                            poster={selectedFile.previewUrl}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              triggerHaptic('light')
                              setShowFrameSelector(true)
                            }}
                            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs hover:bg-white/30 transition-colors"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                          >
                            {selectedFrame ? 'Changer la frame' : 'Choisir une frame'}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-white/60 text-center">
                        {selectedFrame ? '🎯 Frame personnalisée sélectionnée' : '🔄 Miniature auto-générée • Cliquez pour changer'}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-sm text-white/70">Miniature auto-générée</p>
                      <p className="text-xs text-white/50 mt-1">À partir de votre image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visibility' && (
            <div className="space-y-6">
              {/* Radio cards: Publique / Privée / Premium */}
              <div className="space-y-3">
                {[
                  {
                    key: 'PUBLIC',
                    title: 'Publique',
                    description: 'Feed, profil public, recherche',
                    icon: Globe,
                    color: 'bg-[#FF6B9D]/15 text-[#FF6B9D] border-[#FF6B9D]/30'
                  },
                  {
                    key: 'PRIVATE',
                    title: 'Privée',
                    description: 'Visible seulement pour vous / liens sécurisés',
                    icon: Lock,
                    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  },
                  {
                    key: 'PREMIUM',
                    title: 'Premium',
                    description: 'Accès payant / abonnés',
                    icon: Crown,
                    color: 'bg-[#4FD1C7]/15 text-[#4FD1C7] border-[#4FD1C7]/30'
                  }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => {
                      triggerHaptic('light')
                      setVisibility(option.key as VisibilityType)
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      visibility === option.key
                        ? `${option.color} border-opacity-100`
                        : 'bg-white/5 border-white/20 hover:border-white/30'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <option.icon className="w-5 h-5" />
                      <span className="font-medium">{option.title}</span>
                    </div>
                    <p className="text-sm text-white/70">{option.description}</p>
                  </button>
                ))}
              </div>

              {/* Prix pour médias premium */}
              {visibility === 'PREMIUM' && (
                <div className="bg-[#4FD1C7]/10 border border-[#4FD1C7]/30 rounded-xl p-4">
                  <label className="block text-sm font-medium text-[#4FD1C7] mb-3">
                    Prix en diamants
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={premiumPrice}
                      onChange={(e) => setPremiumPrice(parseInt(e.target.value) || 10)}
                      className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#4FD1C7] focus:ring-2 focus:ring-[#4FD1C7]/20 transition-all w-24"
                      style={{ minHeight: '44px' }}
                    />
                    <div className="flex items-center gap-2 text-[#4FD1C7]">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">diamants</span>
            </div>
          </div>
        </div>
              )}

            </div>
          )}

          {activeTab === 'filters' && selectedFile && selectedFile.type === 'image' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Filtres Visuels</h3>
                <p className="text-sm text-white/70">Choisissez un style pour votre image</p>
              </div>

              {/* Grille de filtres visuels */}
              <div className="grid grid-cols-2 gap-4">
                {visualFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => applyVisualFilter(filter.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedVisualFilter === filter.id
                        ? 'border-[#FF6B9D] bg-[#FF6B9D]/10'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                    }`}
                    style={{ minHeight: '80px' }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{filter.icon}</div>
                      <div className="text-sm font-medium text-white/90">{filter.name}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Aperçu du filtre sélectionné */}
              {selectedVisualFilter !== 'original' && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-md font-medium text-white/90 mb-3">Aperçu du filtre</h4>
                  <div className="relative w-full h-32 bg-black rounded-lg overflow-hidden">
                    {filteredPreviewUrl ? (
                      <img
                        src={filteredPreviewUrl}
                        alt="Aperçu du filtre"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Boutons de contrôle */}
              <div className="flex gap-3">
                <button
                  onClick={() => applyVisualFilter('original')}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  Original
                </button>
                <button
                  onClick={() => setActiveTab('visibility')}
                  className="flex-1 py-3 bg-[#4FD1C7] text-black rounded-xl font-medium hover:bg-[#4FD1C7]/80 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'filters' && (!selectedFile || selectedFile.type !== 'image') && (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/90 mb-2">Filtres non disponibles</h3>
              <p className="text-sm text-white/70 mb-6">
                Les filtres visuels sont uniquement disponibles pour les images
              </p>
              <button
                onClick={() => setActiveTab('details')}
                className="px-6 py-3 bg-[#4FD1C7] text-black rounded-xl font-medium hover:bg-[#4FD1C7]/80 transition-colors"
                style={{ minHeight: '44px' }}
              >
                Retour aux détails
              </button>
            </div>
          )}

          {activeTab === 'publish' && (
            <div className="space-y-6">
              {/* Bouton principal POSTER (full width, gradient rose→violet, radius 14) */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing' || validationErrors.length > 0}
                className="w-full py-4 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] hover:from-[#FF6B9D]/80 hover:to-[#B794F6]/80 disabled:from-gray-500/50 disabled:to-gray-500/50 text-white font-bold rounded-2xl transition-all duration-300 relative overflow-hidden group"
                style={{
                  borderRadius: '14px',
                  minHeight: '44px'
                }}
              >
                {uploadStatus === 'uploading' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Upload en cours... {uploadProgress > 0 && `(${Math.round(uploadProgress)}%)`}
                  </div>
                ) : uploadStatus === 'processing' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 animate-pulse" />
                    Traitement...
                  </div>
                ) : validationErrors.length > 0 ? (
                  'Erreurs de validation'
                ) : (
                  'POSTER'
                )}
              </button>

              {/* Lien secondaire "Enregistrer en brouillon" */}
              <button className="w-full py-3 text-white/70 text-sm underline hover:text-white transition-colors">
                Enregistrer en brouillon
              </button>
            </div>
          )}

            </div>
          </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Modal de sélection de frame */}
      {showFrameSelector && selectedFile && selectedFile.type === 'video' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-white/20 rounded-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Sélectionner une frame</h3>
              <button
                onClick={() => setShowFrameSelector(false)}
                className="text-white/60 hover:text-white transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-5 h-5" />
              </button>
              </div>

            {/* Vidéo pour sélection */}
            <div className="p-4">
              <video
                ref={frameSelectorRef}
                src={selectedFile.previewUrl}
                className="w-full h-48 object-cover rounded-lg mb-4"
                controls
                muted
                preload="metadata"
              />

              {/* Suggestions de frames */}
              <div className="space-y-3">
                <p className="text-sm text-white/70 mb-2">Frames suggérées :</p>
                <div className="grid grid-cols-3 gap-2">
                  {[0.1, 0.25, 0.5, 0.75, 0.9].map((ratio, index) => {
                    const time = videoDuration * ratio
                    return (
                      <button
                        key={index}
                        onClick={() => selectFrame(time)}
                        className="aspect-video bg-white/10 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        <span className="text-xs text-white/70">
                          {Math.floor(time / 60)}:{(time % 60).toFixed(0).padStart(2, '0')}
                        </span>
                      </button>
                    )
                  })}
              </div>

                {/* Bouton pour frame actuelle */}
                <button
                  onClick={() => {
                    if (frameSelectorRef.current) {
                      selectFrame(frameSelectorRef.current.currentTime)
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#FF6B9D] to-[#B794F6] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  style={{ minHeight: '44px' }}
                >
                  Sélectionner cette frame
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas caché pour les filtres */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal de détails d'erreur */}
      {showErrorDetails && selectedError && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-white/20 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Détails de l'erreur</h3>
              <button
                onClick={() => setShowErrorDetails(false)}
                className="text-white/60 hover:text-white transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Type d'erreur</label>
                <p className="text-sm text-white/70 bg-white/5 rounded-lg p-2">{selectedError.type}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Message</label>
                <p className="text-sm text-white/70 bg-white/5 rounded-lg p-2">{selectedError.message}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Horodatage</label>
                <p className="text-sm text-white/70 bg-white/5 rounded-lg p-2">
                  {new Date(selectedError.timestamp).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Tentatives de retry</label>
                <p className="text-sm text-white/70 bg-white/5 rounded-lg p-2">{selectedError.retryCount}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Détails techniques</label>
                <pre className="text-xs text-white/70 bg-white/5 rounded-lg p-2 overflow-x-auto">
                  {JSON.stringify(selectedError.details, null, 2)}
                </pre>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowErrorDetails(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setSelectedError(null)
                    setShowErrorDetails(false)
                  }}
                  className="flex-1 py-3 bg-red-500/20 text-red-300 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  Marquer comme résolu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}