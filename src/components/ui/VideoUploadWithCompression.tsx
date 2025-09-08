"use client"

import React, { useState, useRef } from 'react'
import { Upload, Video, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { videoCompressor, CompressionResult } from '@/lib/video-compression'

interface VideoUploadProps {
  onUpload: (file: File) => Promise<void>
  slot: number
  currentVideoUrl?: string
  isPrivate?: boolean
  maxSizeMB?: number
}

interface CompressionState {
  isCompressing: boolean
  progress: number
  result?: CompressionResult
  error?: string
}

export default function VideoUploadWithCompression({
  onUpload,
  slot,
  currentVideoUrl,
  isPrivate = false,
  maxSizeMB = 3.8
}: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [compressionState, setCompressionState] = useState<CompressionState>({
    isCompressing: false,
    progress: 0
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('video/')) return

    const fileSizeMB = file.size / (1024 * 1024)
    
    if (fileSizeMB <= maxSizeMB) {
      // Fichier déjà assez petit, upload direct
      await handleUpload(file)
      return
    }

    // Fichier trop gros, compression nécessaire
    await compressAndUpload(file)
  }

  const compressAndUpload = async (originalFile: File) => {
    try {
      setCompressionState({
        isCompressing: true,
        progress: 10,
        error: undefined
      })

      // Prévisualisation
      const preview = await videoCompressor.previewCompression(originalFile)
      console.log('📊 Compression prévue:', {
        originalSize: (originalFile.size / (1024 * 1024)).toFixed(1) + 'MB',
        estimatedSize: (preview.estimatedSize / (1024 * 1024)).toFixed(1) + 'MB',
        estimatedReduction: preview.estimatedCompressionRatio + '%'
      })

      setCompressionState(prev => ({ ...prev, progress: 30 }))

      // Compression
      const result = await videoCompressor.compressVideo(originalFile, {
        maxSizeMB: maxSizeMB,
        quality: 0.85,
        maxWidthOrHeight: 1080
      })

      setCompressionState({
        isCompressing: false,
        progress: 100,
        result
      })

      console.log('✅ Compression terminée:', {
        originalSize: (result.originalSize / (1024 * 1024)).toFixed(1) + 'MB',
        compressedSize: (result.compressedSize / (1024 * 1024)).toFixed(1) + 'MB',
        reduction: result.compressionRatio + '%',
        duration: (result.duration / 1000).toFixed(1) + 's'
      })

      // Upload du fichier compressé
      await handleUpload(result.file)

    } catch (error) {
      console.error('❌ Erreur compression:', error)
      setCompressionState({
        isCompressing: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Erreur de compression'
      })
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true)
      await onUpload(file)
    } catch (error) {
      console.error('❌ Erreur upload:', error)
    } finally {
      setIsUploading(false)
      // Reset des états
      setCompressionState({
        isCompressing: false,
        progress: 0
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={compressionState.isCompressing || isUploading}
      />
      
      <div className="aspect-video bg-gradient-to-br from-black/20 to-black/40 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all flex flex-col items-center justify-center p-4 min-h-[200px]">
        
        {/* Vidéo actuelle */}
        {currentVideoUrl && !compressionState.isCompressing && !isUploading && (
          <video
            src={currentVideoUrl}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
            controls
            muted
          />
        )}
        
        {/* État compression */}
        {compressionState.isCompressing && (
          <div className="flex flex-col items-center gap-4 text-center z-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <div className="text-white">
              <p className="font-medium">Compression en cours...</p>
              <div className="w-32 h-2 bg-white/20 rounded-full mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${compressionState.progress}%` }}
                />
              </div>
              <p className="text-sm text-white/60 mt-1">{compressionState.progress}%</p>
            </div>
          </div>
        )}

        {/* Résultat compression */}
        {compressionState.result && !isUploading && (
          <div className="absolute inset-0 bg-black/80 rounded-xl flex flex-col items-center justify-center p-4 text-center z-20">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-white font-medium mb-2">Compression réussie !</p>
            <div className="text-sm text-white/80">
              <p>{formatFileSize(compressionState.result.originalSize)} → {formatFileSize(compressionState.result.compressedSize)}</p>
              <p className="text-green-400">{compressionState.result.compressionRatio}% de réduction</p>
            </div>
          </div>
        )}

        {/* État upload */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/80 rounded-xl flex flex-col items-center justify-center text-center z-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
            <p className="text-white font-medium">Upload en cours...</p>
          </div>
        )}

        {/* Erreur */}
        {compressionState.error && (
          <div className="absolute inset-0 bg-red-900/80 rounded-xl flex flex-col items-center justify-center p-4 text-center z-20">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-white font-medium mb-1">Erreur de compression</p>
            <p className="text-red-200 text-sm">{compressionState.error}</p>
          </div>
        )}

        {/* Interface par défaut */}
        {!currentVideoUrl && !compressionState.isCompressing && !isUploading && !compressionState.result && (
          <div className="flex flex-col items-center gap-3 text-center z-20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <p className="font-medium">Slot {slot + 1} - Vidéo</p>
              <p className="text-sm text-white/60">
                {isPrivate ? 'Privée' : 'Publique'} • Max {maxSizeMB}MB
              </p>
              <p className="text-xs text-white/40 mt-1">
                Compression automatique si nécessaire
              </p>
            </div>
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">
              {currentVideoUrl ? 'Remplacer' : 'Ajouter'} vidéo
            </span>
          </div>
        </div>
      </div>

      {/* Info compression */}
      <div className="mt-2 text-xs text-white/60 text-center">
        <p>Formats supportés : MP4, MOV, AVI, WebM</p>
        <p>Compression intelligente pour optimiser la qualité</p>
      </div>
    </div>
  )
}