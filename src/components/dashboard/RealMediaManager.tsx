'use client'

import { useState, useRef } from 'react'
import { Upload, Eye, EyeOff, Trash2, Edit, DollarSign, Lock, Globe, Plus } from 'lucide-react'
import MediaUploader from '../ui/MediaUploader'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE'
  price?: number
  position?: number
  title?: string
  description?: string
  uploadedAt: Date
  size?: number
  likes?: number
}

export default function RealMediaManager() {
  const [medias, setMedias] = useState<MediaItem[]>([
    // Mock data
    {
      id: '1',
      type: 'image',
      url: 'https://picsum.photos/400/600?random=1',
      visibility: 'PRIVATE',
      position: 1,
      title: 'Photo profil',
      uploadedAt: new Date(),
      likes: 45
    },
    {
      id: '2',
      type: 'image',
      url: 'https://picsum.photos/400/600?random=2',
      visibility: 'REQUESTABLE',
      price: 50,
      title: 'Photo exclusive',
      uploadedAt: new Date(),
      likes: 23
    },
    {
      id: '3',
      type: 'video',
      url: 'https://picsum.photos/400/600?random=3',
      thumbnail: 'https://picsum.photos/400/600?random=3',
      visibility: 'PUBLIC',
      title: 'Vidéo présentation',
      uploadedAt: new Date(),
      likes: 78
    }
  ])

  const [selectedMedias, setSelectedMedias] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadSuccess = (mediaId: string) => {
    // Callback après upload réussi
    console.log('Média uploadé avec succès:', mediaId)
    // Ici on pourrait recharger la liste des médias
    // ou ajouter le nouveau média à la liste existante
    setShowUploadModal(false)
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Simuler l'upload
    Array.from(files).forEach((file, index) => {
      const newMedia: MediaItem = {
        id: Date.now().toString() + index,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url: URL.createObjectURL(file),
        visibility: 'PRIVATE',
        title: file.name,
        uploadedAt: new Date(),
        size: file.size,
        likes: 0
      }
      
      setMedias(prev => [...prev, newMedia])
    })

    setShowUploadModal(false)
  }

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedias(prev => 
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    )
  }

  const updateMediaVisibility = (mediaId: string, visibility: MediaItem['visibility']) => {
    setMedias(prev => prev.map(media => 
      media.id === mediaId ? { ...media, visibility } : media
    ))
  }

  const deleteMedia = (mediaId: string) => {
    setMedias(prev => prev.filter(media => media.id !== mediaId))
    setSelectedMedias(prev => prev.filter(id => id !== mediaId))
  }

  const getVisibilityIcon = (visibility: MediaItem['visibility']) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe size={14} className="text-green-400" />
      case 'PRIVATE':
        return <Lock size={14} className="text-red-400" />
      case 'REQUESTABLE':
        return <DollarSign size={14} className="text-yellow-400" />
    }
  }

  const getVisibilityLabel = (visibility: MediaItem['visibility']) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Public'
      case 'PRIVATE':
        return 'Privé'
      case 'REQUESTABLE':
        return 'À la demande'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Upload size={18} />
            <span>Ajouter des médias</span>
          </button>
          
          {selectedMedias.length > 0 && (
            <>
              <button
                onClick={() => {
                  selectedMedias.forEach(id => deleteMedia(id))
                  setSelectedMedias([])
                }}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Supprimer ({selectedMedias.length})
              </button>
              
              <select
                onChange={(e) => {
                  selectedMedias.forEach(id => 
                    updateMediaVisibility(id, e.target.value as MediaItem['visibility'])
                  )
                  setSelectedMedias([])
                }}
                className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm"
                defaultValue=""
              >
                <option value="" disabled>Changer la visibilité</option>
                <option value="PUBLIC">🌐 Public</option>
                <option value="PRIVATE">🔒 Privé</option>
                <option value="REQUESTABLE">💎 À la demande</option>
              </select>
            </>
          )}
        </div>

        <div className="text-sm text-gray-400">
          {medias.length} média{medias.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille des médias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {medias.map((media) => (
          <div
            key={media.id}
            className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-colors"
          >
            {/* Sélection */}
            <input
              type="checkbox"
              checked={selectedMedias.includes(media.id)}
              onChange={() => toggleMediaSelection(media.id)}
              className="absolute top-2 left-2 z-10 w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
            />

            {/* Visibilité */}
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
              {getVisibilityIcon(media.visibility)}
              <span className="text-xs text-white">{getVisibilityLabel(media.visibility)}</span>
              {media.price && <span className="text-xs text-yellow-400">{media.price}♦</span>}
            </div>

            {/* Image/Vidéo */}
            <div className="aspect-square">
              <img
                src={media.thumbnail || media.url}
                alt={media.title}
                className="w-full h-full object-cover"
              />
              {media.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="text-sm font-medium text-white truncate mb-1">
                {media.title}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatFileSize(media.size)}</span>
                <span>❤️ {media.likes}</span>
              </div>
            </div>

            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                onClick={() => {/* Prévisualiser */}}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Eye size={16} className="text-white" />
              </button>
              <button
                onClick={() => {/* Éditer */}}
                className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Edit size={16} className="text-blue-400" />
              </button>
              <button
                onClick={() => deleteMedia(media.id)}
                className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {/* Zone d'upload */}
        <div
          onClick={handleUpload}
          className="aspect-square border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors group"
        >
          <Upload className="text-gray-500 group-hover:text-purple-400 mb-2" size={24} />
          <span className="text-sm text-gray-400 group-hover:text-purple-400">Ajouter</span>
        </div>
      </div>

      {/* Input caché pour upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Modal d'upload avec nouveau MediaUploader */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Fermer si on clique sur le backdrop
            if (e.target === e.currentTarget) {
              setShowUploadModal(false)
            }
          }}
        >
          <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Ajouter des médias</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                  aria-label="Fermer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <MediaUploader
                onUploadSuccess={handleUploadSuccess}
                className="border-0 bg-transparent p-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}