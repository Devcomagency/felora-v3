'use client'

import { useState } from 'react'
import { X, MapPin, Eye, EyeOff, Crown, Loader2, CheckCircle2, Image as ImageIcon, Video as VideoIcon, ChevronLeft } from 'lucide-react'

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
  const [currentStep, setCurrentStep] = useState(0)

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

  const steps = [
    { id: 'preview', title: 'Aperçu', icon: mediaType === 'video' ? VideoIcon : ImageIcon },
    { id: 'description', title: 'Description', icon: Eye },
    { id: 'visibility', title: 'Visibilité', icon: Shield },
  ]

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

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    } else {
      handlePublish()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      onClose()
    }
  }

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                {mediaType === 'video' ? (
                  <VideoIcon className="text-white" size={32} />
                ) : (
                  <ImageIcon className="text-white" size={32} />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">
                Publier votre {mediaType === 'video' ? 'vidéo' : 'photo'}
              </h2>
              <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Ajoutez les détails et partagez votre contenu
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : isActive ? 'bg-purple-500' : 'bg-white/20'
                  }`}>
                    <Icon size={20} className={`${isCompleted || isActive ? 'text-white' : 'text-white/60'}`} />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-white/20'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            {/* Step 0: Preview */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-white text-xl font-semibold mb-2">Aperçu du média</h3>
                  <p className="text-white/70 text-sm">
                    Vérifiez que votre {mediaType === 'video' ? 'vidéo' : 'photo'} est bien cadrée
                  </p>
                </div>

                <div className="relative rounded-xl overflow-hidden bg-black/40">
                  <div className="aspect-video max-h-[400px]">
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
              </div>
            )}

            {/* Step 1: Description */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-white text-xl font-semibold mb-2">Description et lieu</h3>
                  <p className="text-white/70 text-sm">
                    Ajoutez une description pour attirer l'attention
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Racontez votre moment..."
                      rows={5}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/50 text-base resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Lieu (optionnel)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Genève, Suisse"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Visibility */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-white text-xl font-semibold mb-2">Visibilité du contenu</h3>
                  <p className="text-white/70 text-sm">
                    Choisissez qui peut voir votre contenu
                  </p>
                </div>

                <div className="space-y-3">
                  {visibilityOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = visibility === option.value

                    return (
                      <button
                        key={option.value}
                        onClick={() => setVisibility(option.value)}
                        disabled={isPublishing}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'bg-white/10 border-purple-500'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${option.gradient}`}>
                            <Icon size={24} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-base">{option.label}</div>
                            <div className="text-white/60 text-sm">{option.description}</div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={24} className="text-purple-500" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Price (si premium) */}
                {visibility === 'premium' && (
                  <div className="mt-6">
                    <label className="block text-white/80 text-sm font-medium mb-2">Prix (CHF)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="9.99"
                        step="0.01"
                        min="0"
                        className="w-full bg-white/10 border border-yellow-500/40 rounded-xl px-4 py-4 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
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
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <button
              onClick={prevStep}
              disabled={isPublishing}
              className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} />
              {currentStep === 0 ? 'Annuler' : 'Retour'}
            </button>
            <button
              onClick={nextStep}
              disabled={isPublishing}
              className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-60 flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Publication...
                </>
              ) : currentStep === 2 ? (
                'Publier'
              ) : (
                'Continuer'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success overlay */}
      {publishSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-green-500/50">
              <CheckCircle2 size={56} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white mb-2">Publication réussie !</p>
            <p className="text-white/60">Redirection en cours...</p>
          </div>
        </div>
      )}
    </main>
  )
}

function Shield(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
