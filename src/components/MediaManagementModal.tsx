'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Trash2, 
  Eye, 
  EyeOff, 
  Crown, 
  DollarSign, 
  AlertTriangle,
  Check,
  Loader
} from 'lucide-react'

interface MediaItem {
  id?: string
  type: 'image' | 'video'
  url: string
  visibility?: 'PUBLIC' | 'PRIVATE' | 'PREMIUM'
  price?: number
  description?: string
}

interface MediaManagementModalProps {
  isOpen: boolean
  onClose: () => void
  media: MediaItem | null
  mediaIndex: number
  onUpdateMedia: (mediaUrl: string, updates: Partial<MediaItem>) => Promise<void>
  onDeleteMedia: (mediaUrl: string, index: number) => Promise<void>
}

const VISIBILITY_OPTIONS = [
  {
    value: 'PUBLIC' as const,
    label: 'Public',
    description: 'Visible par tous les utilisateurs',
    icon: Eye,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  {
    value: 'PRIVATE' as const,
    label: 'Privé',
    description: 'Visible uniquement par vous',
    icon: EyeOff,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30'
  },
  {
    value: 'PREMIUM' as const,
    label: 'Premium',
    description: 'Payant pour les utilisateurs',
    icon: Crown,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  }
]

export default function MediaManagementModal({
  isOpen,
  onClose,
  media,
  mediaIndex,
  onUpdateMedia,
  onDeleteMedia
}: MediaManagementModalProps) {
  const [selectedVisibility, setSelectedVisibility] = useState<MediaItem['visibility']>('PUBLIC')
  const [customPrice, setCustomPrice] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialiser les valeurs quand le modal s'ouvre
  React.useEffect(() => {
    if (isOpen && media) {
      setSelectedVisibility(media.visibility || 'PUBLIC')
      setCustomPrice(media.price?.toString() || '')
      setError(null)
      setSuccess(null)
      setShowDeleteConfirm(false)
    }
  }, [isOpen, media])

  const handleSave = async () => {
    if (!media) return

    console.log('🔧 [MODAL] Tentative de mise à jour:', {
      mediaUrl: media.url,
      visibility: selectedVisibility,
      customPrice,
      media
    })

    setIsLoading(true)
    setError(null)

    try {
      const updates: Partial<MediaItem> = {
        visibility: selectedVisibility
      }

      // Ajouter le prix si c'est du contenu premium
      if (selectedVisibility === 'PREMIUM') {
        const price = parseFloat(customPrice)
        if (isNaN(price) || price <= 0) {
          setError('Veuillez entrer un prix valide')
          setIsLoading(false)
          return
        }
        updates.price = price
      } else {
        updates.price = undefined
      }

      await onUpdateMedia(media.url, updates)
      setSuccess('Média mis à jour avec succès !')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!media) return

    console.log('🔧 [MODAL] Tentative de suppression:', {
      mediaUrl: media.url,
      mediaIndex,
      media
    })

    setIsLoading(true)
    setError(null)

    try {
      await onDeleteMedia(media.url, mediaIndex)
      setSuccess('Média supprimé avec succès !')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('🔧 [MODAL] Erreur suppression:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !media) return null

  return (
    <AnimatePresence>
      <motion.div
        key="media-management-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-sm p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Gérer le média</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Aperçu du média - plus petit */}
          <div className="mb-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-black">
              {media.type === 'video' ? (
                <video
                  src={media.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={media.url}
                  alt="Média"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-1 right-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  media.visibility === 'PUBLIC' ? 'bg-green-500/20 text-green-400' :
                  media.visibility === 'PRIVATE' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {media.visibility === 'PUBLIC' ? 'Public' :
                   media.visibility === 'PRIVATE' ? 'Privé' : 'Premium'}
                </span>
              </div>
            </div>
          </div>

          {/* Options de visibilité */}
          <div className="mb-4">
            <h3 className="text-white font-semibold mb-2 text-sm">Visibilité</h3>
            <div className="space-y-1">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = selectedVisibility === option.value
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedVisibility(option.value)}
                    className={`w-full p-2 rounded-lg border transition-all ${
                      isSelected
                        ? `${option.bgColor} ${option.borderColor} border-2`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={isSelected ? option.color : 'text-white/60'} />
                      <div className="flex-1 text-left">
                        <div className={`font-medium text-sm ${isSelected ? option.color : 'text-white'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-white/60">
                          {option.description}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={14} className={option.color} />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prix pour le contenu premium */}
          {selectedVisibility === 'PREMIUM' && (
            <div className="mb-4">
              <label className="block text-white font-semibold mb-2 text-sm">
                Prix (CHF)
              </label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.50"
                  className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 text-sm"
                />
              </div>
              <p className="text-xs text-white/60 mt-1">
                Prix minimum: 1 CHF
              </p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Message de succès */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span className="text-green-400 text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {/* Bouton de suppression */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Trash2 size={14} className="inline mr-1" />
              Supprimer
            </button>

            {/* Bouton de sauvegarde */}
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <Loader size={14} className="inline mr-1 animate-spin" />
              ) : (
                <Check size={14} className="inline mr-1" />
              )}
              Sauvegarder
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            key="delete-confirmation-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Supprimer le média</h3>
                <p className="text-white/70 mb-6">
                  Cette action est irréversible. Le média sera définitivement supprimé.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader size={16} className="inline mr-2 animate-spin" />
                    ) : (
                      <Trash2 size={16} className="inline mr-2" />
                    )}
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
