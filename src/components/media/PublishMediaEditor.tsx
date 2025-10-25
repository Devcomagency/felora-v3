'use client'

import { useState } from 'react'
import { X, MapPin, Eye, EyeOff, Crown, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
      gradient: 'from-pink-500 to-rose-500',
      label: 'Public',
      description: 'Visible par tous'
    },
    {
      value: 'private' as const,
      icon: EyeOff,
      gradient: 'from-purple-500 to-violet-500',
      label: 'Privé',
      description: 'Abonnés uniquement'
    },
    {
      value: 'premium' as const,
      icon: Crown,
      gradient: 'from-cyan-500 to-teal-500',
      label: 'Premium',
      description: 'Contenu payant'
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Main Container */}
      <div className="relative z-10 h-full max-w-2xl mx-auto flex flex-col">
        {/* Header */}
        <div
          className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.8))' }}
        >
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onClose}
              disabled={isPublishing}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10 disabled:opacity-50"
            >
              <X size={24} className="text-white" />
            </button>

            <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Publier
            </h2>

            <button
              onClick={handlePublish}
              disabled={isPublishing || publishSuccess}
              className="px-5 py-2.5 rounded-full font-bold transition-all disabled:opacity-50 hover:scale-105"
              style={{
                background: isPublishing || publishSuccess
                  ? 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
                  : 'linear-gradient(to right, #FF6B9D, #B794F6)',
                boxShadow: '0 8px 24px rgba(255, 107, 157, 0.3)'
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
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Preview Media */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <div className="aspect-[9/16] sm:aspect-video">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    controls
                    playsInline
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
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className="block text-sm font-bold mb-2 text-white/80">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Racontez votre moment..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder-white/40 text-white"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                disabled={isPublishing}
              />
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="flex items-center text-sm font-bold mb-2 text-white/80">
                <MapPin size={16} className="mr-1.5" />
                Lieu (optionnel)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Genève, Suisse"
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all placeholder-white/40 text-white"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                disabled={isPublishing}
              />
            </motion.div>

            {/* Visibility */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="block text-sm font-bold mb-3 text-white/80">
                Visibilité du contenu
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {visibilityOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = visibility === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setVisibility(option.value)}
                      disabled={isPublishing}
                      className="relative p-3 sm:p-4 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                          : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                        backdropFilter: 'blur(20px)',
                        border: isSelected ? '2px solid' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderImage: isSelected ? `linear-gradient(135deg, ${option.gradient === 'from-pink-500 to-rose-500' ? '#FF6B9D, #FF6B9D' : option.gradient === 'from-purple-500 to-violet-500' ? '#B794F6, #B794F6' : '#4FD1C7, #4FD1C7'}) 1` : undefined
                      }}
                    >
                      <div className={`mx-auto mb-1.5 sm:mb-2 w-fit p-2 rounded-full bg-gradient-to-r ${option.gradient}`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white">{option.label}</div>
                      <div className="text-[10px] sm:text-xs text-white/60 mt-0.5">{option.description}</div>
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Price (si premium) */}
            <AnimatePresence>
              {visibility === 'premium' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-bold mb-2 text-white/80">
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
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-white/40 text-white"
                      style={{
                        background: 'linear-gradient(to bottom right, rgba(79, 209, 199, 0.1), rgba(79, 209, 199, 0.05))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(79, 209, 199, 0.3)'
                      }}
                      disabled={isPublishing}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium pointer-events-none">
                      CHF
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Les utilisateurs devront payer pour accéder à ce contenu
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {publishSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 border-2 border-green-500/50">
                <CheckCircle2 size={56} className="text-green-400" />
              </div>
              <p className="text-2xl font-black text-white mb-2">Publication réussie !</p>
              <p className="text-white/60">Redirection en cours...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
