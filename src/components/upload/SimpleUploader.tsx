'use client'

import { useState, useRef } from 'react'
import * as tus from 'tus-js-client'
import { Upload, CheckCircle2, XCircle, Loader2, Play, Pause } from 'lucide-react'

interface SimpleUploaderProps {
  onComplete?: (files: UploadedFile[]) => void
  maxFileSize?: number
  allowedFileTypes?: string[]
  endpoint?: string
}

interface UploadedFile {
  name: string
  size: number
  url?: string
  assetId?: string // Livepeer asset ID après transcodage
  playbackId?: string // Livepeer playback ID
  status?: 'uploading' | 'transcoding' | 'ready' | 'failed'
}

interface FileUpload {
  file: File
  upload: tus.Upload | null
  progress: number
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error'
  error?: string
}

export default function SimpleUploader({
  onComplete,
  maxFileSize = 500 * 1024 * 1024,
  allowedFileTypes = ['video/*', 'image/*'],
  endpoint = '/api/upload/tus'
}: SimpleUploaderProps) {
  const [uploads, setUploads] = useState<Map<string, FileUpload>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newUploads = new Map(uploads)

    Array.from(files).forEach((file) => {
      // Vérifier la taille
      if (file.size > maxFileSize) {
        alert(`Fichier trop volumineux: ${file.name} (max ${maxFileSize / (1024 * 1024)}MB)`)
        return
      }

      const fileId = `${file.name}-${Date.now()}`
      newUploads.set(fileId, {
        file,
        upload: null,
        progress: 0,
        status: 'pending'
      })
    })

    setUploads(newUploads)

    // Auto-start upload
    newUploads.forEach((fileUpload, fileId) => {
      if (fileUpload.status === 'pending') {
        startUpload(fileId, fileUpload)
      }
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startUpload = (fileId: string, fileUpload: FileUpload) => {
    const upload = new tus.Upload(fileUpload.file, {
      endpoint,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      chunkSize: 5 * 1024 * 1024, // 5MB
      metadata: {
        filename: fileUpload.file.name,
        filetype: fileUpload.file.type
      },
      onError: (error) => {
        console.error('❌ Erreur upload:', error)
        setUploads(prev => {
          const updated = new Map(prev)
          const upload = updated.get(fileId)
          if (upload) {
            upload.status = 'error'
            upload.error = error.message
            updated.set(fileId, upload)
          }
          return updated
        })
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100)
        setUploads(prev => {
          const updated = new Map(prev)
          const upload = updated.get(fileId)
          if (upload) {
            upload.progress = percentage
            upload.status = 'uploading'
            updated.set(fileId, upload)
          }
          return updated
        })
      },
      onSuccess: async () => {
        console.log('✅ Upload réussi:', fileUpload.file.name)

        // Pour l'instant, on désactive le transcodage Livepeer
        // (nécessite configuration spécifique upload direct vers Livepeer)
        const isVideo = fileUpload.file.type.startsWith('video/')

        if (isVideo) {
          console.log('🎬 Vidéo uploadée (transcodage désactivé temporairement)')
        }

        // Marquer comme complété
        setUploads(prev => {
          const updated = new Map(prev)
          const upload = updated.get(fileId)
          if (upload) {
            upload.status = 'completed'
            upload.progress = 100
            updated.set(fileId, upload)
          }
          return updated
        })

        // Appeler onComplete
        if (onComplete) {
          onComplete([{
            name: fileUpload.file.name,
            size: fileUpload.file.size,
            url: upload.url || undefined,
            status: 'ready'
          }])
        }

        // Code original pour images (gardé pour compatibilité)
        if (false) {
          // Image, pas de transcodage
          setUploads(prev => {
            const updated = new Map(prev)
            const upload = updated.get(fileId)
            if (upload) {
              upload.status = 'completed'
              upload.progress = 100
              updated.set(fileId, upload)
            }
            return updated
          })

          if (onComplete) {
            onComplete([{
              name: fileUpload.file.name,
              size: fileUpload.file.size,
              url: upload.url || undefined,
              status: 'ready'
            }])
          }
        }
      }
    })

    // Démarrer l'upload
    upload.start()

    // Mettre à jour la référence
    setUploads(prev => {
      const updated = new Map(prev)
      const fileUpload = updated.get(fileId)
      if (fileUpload) {
        fileUpload.upload = upload
        fileUpload.status = 'uploading'
        updated.set(fileId, fileUpload)
      }
      return updated
    })
  }

  const pauseUpload = (fileId: string) => {
    const fileUpload = uploads.get(fileId)
    if (fileUpload?.upload) {
      fileUpload.upload.abort()
      setUploads(prev => {
        const updated = new Map(prev)
        const upload = updated.get(fileId)
        if (upload) {
          upload.status = 'paused'
          updated.set(fileId, upload)
        }
        return updated
      })
    }
  }

  const resumeUpload = (fileId: string) => {
    const fileUpload = uploads.get(fileId)
    if (fileUpload?.upload) {
      fileUpload.upload.start()
      setUploads(prev => {
        const updated = new Map(prev)
        const upload = updated.get(fileId)
        if (upload) {
          upload.status = 'uploading'
          updated.set(fileId, upload)
        }
        return updated
      })
    }
  }

  const removeUpload = (fileId: string) => {
    const fileUpload = uploads.get(fileId)
    if (fileUpload?.upload) {
      fileUpload.upload.abort()
    }
    setUploads(prev => {
      const updated = new Map(prev)
      updated.delete(fileId)
      return updated
    })
  }

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className="relative border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center
                   bg-gradient-to-br from-purple-500/5 to-pink-500/5
                   hover:border-purple-500/60 hover:bg-purple-500/10 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Upload className="text-white" size={32} />
          </div>
          <div>
            <div className="text-lg font-semibold mb-1">
              Cliquez pour sélectionner des fichiers
            </div>
            <div className="text-sm text-gray-400">
              Vidéos et images • Max {maxFileSize / (1024 * 1024)}MB par fichier
            </div>
          </div>
        </div>
      </div>

      {/* Liste des uploads */}
      {uploads.size > 0 && (
        <div className="space-y-2">
          {Array.from(uploads.entries()).map(([fileId, fileUpload]) => (
            <div
              key={fileId}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Icône de statut */}
                <div className="flex-shrink-0">
                  {fileUpload.status === 'uploading' && (
                    <Loader2 className="text-blue-400 animate-spin" size={20} />
                  )}
                  {fileUpload.status === 'completed' && (
                    <CheckCircle2 className="text-green-400" size={20} />
                  )}
                  {fileUpload.status === 'error' && (
                    <XCircle className="text-red-400" size={20} />
                  )}
                  {fileUpload.status === 'paused' && (
                    <Pause className="text-yellow-400" size={20} />
                  )}
                  {fileUpload.status === 'pending' && (
                    <Upload className="text-gray-400" size={20} />
                  )}
                </div>

                {/* Info fichier */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{fileUpload.file.name}</div>
                  <div className="text-xs text-gray-400">
                    {(fileUpload.file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {fileUpload.status === 'uploading' && (
                    <button
                      onClick={() => pauseUpload(fileId)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Pause size={16} />
                    </button>
                  )}
                  {fileUpload.status === 'paused' && (
                    <button
                      onClick={() => resumeUpload(fileId)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => removeUpload(fileId)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${fileUpload.progress}%` }}
                />
              </div>

              {/* Message d'erreur */}
              {fileUpload.error && (
                <div className="mt-2 text-xs text-red-400">
                  {fileUpload.error}
                </div>
              )}

              {/* Pourcentage */}
              <div className="mt-1 text-xs text-gray-400 text-right">
                {fileUpload.progress}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
