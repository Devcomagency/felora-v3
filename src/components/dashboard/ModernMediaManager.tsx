'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Upload, X, Play, Image as ImageIcon, Diamond, Unlock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface Media {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  visibility: 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE'
  price?: number
  createdAt: string
}

interface UserDiamonds {
  balance: number
  totalEarned: number
  totalSpent: number
}

export default function ModernMediaManager() {
  const { data: session } = useSession()
  const [medias, setMedias] = useState<Media[]>([])
  const [userDiamonds, setUserDiamonds] = useState<UserDiamonds>({ balance: 0, totalEarned: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [unlockedMedias, setUnlockedMedias] = useState<Set<string>>(new Set())

  // Charger les médias
  const loadMedias = async () => {
    try {
      const response = await fetch('/api/profile/unified/me')
      if (response.ok) {
        const data = await response.json()
        setMedias(data.medias || [])
      }
    } catch (error) {
      console.error('Erreur chargement médias:', error)
    } finally {
      setLoading(false)
    }
  }

  // Charger le wallet diamants
  const loadDiamonds = async () => {
    try {
      const response = await fetch('/api/diamonds/wallet')
      if (response.ok) {
        const data = await response.json()
        setUserDiamonds(data.wallet || { balance: 0, totalEarned: 0, totalSpent: 0 })
      }
    } catch (error) {
      console.error('Erreur chargement diamants:', error)
    }
  }

  // Vérifier les accès aux médias
  const checkMediaAccess = async () => {
    const accessChecks = await Promise.all(
      medias
        .filter(m => m.visibility === 'PRIVATE' || m.visibility === 'REQUESTABLE')
        .map(async (media) => {
          try {
            const response = await fetch(`/api/media/unlock?mediaId=${media.id}`)
            if (response.ok) {
              const data = await response.json()
              return { mediaId: media.id, hasAccess: data.hasAccess }
            }
          } catch (error) {
            console.error('Erreur vérification accès:', error)
          }
          return { mediaId: media.id, hasAccess: false }
        })
    )

    const unlockedSet = new Set(
      accessChecks.filter(check => check.hasAccess).map(check => check.mediaId)
    )
    setUnlockedMedias(unlockedSet)
  }

  useEffect(() => {
    loadMedias()
    loadDiamonds()
  }, [])

  useEffect(() => {
    if (medias.length > 0) {
      checkMediaAccess()
    }
  }, [medias])

  // Upload de média
  const uploadMedia = async (file: File, visibility: 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE', price?: number) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('visibility', visibility)
      if (price) formData.append('price', price.toString())

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Média uploadé avec succès')
        loadMedias() // Recharger la liste
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur upload')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  // Débloquer un média privé
  const unlockPrivateMedia = async (mediaId: string, price: number) => {
    if (userDiamonds.balance < price) {
      toast.error(`Vous n'avez pas assez de diamants (${price} requis, ${userDiamonds.balance} disponibles)`)
      return
    }

    try {
      const response = await fetch('/api/media/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, price })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Média débloqué !')
        setUnlockedMedias(prev => new Set([...prev, mediaId]))
        setUserDiamonds(prev => ({ ...prev, balance: data.newBalance }))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur déblocage')
      }
    } catch (error) {
      console.error('Erreur déblocage:', error)
      toast.error('Erreur lors du déblocage')
    }
  }

  // Supprimer un média
  const deleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
      if (response.ok) {
        setMedias(prev => prev.filter(m => m.id !== mediaId))
        toast.success('Média supprimé')
      } else {
        toast.error('Erreur suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Gérer l'upload par drag & drop
  const handleFileUpload = (files: FileList) => {
    const file = files[0]
    if (!file) return

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      // Par défaut, upload en PUBLIC
      uploadMedia(file, 'PUBLIC')
    } else {
      toast.error('Format non supporté')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec wallet diamants */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Gestion des Médias</h3>
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
          <Diamond className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-medium">{userDiamonds.balance} diamants</span>
        </div>
      </div>

      {/* Zone d'upload */}
      <div
        className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl p-8 text-center transition-colors bg-gray-700/30"
        onDrop={(e) => {
          e.preventDefault()
          handleFileUpload(e.dataTransfer.files)
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-300 mb-2">Glissez vos fichiers ici ou cliquez pour sélectionner</p>
        <p className="text-sm text-gray-500">Images et vidéos supportées (max 50MB)</p>
        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          id="media-upload"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />
        <label
          htmlFor="media-upload"
          className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
        >
          {uploading ? 'Upload en cours...' : 'Sélectionner fichier'}
        </label>
      </div>

      {/* Grille des médias */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {medias.map((media) => {
          const isPrivate = media.visibility === 'PRIVATE' || media.visibility === 'REQUESTABLE'
          const isUnlocked = unlockedMedias.has(media.id)
          const shouldBlur = isPrivate && !isUnlocked

          return (
            <div key={media.id} className="relative group rounded-xl overflow-hidden bg-gray-800">
              {/* Média */}
              <div className="aspect-square relative">
                {media.type === 'VIDEO' ? (
                  <video
                    src={media.url}
                    className={`w-full h-full object-cover ${shouldBlur ? 'blur-md' : ''}`}
                    muted
                    controls={!shouldBlur}
                  />
                ) : (
                  <img
                    src={media.url}
                    alt=""
                    className={`w-full h-full object-cover ${shouldBlur ? 'blur-md' : ''}`}
                  />
                )}

                {/* Overlay flou pour les médias privés */}
                {shouldBlur && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <Unlock className="w-8 h-8 text-white mb-2 mx-auto" />
                      <div className="text-white font-medium">{media.price} diamants</div>
                      <button
                        onClick={() => media.price && unlockPrivateMedia(media.id, media.price)}
                        className="mt-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm hover:scale-105 transition-transform"
                      >
                        Débloquer
                      </button>
                    </div>
                  </div>
                )}

                {/* Badge visibilité */}
                <div className="absolute top-2 left-2">
                  {media.visibility === 'PUBLIC' ? (
                    <div className="bg-green-600/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Public
                    </div>
                  ) : (
                    <div className="bg-purple-600/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Privé
                    </div>
                  )}
                </div>

                {/* Bouton supprimer */}
                <button
                  onClick={() => deleteMedia(media.id)}
                  className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Type de média */}
                {media.type === 'VIDEO' && (
                  <div className="absolute bottom-2 left-2">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Prix si applicable */}
              {media.price && (
                <div className="p-2 bg-gray-900/80">
                  <div className="flex items-center justify-center gap-1 text-purple-400">
                    <Diamond className="w-3 h-3" />
                    <span className="text-xs">{media.price} diamants</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Message si aucun média */}
      {medias.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun média uploadé</p>
          <p className="text-sm">Commencez par ajouter des photos ou vidéos</p>
        </div>
      )}
    </div>
  )
}