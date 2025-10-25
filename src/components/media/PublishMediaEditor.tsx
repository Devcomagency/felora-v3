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
  const [showFullPreview, setShowFullPreview] = useState(false)

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
      accentColor: '#B794F6',
      bgGradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
      label: 'Public',
      description: 'Visible par tous'
    },
    {
      value: 'private' as const,
      icon: EyeOff,
      gradient: 'from-pink-500 to-rose-500',
      accentColor: '#EC4899',
      bgGradient: 'from-pink-500/10 via-rose-500/5 to-transparent',
      label: 'Privé',
      description: 'Vous seulement'
    },
    {
      value: 'premium' as const,
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-500',
      accentColor: '#F59E0B',
      bgGradient: 'from-yellow-500/10 via-orange-500/5 to-transparent',
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

      {/* Contenu principal - Une seule colonne centrée avec scroll si nécessaire */}
      <div className="relative z-10 h-[calc(100vh-73px)] overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3 pb-24">
          {/* Preview miniature cliquable */}
          <button
            onClick={() => setShowFullPreview(true)}
            disabled={isPublishing}
            className="rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02] disabled:hover:scale-100 relative group"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="h-[150px] bg-black/40 flex items-center justify-center">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  playsInline
                  muted
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
            </div>
          </button>

          {/* Description */}
          <div
            className="rounded-2xl p-3"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <label className="block text-white/80 text-xs font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Racontez votre moment..."
              rows={2}
              disabled={isPublishing}
              className="w-full px-3 py-2 rounded-xl text-white text-sm placeholder-white/40 resize-none transition-all border focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 disabled:opacity-60"
              style={{
                background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>

          {/* Visibilité */}
          <div
            className="rounded-2xl p-3"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <label className="block text-white/80 text-xs font-medium mb-2">
              Visibilité
            </label>
            <div className="space-y-2">
              {visibilityOptions.map((option) => {
                const Icon = option.icon
                const isSelected = visibility === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                    disabled={isPublishing}
                    className={`group w-full rounded-xl border transition-all duration-500 ${
                      isSelected
                        ? 'border-white/30 shadow-xl scale-[1.02]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${option.accentColor}15 0%, rgba(0,0,0,0.8) 100%)`
                        : 'rgba(255,255,255,0.03)'
                    }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${option.bgGradient}`} />

                    <div className="relative p-3 flex items-center gap-3">
                      {/* Icon Box - même style que register */}
                      <div className="shrink-0">
                        <div
                          className="inline-flex p-2.5 rounded-xl border shadow-lg transition-transform group-hover:scale-110 duration-500"
                          style={{
                            background: `linear-gradient(to bottom right, ${option.accentColor}20, ${option.accentColor}15)`,
                            borderColor: `${option.accentColor}30`,
                            boxShadow: `0 4px 12px ${option.accentColor}10`
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: option.accentColor }} strokeWidth={2} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <div className="text-white font-semibold text-sm group-hover:text-white transition-colors">
                          {option.label}
                        </div>
                        <div className="text-white/50 text-xs group-hover:text-white/70 transition-colors">
                          {option.description}
                        </div>
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <div className="shrink-0">
                          <CheckCircle2 size={20} style={{ color: option.accentColor }} />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Prix si premium */}
            {visibility === 'premium' && (
              <div className="mt-2">
                <label className="block text-white/80 text-xs font-medium mb-1">
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
                    className="w-full px-3 py-2 rounded-xl text-white text-sm placeholder-white/40 transition-all border focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                      backdropFilter: 'blur(20px)',
                      borderColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 font-medium pointer-events-none text-xs">
                    CHF
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton Publier - style register page */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="group relative w-full rounded-xl border transition-all duration-500 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 border-white/30 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.20) 0%, rgba(183, 148, 246, 0.15) 100%)',
            }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-transparent" />

            <div
              className="relative py-3.5 px-6 flex items-center justify-center gap-2 font-bold text-white text-base"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <span>Publier</span>
                  <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Modal plein écran pour preview */}
      {showFullPreview && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={() => setShowFullPreview(false)}
        >
          <button
            onClick={() => setShowFullPreview(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X size={24} className="text-white" />
          </button>
          <div className="max-w-4xl max-h-[90vh] w-full px-4">
            {mediaType === 'video' ? (
              <video
                src={mediaUrl}
                controls
                playsInline
                autoPlay
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
