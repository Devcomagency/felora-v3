'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface DirectUploaderProps {
  onComplete?: (files: UploadedFile[]) => void
  maxFileSize?: number
  allowedFileTypes?: string[]
  externalFile?: File | null // Fichier venant de la caméra
}

interface UploadedFile {
  name: string
  size: number
  url: string
  type: string
}

interface FileUploadState {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  url?: string
}

/**
 * Uploader simple qui upload directement vers Cloudflare R2
 * Compatible Vercel serverless (pas de filesystem)
 */
export default function DirectUploader({
  onComplete,
  maxFileSize = 500 * 1024 * 1024,
  allowedFileTypes = ['video/*', 'image/*'],
  externalFile
}: DirectUploaderProps) {
  const [uploads, setUploads] = useState<Map<string, FileUploadState>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload automatique du fichier externe (depuis caméra)
  useEffect(() => {
    if (externalFile) {
      console.log('📹 Upload automatique du fichier capturé:', externalFile.name)

      const fileId = `${externalFile.name}-${Date.now()}`

      setUploads(prev => {
        const newUploads = new Map(prev)
        newUploads.set(fileId, {
          file: externalFile,
          progress: 0,
          status: 'pending'
        })
        return newUploads
      })

      // Attendre que l'état soit mis à jour avant d'uploader
      setTimeout(() => {
        uploadFile(fileId, externalFile, new Map([[fileId, { file: externalFile, progress: 0, status: 'pending' }]]))
      }, 0)
    }
  }, [externalFile])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newUploads = new Map(uploads)

    for (const file of Array.from(files)) {
      // Vérifier la taille
      if (file.size > maxFileSize) {
        alert(`Fichier trop volumineux: ${file.name} (max ${maxFileSize / (1024 * 1024)}MB)`)
        continue
      }

      const fileId = `${file.name}-${Date.now()}`
      newUploads.set(fileId, {
        file,
        progress: 0,
        status: 'pending'
      })

      // Démarrer l'upload
      uploadFile(fileId, file, newUploads)
    }

    setUploads(newUploads)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (fileId: string, file: File, uploadsMap: Map<string, FileUploadState>) => {
    try {
      // 1. Obtenir l'URL présignée
      console.log('📤 Demande URL présignée pour:', file.name)

      const presignResponse = await fetch('/api/upload/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        })
      })

      if (!presignResponse.ok) {
        throw new Error('Erreur lors de la génération de l\'URL d\'upload')
      }

      const { uploadUrl, publicUrl } = await presignResponse.json()

      console.log('✅ URL présignée obtenue')

      // 2. Upload direct vers R2 avec progression
      setUploads(prev => {
        const updated = new Map(prev)
        const upload = updated.get(fileId)
        if (upload) {
          upload.status = 'uploading'
          updated.set(fileId, upload)
        }
        return updated
      })

      const xhr = new XMLHttpRequest()

      // Progression
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100)
          setUploads(prev => {
            const updated = new Map(prev)
            const upload = updated.get(fileId)
            if (upload) {
              upload.progress = percentage
              updated.set(fileId, upload)
            }
            return updated
          })
        }
      })

      // Succès
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          console.log('✅ Upload réussi:', file.name)

          setUploads(prev => {
            const updated = new Map(prev)
            const upload = updated.get(fileId)
            if (upload) {
              upload.status = 'completed'
              upload.progress = 100
              upload.url = publicUrl
              updated.set(fileId, upload)
            }
            return updated
          })

          // Appeler onComplete
          if (onComplete) {
            onComplete([{
              name: file.name,
              size: file.size,
              url: publicUrl,
              type: file.type
            }])
          }
        } else {
          throw new Error(`Erreur HTTP ${xhr.status}`)
        }
      })

      // Erreur
      xhr.addEventListener('error', () => {
        console.error('❌ Erreur upload:', file.name)
        setUploads(prev => {
          const updated = new Map(prev)
          const upload = updated.get(fileId)
          if (upload) {
            upload.status = 'error'
            upload.error = 'Erreur réseau'
            updated.set(fileId, upload)
          }
          return updated
        })
      })

      // Envoi
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)

    } catch (error: any) {
      console.error('❌ Erreur:', error)
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
    }
  }

  const uploadsArray = Array.from(uploads.values())
  const hasUploads = uploadsArray.length > 0

  return (
    <div className="space-y-4">
      {/* Zone de sélection */}
      <div
        className="relative border-2 border-dashed border-purple-500/30 rounded-2xl p-8 text-center bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all cursor-pointer"
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
            <Upload size={32} className="text-white" />
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
      {hasUploads && (
        <div className="space-y-2">
          {uploadsArray.map((upload, index) => {
            const fileId = `${upload.file.name}-${index}`

            return (
              <div
                key={fileId}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Icône de statut */}
                  <div className={`flex-shrink-0 ${
                    upload.status === 'completed' ? 'text-green-400' :
                    upload.status === 'error' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {upload.status === 'uploading' && <Loader2 size={20} className="animate-spin" />}
                    {upload.status === 'completed' && <CheckCircle2 size={20} />}
                    {upload.status === 'error' && <XCircle size={20} />}
                  </div>

                  {/* Nom du fichier */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{upload.file.name}</div>
                    <div className="text-sm text-gray-400">
                      {(upload.file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>

                  {/* Pourcentage */}
                  {upload.status === 'uploading' && (
                    <div className="text-sm font-medium text-purple-400">
                      {upload.progress}%
                    </div>
                  )}
                </div>

                {/* Barre de progression */}
                {(upload.status === 'uploading' || upload.status === 'pending') && (
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Message d'erreur */}
                {upload.status === 'error' && upload.error && (
                  <div className="text-sm text-red-400 mt-2">
                    ❌ {upload.error}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
