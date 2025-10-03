'use client'

import { useState } from 'react'
import { X, MapPin, Eye, EyeOff, Crown, Loader2, CheckCircle2 } from 'lucide-react'

type VisibilityType = 'public' | 'private' | 'premium'

interface PublishMediaEditorProps {
  mediaFile: File
  mediaUrl: string
  mediaType: 'image' | 'video'
  onClose: () => void
  onPublish: (data: {
    file: File
    description: string
    location: string
    visibility: VisibilityType
    price?: number
  }) => Promise<void>
}

const FELORA_TOKENS = {
  bg: '#0B0B0B',
  panel: '#14171D',
  text: '#EAECEF',
  textSecondary: '#A1A5B0',
  primary: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
  focus: '#4FD1C7',
  public: '#FF6B9D',
  private: '#B794F6',
  premium: '#4FD1C7',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
}

export default function PublishMediaEditor({
  mediaFile,
  mediaUrl,
  mediaType,
  onClose,
  onPublish
}: PublishMediaEditorProps) {
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('public')
  const [price, setPrice] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublish({
        file: mediaFile,
        description,
        location,
        visibility,
        price: visibility === 'premium' ? parseFloat(price) || undefined : undefined
      })
      setPublishSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Erreur publication:', error)
      setIsPublishing(false)
    }
  }

  const visibilityOptions = [
    { value: 'public' as const, icon: Eye, color: FELORA_TOKENS.public, label: 'Public' },
    { value: 'private' as const, icon: EyeOff, color: FELORA_TOKENS.private, label: 'Privé' },
    { value: 'premium' as const, icon: Crown, color: FELORA_TOKENS.premium, label: 'Premium' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: FELORA_TOKENS.bg }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: FELORA_TOKENS.glassBorder }}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          disabled={isPublishing}
        >
          <X size={24} style={{ color: FELORA_TOKENS.text }} />
        </button>
        <h2 className="text-lg font-semibold" style={{ color: FELORA_TOKENS.text }}>
          Publier
        </h2>
        <button
          onClick={handlePublish}
          disabled={isPublishing || publishSuccess}
          className="px-4 py-2 rounded-full font-medium transition-all disabled:opacity-50"
          style={{
            background: isPublishing || publishSuccess ? FELORA_TOKENS.glass : FELORA_TOKENS.primary,
            color: FELORA_TOKENS.text
          }}
        >
          {publishSuccess ? (
            <CheckCircle2 size={20} />
          ) : isPublishing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            'Publier'
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Preview */}
          <div className="aspect-video rounded-2xl overflow-hidden"
            style={{ backgroundColor: FELORA_TOKENS.panel }}
          >
            {mediaType === 'video' ? (
              <video
                src={mediaUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: FELORA_TOKENS.textSecondary }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez une description..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: FELORA_TOKENS.glass,
                borderColor: FELORA_TOKENS.glassBorder,
                color: FELORA_TOKENS.text,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              disabled={isPublishing}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: FELORA_TOKENS.textSecondary }}>
              <MapPin size={16} className="inline mr-1" />
              Lieu (optionnel)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ajouter un lieu..."
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: FELORA_TOKENS.glass,
                borderColor: FELORA_TOKENS.glassBorder,
                color: FELORA_TOKENS.text,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              disabled={isPublishing}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: FELORA_TOKENS.textSecondary }}>
              Visibilité du contenu
            </label>
            <div className="grid grid-cols-3 gap-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon
                const isSelected = visibility === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                    disabled={isPublishing}
                    className="p-4 rounded-xl transition-all border-2"
                    style={{
                      backgroundColor: isSelected ? FELORA_TOKENS.glass : 'transparent',
                      borderColor: isSelected ? option.color : FELORA_TOKENS.glassBorder,
                      color: isSelected ? option.color : FELORA_TOKENS.textSecondary
                    }}
                  >
                    <Icon size={24} className="mx-auto mb-2" />
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price (si premium) */}
          {visibility === 'premium' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: FELORA_TOKENS.textSecondary }}>
                Prix (CHF)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 9.99"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: FELORA_TOKENS.glass,
                  borderColor: FELORA_TOKENS.glassBorder,
                  color: FELORA_TOKENS.text,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                disabled={isPublishing}
              />
            </div>
          )}
        </div>
      </div>

      {/* Success overlay */}
      {publishSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={48} className="text-green-400" />
            </div>
            <p className="text-xl font-semibold text-white">Publication réussie !</p>
          </div>
        </div>
      )}
    </div>
  )
}
