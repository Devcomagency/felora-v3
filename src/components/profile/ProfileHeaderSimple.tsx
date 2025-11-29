'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, Crown, Diamond,
  ChevronDown, MessageCircle, BadgeCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getMessageButtonConfig } from '@/utils/messageButtonLogic'
import { EscortProfile, useProfileStore } from '../../stores/profileStore.simple'
import track from '@/lib/analytics/tracking'
import { useSession } from 'next-auth/react'

interface ProfileHeaderProps {
  profile: EscortProfile
  extendedData: any
  onShowDetail?: () => void
}

export default function ProfileHeaderSimple({ profile, extendedData, onShowDetail }: ProfileHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)

  // Store hooks
  const { 
    isFavorite, 
    toggleFavorite, 
    getProfileReactions, 
    getTotalReactions 
  } = useProfileStore()

  const isProfileFavorite = isFavorite(profile.id)
  const reactions = getProfileReactions(profile.id)
  const totalReactions = getTotalReactions(profile.id)

  const handleMessage = () => {
    const messageConfig = getMessageButtonConfig(session?.user, profile, router)
    messageConfig.onClick()
  }

  const handleCall = (phoneNumber: string) => {
    // 📊 Track phone call
    track.contactPhone(profile.id, 'escort')
    window.open(`tel:${phoneNumber}`)
    setShowContactDropdown(false)
  }

  const handleWhatsApp = (phoneNumber: string) => {
    // 📊 Track WhatsApp contact
    track.contactWhatsApp(profile.id, 'escort')
    const cleanNumber = phoneNumber.replace(/\+|\s/g, '')
    const message = `Salut ${profile.stageName} ! Je souhaite vous contacter via FELORA.`
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`)
    setShowContactDropdown(false)
  }

  return (
    <>
      {/* Header style TikTok fixe */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => {
              try { (window as any)?.umami?.track?.('nav_back', { from: 'profile_header_simple' }) } catch {}
              router.back()
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold">{profile.stageName}</h1>
          </div>

          <button
            onClick={() => toggleFavorite(profile.id)}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <Star 
              size={24} 
              className={`transition-colors ${isProfileFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`}
            />
          </button>
        </div>
      </div>

      {/* Contenu du header profil */}
      {/* Add top padding to clear the fixed header (~72px) */}
      <div className="px-4 pt-[72px] pb-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Photo de profil ronde avec bordure gradient */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5">
              <img
                src={profile.media}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover border-2 border-black"
              />
            </div>
            {profile.online && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
            )}
          </div>

          {/* Stats et actions */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-6">
                <div className="text-center cursor-pointer">
                  <div className="text-lg font-bold">{totalReactions}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    {Object.keys(reactions).slice(0, 3).map(emoji => (
                      <span key={emoji}>{emoji}</span>
                    ))}
                    <span>Réactions</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.reviews}</div>
                  <div className="text-xs text-gray-400">Avis</div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => onShowDetail && onShowDetail()}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg font-medium text-sm transition-all hover:from-slate-700 hover:to-slate-800 active:scale-95">
                Voir plus
              </button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGiftModal(true)}
                className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-medium text-sm transition-all hover:from-pink-600 hover:to-purple-600 active:scale-95 shadow-md flex items-center gap-1"
              >
                <Diamond size={14} />
              </motion.button>
              
              {/* Bouton Message - logique intelligente selon le rôle */}
              {(() => {
                const messageConfig = getMessageButtonConfig(session?.user, profile, router)
                
                if (!messageConfig.showButton) return null
                
                return (
                  <button 
                    onClick={handleMessage}
                    disabled={messageConfig.disabled}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm transition-all hover:from-blue-600 hover:to-cyan-600 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {messageConfig.buttonText}
                  </button>
                )
              })()}
              
              {/* Bouton Contact avec dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowContactDropdown(!showContactDropdown)}
                  className="p-2 rounded-lg bg-white/10 text-gray-300 border border-white/20 transition-all hover:bg-white/15 active:scale-95 flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown menu */}
                {showContactDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl z-50 min-w-[160px]">
                    <div className="py-2">
                      <button
                        onClick={() => handleCall(extendedData.contact.phone)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        Appeler
                      </button>
                      
                      <button
                        onClick={() => handleWhatsApp(extendedData.contact.whatsapp)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.891 3.426"/>
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div className="space-y-3">
          <div>
            <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
              {profile.name}
              {profile.verified && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-[#111827] border border-white/20 text-[#4FD1C7]"
                  title="Profil vérifié"
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                </div>
              )}
              {profile.premium && (
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown size={12} className="text-white" />
                </div>
              )}
            </h2>
            
            {/* Description */}
            <div className="mb-2">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {showFullDescription 
                  ? profile.description 
                  : profile.description.length > 200 
                    ? `${profile.description.substring(0, 200)}...`
                    : profile.description
                }
              </p>
              {profile.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-pink-400 text-xs font-medium mt-1 hover:text-pink-300 transition-colors"
                >
                  {showFullDescription ? 'Voir moins' : 'Voir plus'}
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.location}</span>
              </div>
              <span>•</span>
              <span>{profile.age} ans</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{profile.rating} ({profile.reviews})</span>
              </div>
              {profile.online && (
                <>
                  <span>•</span>
                  <span className="text-green-400">En ligne</span>
                </>
              )}
            </div>
          </div>

          {/* Disponibilité - Affiche seulement si agenda activé */}
          {(() => {
            return true
          })() && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${profile.online ? 'bg-green-500' : 'bg-red-500'}`} />
                <h4 className="font-semibold text-sm">
                  {profile.online ? 'Disponible maintenant' : 'Indisponible'} - {extendedData.location.city}
                </h4>
              </div>
              
              {profile.online && (
                <div className="flex gap-2 flex-wrap mb-2 items-center">
                  <div className="px-3 py-1.5 bg-green-500/20 rounded-lg text-xs font-medium border border-green-500/40 text-green-300">
                    10h-21h
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags services */}
          <div className="flex flex-wrap gap-1.5">
            {profile.services.slice(0, 6).map((service, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/10 rounded-lg text-xs border border-white/10"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modal cadeau (simple) */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg border border-white/10">
            <p className="text-white mb-4">🎁 Modal Cadeau - À implémenter</p>
            <button 
              onClick={() => setShowGiftModal(false)}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
