'use client'

import { useState, useCallback } from 'react'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { toast } from 'sonner'

interface R2UploadClientProps {
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSize?: number // en MB
  className?: string
  children?: React.ReactNode
}

export function R2UploadClient({
  onUploadComplete,
  onUploadError,
  accept = 'image/*',
  maxSize = 10,
  className = '',
  children
}: R2UploadClientProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const isR2UploadEnabled = useFeatureFlag('FEATURE_UPLOAD')

  const handleFileSelect = useCallback(async (file: File) => {
    if (!isR2UploadEnabled) {
      toast.error('Upload R2 non activé')
      return
    }

    // Validation du fichier
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max ${maxSize}MB)`)
      return
    }

    if (!file.type.match(accept)) {
      toast.error('Type de fichier non supporté')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 1. Obtenir l'URL de presign
      const presignResponse = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      })

      if (!presignResponse.ok) {
        throw new Error('Erreur lors de la génération de l\'URL de presign')
      }

      const { uploadUrl, fileKey } = await presignResponse.json()

      // 2. Upload vers R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload vers R2')
      }

      // 3. Confirmer l'upload
      const confirmResponse = await fetch('/api/media/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      })

      if (!confirmResponse.ok) {
        throw new Error('Erreur lors de la confirmation de l\'upload')
      }

      const { publicUrl } = await confirmResponse.json()

      setUploadProgress(100)
      toast.success('Upload réussi!')
      
      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'upload'
      toast.error(errorMessage)
      
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [isR2UploadEnabled, maxSize, accept, onUploadComplete, onUploadError])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  if (!isR2UploadEnabled) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <p className="text-sm text-gray-500">
          Upload R2 non disponible (canary uniquement)
        </p>
      </div>
    )
  }

  return (
    <div
      className={`relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${className}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      
      {isUploading ? (
        <div className="space-y-2">
          <div 
            className="w-8 h-8 mx-auto animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
          />
          <p className="text-sm text-gray-600">
            Upload en cours... {uploadProgress}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {children || (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm text-gray-600">
                Glissez-déposez un fichier ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-500">
                Max {maxSize}MB • {accept}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default R2UploadClient
