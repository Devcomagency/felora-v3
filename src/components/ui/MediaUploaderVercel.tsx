'use client'

import { useEffect, useState } from 'react'
import { Upload, AlertCircle, User } from 'lucide-react'

interface MediaUploaderVercelProps {
  onUploadSuccess?: (mediaId: string) => void
  className?: string
}

export default function MediaUploaderVercel({ onUploadSuccess, className = '' }: MediaUploaderVercelProps) {
  const [hasEscortProfile, setHasEscortProfile] = useState<boolean | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<'IMAGE' | 'VIDEO'>('IMAGE')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'REQUESTABLE'>('PUBLIC')
  const [price, setPrice] = useState<number | ''>('')
  const [position, setPosition] = useState<number | ''>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Vérifier si l'utilisateur a un profil escort
    fetch('/api/me/escort-profile')
      .then(r => r.json())
      .then(d => setHasEscortProfile(!!d.hasEscortProfile))
      .catch(() => setHasEscortProfile(false))
  }, [])

  if (hasEscortProfile === null) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Vérification du profil...</span>
        </div>
      </div>
    )
  }

  if (hasEscortProfile === false) {
    return (
      <div className={`bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 ${className}`}>
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-amber-400 font-semibold mb-2">
              Profil escort requis
            </h3>
            <p className="text-amber-300/90 text-sm mb-4">
              Tu dois compléter ton profil escort avant d'uploader des médias.
            </p>
            <a
              href="/dashboard-escort/profil"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              <User size={16} />
              <span>Compléter mon profil</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Détection automatique du type
      if (selectedFile.type.startsWith('image/')) {
        setType('IMAGE')
      } else if (selectedFile.type.startsWith('video/')) {
        setType('VIDEO')
      }
      setError('')
    }
  }

  const handleSubmit = async () => {
    console.log('📷 VERCEL UPLOAD: Début upload, file:', file?.name, 'size:', file?.size)

    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    if (visibility === 'REQUESTABLE' && !price) {
      setError('Veuillez définir un prix pour les médias à la demande')
      return
    }

    // Vérification taille pour Vercel
    if (file.size > 3.5 * 1024 * 1024) {
      setError(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Limite Vercel: 3.5MB.`)
      return
    }

    setUploading(true)
    setError('')

    console.log('📷 VERCEL UPLOAD: Paramètres:', {
      type,
      visibility,
      price,
      position
    })

    try {
      // Convertir le fichier en Base64
      console.log('📷 VERCEL UPLOAD: Conversion en Base64...')
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      console.log('📷 VERCEL UPLOAD: Base64 prêt, length:', fileBase64.length)

      // Envoyer vers l'API Base64
      const response = await fetch('/api/media/upload-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileBase64,
          fileName: file.name,
          fileType: file.type,
          type,
          visibility,
          price: visibility === 'REQUESTABLE' ? price : undefined,
          position: position || undefined
        })
      })

      console.log('📷 VERCEL UPLOAD: Réponse reçue, status:', response.status)

      const data = await response.json()
      console.log('📷 VERCEL UPLOAD: Data:', data)

      if (!response.ok) {
        console.error('❌ VERCEL UPLOAD: Erreur réponse:', response.status, data)
        if (response.status === 409) {
          setError(data.message || 'Profil escort requis')
          setHasEscortProfile(false)
        } else {
          setError(data.error || 'Erreur lors de l\'upload')
        }
        return
      }

      // Succès
      console.log('✅ VERCEL UPLOAD: Succès! MediaId:', data.mediaId)
      onUploadSuccess?.(data.mediaId)

      // Reset form
      setFile(null)
      setPrice('')
      setPosition('')
      setError('')

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('❌ VERCEL UPLOAD: Exception:', error)
      setError(`Erreur inattendue: ${error instanceof Error ? error.message : 'Inconnue'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <Upload size={20} />
        <span>Uploader un média (Vercel)</span>
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fichier (max 3.5MB pour Vercel)
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white file:mr-3 file:py-1 file:px-3 file:border-0 file:bg-purple-500 file:text-white file:rounded file:text-sm hover:file:bg-purple-600 transition-colors"
          />
          {file && (
            <p className="text-xs text-gray-400 mt-1">
              Sélectionné: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'IMAGE' | 'VIDEO')}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Vidéo</option>
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Visibilité
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE')}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="PUBLIC">🌐 Public</option>
            <option value="PRIVATE">🔒 Privé</option>
            <option value="REQUESTABLE">💎 À la demande</option>
          </select>
        </div>

        {/* Prix (si REQUESTABLE) */}
        {visibility === 'REQUESTABLE' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prix (Diamants ♦)
            </label>
            <input
              type="number"
              placeholder="ex: 50"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || '')}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        )}

        {/* Position (optionnelle) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Position (optionnel)
          </label>
          <input
            type="number"
            placeholder="ex: 7, 8, 9..."
            value={position}
            onChange={(e) => setPosition(Number(e.target.value) || '')}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Positions 1-6 réservées aux médias obligatoires du profil
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Upload en cours (Base64)...</span>
            </div>
          ) : (
            'Uploader le média (Vercel)'
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-300 text-xs">
          👤 Version optimisée pour Vercel : utilise Base64 au lieu de FormData pour éviter les problèmes d'upload.
        </p>
      </div>
    </div>
  )
}