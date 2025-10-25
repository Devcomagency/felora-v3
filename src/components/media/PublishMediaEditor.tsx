'use client'

import { useState } from 'react'
import { X, MapPin, Eye, EyeOff, Crown, Loader2, CheckCircle2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react'

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
    {
      value: 'public' as const,
      icon: Eye,
      gradient: 'from-purple-500 to-pink-500',
      label: 'Public',
      description: 'Visible par tous'
    },
    {
      value: 'private' as const,
      icon: EyeOff,
      gradient: 'from-pink-500 to-rose-500',
      label: 'Privé',
      description: 'Abonnés uniquement'
    },
    {
      value: 'premium' as const,
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-500',
      label: 'Premium',
      description: 'Contenu payant'
    },
  ]

  if (publishSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-green-500/50">
            <CheckCircle2 size={56} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white mb-2">Publication réussie !</p>
          <p className="text-white/60">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black text-white">
      {/* Background avec effets de profondeur */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Header sticky avec glassmorphism */}
      <div
        className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.8))' }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10 disabled:opacity-60"
          >
            <X size={24} className="text-white" />
          </button>
          <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            {mediaType === 'video' ? 'PUBLIER VIDÉO' : 'PUBLIER PHOTO'}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 h-[calc(100vh-73px)] overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Preview du média */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="aspect-square max-h-[60vh] bg-black/40">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div
            className="rounded-2xl p-5 transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <label className="block text-white/80 text-sm font-medium mb-3">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Racontez votre moment..."
              rows={4}
              disabled={isPublishing}
              className="w-full px-4 py-4 rounded-xl text-white placeholder-white/40 resize-none transition-all border focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 disabled:opacity-60"
              style={{
                background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>

          {/* Lieu */}
          <div
            className="rounded-2xl p-5 transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <label className="block text-white/80 text-sm font-medium mb-3">
              Lieu (optionnel)
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Genève, Suisse"
                disabled={isPublishing}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-white/40 transition-all border focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            </div>
          </div>

          {/* Visibilité */}
          <div
            className="rounded-2xl p-5 transition-all duration-300"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <label className="block text-white/80 text-sm font-medium mb-4">
              Visibilité
            </label>
            <div className="space-y-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon
                const isSelected = visibility === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                    disabled={isPublishing}
                    className="w-full"
                  >
                    <div
                      className={`p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                        isSelected ? 'ring-2 ring-pink-500/50' : ''
                      }`}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(to bottom right, rgba(255, 107, 157, 0.15), rgba(183, 148, 246, 0.1))'
                          : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                        backdropFilter: 'blur(20px)',
                        border: isSelected
                          ? '1px solid rgba(255, 107, 157, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${option.gradient}`}
                        >
                          <Icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-semibold text-base">{option.label}</div>
                          <div className="text-white/60 text-sm">{option.description}</div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={24} className="text-pink-500" />
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Prix si premium */}
            {visibility === 'premium' && (
              <div className="mt-4">
                <label className="block text-white/80 text-sm font-medium mb-3">
                  Prix (CHF)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    step="0.01"
                    min="0"
                    disabled={isPublishing}
                    className="w-full px-4 py-4 rounded-xl text-white placeholder-white/40 transition-all border focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      backdropFilter: 'blur(20px)',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium pointer-events-none">
                    CHF
                  </div>
                </div>
                <p className="mt-2 text-xs text-white/60">
                  Les utilisateurs devront payer pour accéder à ce contenu
                </p>
              </div>
            )}
          </div>

          {/* Bouton Publier */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 shadow-lg"
            style={{
              background: 'linear-gradient(to right, #FF6B9D, #B794F6)',
              boxShadow: '0 8px 24px rgba(255, 107, 157, 0.3)'
            }}
          >
            {isPublishing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span>Publication en cours...</span>
              </div>
            ) : (
              'Publier'
            )}
          </button>

          {/* Espace en bas pour éviter que le bouton soit caché */}
          <div className="h-24" />
        </div>
      </div>
    </div>
  )
}
