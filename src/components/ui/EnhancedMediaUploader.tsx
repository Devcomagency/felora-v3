'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, AlertCircle, CheckCircle, Loader2, Image as ImageIcon, Video, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { validateFileMime } from '@/lib/media/mime-validator'
import { optimizeImage, needsOptimization } from '@/lib/media/image-optimizer'
import { withRetry } from '@/lib/media/error-handler'
import { validateMediaUrl } from '@/lib/media/enhanced-cdn'

interface EnhancedMediaUploaderProps {
  onUploadSuccess: (media: UploadedMedia) => void
  onUploadError: (error: string) => void
  className?: string
  maxFiles?: number
  acceptedTypes?: string[]
  maxFileSize?: number
  enableCompression?: boolean
  enableValidation?: boolean
}

interface UploadedMedia {
  id: string
  url: string
  type: 'image' | 'video'
  size: number
  optimizedSize?: number
  compressionRatio?: number
  name: string
  thumbnail?: string
}

interface UploadFile extends File {
  id: string
  status: 'pending' | 'validating' | 'optimizing' | 'uploading' | 'success' | 'error'
  error?: string
  progress?: number
  optimizedSize?: number
  compressionRatio?: number
}

export default function EnhancedMediaUploader({
  onUploadSuccess,
  onUploadError,
  className = '',
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*'],
  maxFileSize = 50 * 1024 * 1024, // 50MB
  enableCompression = true,
  enableValidation = true
}: EnhancedMediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Gestion du drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  // Gestion des fichiers
  const handleFiles = async (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      onUploadError(`Maximum ${maxFiles} fichiers autorisés`)
      return
    }

    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      ...file,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...uploadFiles])

    // Traiter chaque fichier
    for (const file of uploadFiles) {
      await processFile(file)
    }
  }

  // Traitement d'un fichier
  const processFile = async (file: UploadFile) => {
    try {
      // 1. Validation MIME
      if (enableValidation) {
        setFileStatus(file.id, 'validating')
        const validation = await validateFileMime(file, file.type)
        
        if (!validation.isValid) {
          setFileStatus(file.id, 'error', validation.error)
          return
        }
      }

      // 2. Optimisation d'image
      if (enableCompression && needsOptimization(file)) {
        setFileStatus(file.id, 'optimizing')
        const optimized = await optimizeImage(file)
        file.optimizedSize = optimized.optimizedSize
        file.compressionRatio = optimized.compressionRatio
      }

      // 3. Upload avec retry
      setFileStatus(file.id, 'uploading')
      const uploadedMedia = await withRetry(
        () => uploadFile(file),
        `Upload ${file.name}`,
        true
      )

      setFileStatus(file.id, 'success')
      onUploadSuccess(uploadedMedia)

    } catch (error) {
      setFileStatus(file.id, 'error', error instanceof Error ? error.message : 'Erreur inconnue')
      onUploadError(error instanceof Error ? error.message : 'Erreur inconnue')
    }
  }

  // Upload d'un fichier
  const uploadFile = async (file: UploadFile): Promise<UploadedMedia> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur upload')
    }

    const data = await response.json()
    
    return {
      id: data.media.id,
      url: validateMediaUrl(data.media.url, file.type.startsWith('video/') ? 'video' : 'image'),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      size: file.size,
      optimizedSize: file.optimizedSize,
      compressionRatio: file.compressionRatio,
      name: file.name
    }
  }

  // Mise à jour du statut d'un fichier
  const setFileStatus = (fileId: string, status: UploadFile['status'], error?: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status, error }
        : file
    ))
  }

  // Suppression d'un fichier
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  // Obtention de l'icône selon le type
  const getFileIcon = (file: UploadFile) => {
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  // Obtention de la couleur selon le statut
  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      case 'uploading': return 'text-blue-500'
      case 'optimizing': return 'text-yellow-500'
      case 'validating': return 'text-purple-500'
      default: return 'text-gray-500'
    }
  }

  // Obtention de l'icône selon le statut
  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'uploading':
      case 'optimizing':
      case 'validating': return <Loader2 className="w-4 h-4 animate-spin" />
      default: return null
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zone de drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
          disabled={files.length >= maxFiles}
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Glissez-déposez vos fichiers ici
        </p>
        <p className="text-sm text-gray-500">
          ou cliquez pour sélectionner
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Max {maxFiles} fichiers • {Math.round(maxFileSize / 1024 / 1024)}MB par fichier
        </p>
      </div>

      {/* Liste des fichiers */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(file.size / 1024)} KB
                      {file.compressionRatio && (
                        <span className="ml-2 text-green-600">
                          (-{Math.round(file.compressionRatio * 100)}%)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 ${getStatusColor(file.status)}`}>
                    {getStatusIcon(file.status)}
                    <span className="text-xs capitalize">
                      {file.status === 'uploading' ? 'Envoi...' : 
                       file.status === 'optimizing' ? 'Optimisation...' :
                       file.status === 'validating' ? 'Validation...' :
                       file.status}
                    </span>
                  </div>
                  
                  {file.status === 'error' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
