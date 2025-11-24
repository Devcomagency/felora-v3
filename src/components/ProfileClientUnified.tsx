'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePublicProfile } from '@/hooks/useUnifiedProfile'
import { ArrowLeft, MapPin, Star, Heart, MessageCircle, Crown, BadgeCheck, X, Clock, Users, Home, Car, CreditCard, Settings, Phone, Smartphone, MessageSquare, ExternalLink } from 'lucide-react'

// Composant pour afficher les étoiles des langues
const LanguageStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1 ml-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={`${
            star <= rating
              ? 'text-pink-400 fill-pink-400'
              : 'text-gray-500'
          } transition-colors`}
        />
      ))}
    </div>
  )
}

/**
 * MODAL PROFIL UNIFIÉ COMPLET - Utilise 100% des champs de l'API unifiée
 *
 * Ce modal affiche TOUS les champs disponibles dans l'API /api/profile/unified/[id]
 * Architecture propre sans legacy, directement connecté aux données transformées
 */

interface ProfileClientUnifiedProps {
  profileId: string
  onClose: () => void
}

export function ProfileClientUnified({ profileId, onClose }: ProfileClientUnifiedProps) {
  const t = useTranslations('profileModal')
  const tCategories = useTranslations('categories')
  const tServices = useTranslations('dashboardEscort.profil.services.items')
  const { profile, loading, error } = usePublicProfile(profileId)
  const router = useRouter()

  // Fonction pour ouvrir la messagerie
  const handleMessage = () => {
    // Fermer le modal
    onClose()
    // Rediriger vers la messagerie
    router.push(`/messages?to=${encodeURIComponent(profileId)}`)
  }

  // Assurer que safeProfile.options existe avec des valeurs par défaut
  const safeProfile = profile ? {
    ...profile,
    options: profile.options || {
      paymentMethods: [],
      amenities: [],
      acceptedCurrencies: []
    },
    // Parse customPrices si présent
    customPrices: (() => {
      try {
        if ((profile as any).customPrices) {
          return typeof (profile as any).customPrices === 'string' 
            ? JSON.parse((profile as any).customPrices) 
            : (profile as any).customPrices
        }
      } catch (e) {
        console.error('Error parsing customPrices:', e)
      }
      return []
    })()
  } : null


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-white">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32"></div>
          </div>
          <p className="text-gray-300 mt-4">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !safeProfile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-white text-center max-w-md mx-4">
          <div className="text-red-400 mb-4">
            <X className="w-8 h-8 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('error.title')}</h3>
          <p className="text-gray-300 mb-4">{error || t('error.description')}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black" />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Modal container - Full height sur mobile, centré sur desktop */}
      <div className="relative h-full flex items-end sm:items-center justify-center z-10">
        <div className="relative w-full sm:max-w-4xl h-[95vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-black/90 via-black/95 to-black backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">

          {/* Swipe indicator - mobile only */}
          <div className="sm:hidden flex-shrink-0 pt-2 pb-1 flex justify-center" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
          </div>

          {/* Header avec fermeture - Fixed on top */}
          <div className="flex-shrink-0 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-2 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Photo de profil réelle avec effet rose */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.4)] ring-2 sm:ring-3 ring-pink-500/50 bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-fuchsia-500/10">
                    {safeProfile.avatar ? (
                      <img
                        src={safeProfile.avatar}
                        alt={safeProfile.stageName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.parentElement?.querySelector('.fallback-avatar')
                          if (fallback) (fallback as HTMLElement).style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="fallback-avatar w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white" style={{ display: safeProfile.avatar ? 'none' : 'flex' }}>
                      {safeProfile.stageName.charAt(0)}
                    </div>
                  </div>
                  {/* Badge vérifié si applicable */}
                  {safeProfile.isVerifiedBadge && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                      <BadgeCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Informations réorganisées */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 truncate">{safeProfile.stageName}</h1>

                  {/* Ligne 1: Âge et Lieu */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 text-xs sm:text-sm">
                    {safeProfile.age && (
                      <span className="text-white/80 font-medium">{safeProfile.age} ans</span>
                    )}
                    {safeProfile.city && (
                      <>
                        {safeProfile.age && <span className="text-white/40">•</span>}
                        <span className="flex items-center gap-1 text-white/70 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{safeProfile.city}{safeProfile.canton ? `, ${safeProfile.canton}` : ''}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Ligne 2: Catégorie (Transsexuel, etc.) */}
                  {safeProfile.category && (
                    <div className="inline-flex items-center gap-2">
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 rounded-full text-[10px] sm:text-xs font-medium border border-pink-500/30">
                        {tCategories(safeProfile.category) || safeProfile.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable - flex-1 pour prendre l'espace restant */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6" style={{ paddingBottom: 'max(120px, calc(80px + env(safe-area-inset-bottom)))' }}>

              {/* 1. Profil physique - En premier selon la demande */}
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-4 sm:p-5 shadow-lg">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></span>
                    {t("sections.physical")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {safeProfile.physical.height && (
                      <div className="group p-2.5 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg hover:border-pink-500/40 transition-all duration-300">
                        <div className="text-[10px] sm:text-xs text-pink-300/70 mb-0.5 uppercase tracking-wide">{t("physical.height")}</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{safeProfile.physical.height} cm</div>
                      </div>
                    )}
                    {safeProfile.physical.bodyType && (
                      <div className="group p-2.5 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg hover:border-pink-500/40 transition-all duration-300">
                        <div className="text-[10px] sm:text-xs text-pink-300/70 mb-0.5 uppercase tracking-wide">{t("physical.bodyType")}</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{safeProfile.physical.bodyType}</div>
                      </div>
                    )}
                    {safeProfile.physical.hairColor && (
                      <div className="group p-2.5 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg hover:border-pink-500/40 transition-all duration-300">
                        <div className="text-[10px] sm:text-xs text-pink-300/70 mb-0.5 uppercase tracking-wide">{t("physical.hairColor")}</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{safeProfile.physical.hairColor}</div>
                      </div>
                    )}
                    {safeProfile.physical.eyeColor && (
                      <div className="group p-2.5 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg hover:border-pink-500/40 transition-all duration-300">
                        <div className="text-[10px] sm:text-xs text-pink-300/70 mb-0.5 uppercase tracking-wide">{t("physical.eyeColor")}</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{safeProfile.physical.eyeColor}</div>
                      </div>
                    )}
                    {safeProfile.physical.ethnicity && (
                      <div className="group p-2.5 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg hover:border-pink-500/40 transition-all duration-300">
                        <div className="text-[10px] sm:text-xs text-pink-300/70 mb-0.5 uppercase tracking-wide">{t("physical.ethnicity")}</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{safeProfile.physical.ethnicity}</div>
                      </div>
                    )}
                    {safeProfile.physical.bustSize && (
                      <div className="group p-2.5 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg hover:border-pink-500/40 transition-all duration-300">
                        <div className="text-[10px] sm:text-xs text-pink-300/70 mb-0.5 uppercase tracking-wide">{t("physical.bustSize")}</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{safeProfile.physical.bustSize}</div>
                      </div>
                    )}
                    {safeProfile.physical.breastType && (
                      <div className="group p-2.5 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg hover:border-pink-500/40 transition-all duration-300">
                        <div className="text-[10px] sm:text-xs text-pink-300/70 mb-0.5 uppercase tracking-wide">{t("physical.breastType")}</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{safeProfile.physical.breastType}</div>
                      </div>
                    )}
                    {safeProfile.physical.pubicHair && (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                        <div className="text-xs text-white/60 mb-1">{t("physical.pubicHair")}</div>
                        <div className="text-white text-sm font-medium">{safeProfile.physical.pubicHair}</div>
                      </div>
                    )}
                    {(safeProfile.physical.tattoos || safeProfile.physical.piercings || safeProfile.physical.smoker !== undefined) && (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                        <div className="text-xs text-white/60 mb-2">{t("physical.specificities")}</div>
                        <div className="flex flex-wrap gap-1">
                          {safeProfile.physical.tattoos && (
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                              {t("physical.tattoos")}
                            </span>
                          )}
                          {safeProfile.physical.piercings && (
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                              {t("physical.piercings")}
                            </span>
                          )}
                          {safeProfile.physical.smoker !== undefined && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              safeProfile.physical.smoker ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                              {safeProfile.physical.smoker ? t('physical.smoker') : t('physical.nonSmoker')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Services - En deuxième selon la demande */}
              {safeProfile.options?.amenities && safeProfile.options.amenities.length > 0 && (
                <>
                  {safeProfile.options.amenities.filter(amenity => {
                    const cleanAmenity = amenity.replace(/^(opt:|srv:)/, '').toLowerCase();
                    const equipmentKeywords = ['douche à deux', 'jacuzzi', 'sauna', 'climatisation', 'fumoir', 'parking', 'accès handicapé', 'ambiance musicale', 'bar', 'pole dance'];
                    const locationKeywords = ['privé', 'discret', 'luxe', 'appartement', 'studio', 'maison'];

                    // C'est un service si ce n'est ni un équipement ni un lieu
                    const isEquipment = equipmentKeywords.some(keyword => cleanAmenity.includes(keyword));
                    const isLocation = locationKeywords.some(keyword => cleanAmenity.includes(keyword));

                    return !isEquipment && !isLocation;
                  }).length > 0 && (
                    <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                      <div className="p-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></span>
                          {t("sections.services")}
                        </h3>
                        <div className="grid grid-cols-2 gap-1.5">
                          {safeProfile.options.amenities.filter(amenity => {
                            const cleanAmenity = amenity.replace(/^(opt:|srv:)/, '').toLowerCase();
                            const equipmentKeywords = ['douche à deux', 'jacuzzi', 'sauna', 'climatisation', 'fumoir', 'parking', 'accès handicapé', 'ambiance musicale', 'bar', 'pole dance'];
                            const locationKeywords = ['privé', 'discret', 'luxe', 'appartement', 'studio', 'maison'];

                            const isEquipment = equipmentKeywords.some(keyword => cleanAmenity.includes(keyword));
                            const isLocation = locationKeywords.some(keyword => cleanAmenity.includes(keyword));

                            return !isEquipment && !isLocation;
                          }).map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5 px-2 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:border-purple-400/40 transition-all"
                            >
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></span>
                              <span className="text-purple-300 text-xs font-medium truncate">
                                {amenity.replace(/^(opt:|srv:)/, '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 3. Services & Spécialités - En troisième selon la demande */}
              {(safeProfile.services && safeProfile.services.length > 0) && (
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></span>{t("sections.servicesAndSpecialties")}</h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {safeProfile.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20 hover:border-pink-400/40 transition-all"
                        >
                          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full flex-shrink-0"></span>
                          <span className="text-pink-300 text-xs font-medium truncate">
                            {tServices(service) || service}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Langues - En quatrième selon la demande */}
              {safeProfile.languages && Object.keys(safeProfile.languages).length > 0 && (
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                  <div className="p-5">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2"><span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></span>{t("sections.languages")}</h3>
                    <div className="space-y-3">
                      {Object.entries(safeProfile.languages)
                        .filter(([language]) => language.length > 2) // Filtrer les codes courts comme "FR", "EN", etc.
                        .map(([language, rating]) => (
                        <div
                          key={language}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all"
                        >
                          <span className="text-blue-300 font-medium text-sm">
                            {language}
                          </span>
                          <LanguageStars rating={rating} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Équipements - En cinquième selon la demande */}
              {safeProfile.options?.amenities && safeProfile.options.amenities.length > 0 && (
                <>
                  {safeProfile.options.amenities.filter(amenity => {
                    const cleanAmenity = amenity.replace(/^(opt:|srv:)/, '').toLowerCase();
                    const equipmentKeywords = ['douche à deux', 'jacuzzi', 'sauna', 'climatisation', 'fumoir', 'parking', 'accès handicapé', 'ambiance musicale', 'bar', 'pole dance'];
                    return equipmentKeywords.some(keyword => cleanAmenity.includes(keyword));
                  }).length > 0 && (
                    <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                      <div className="p-4">
                        <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-orange-400" />
                          {t("sections.equipment")}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {safeProfile.options.amenities.filter(amenity => {
                            const cleanAmenity = amenity.replace(/^(opt:|srv:)/, '').toLowerCase();
                            const equipmentKeywords = ['douche à deux', 'jacuzzi', 'sauna', 'climatisation', 'fumoir', 'parking', 'accès handicapé', 'ambiance musicale', 'bar', 'pole dance'];
                            return equipmentKeywords.some(keyword => cleanAmenity.includes(keyword));
                          }).map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
                            >
                              <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></span>
                              <span className="text-orange-300 text-xs font-medium truncate">
                                {amenity.replace(/^(opt:|srv:)/, '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 6. Tarifs - En sixième selon la demande */}
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                <div className="p-4">
                  <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-pink-400" />
                    {t("sections.rates")}
                  </h3>

                  {/* Tarif principal compact */}
                  {(safeProfile.rates.baseRate || safeProfile.rates.oneHour) && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-lg text-center border border-pink-500/30">
                      <div className="text-base font-bold text-white">
                        {safeProfile.rates.baseRate || safeProfile.rates.oneHour} {safeProfile.rates.currency}
                      </div>
                      <div className="text-[10px] text-white/60">{t("rates.from")}</div>
                    </div>
                  )}

                  {/* Grille des tarifs - Design compact et fin */}
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5">
                    {safeProfile.rates.fifteenMin && (
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                        <div className="text-xs font-semibold text-white">
                          {safeProfile.rates.fifteenMin}
                        </div>
                        <div className="text-[9px] text-white/50">{t("rates.fifteenMin")}</div>
                      </div>
                    )}
                    {safeProfile.rates.thirtyMin && (
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                        <div className="text-xs font-semibold text-white">
                          {safeProfile.rates.thirtyMin}
                        </div>
                        <div className="text-[9px] text-white/50">{t("rates.thirtyMin")}</div>
                      </div>
                    )}
                    {safeProfile.rates.oneHour && safeProfile.rates.baseRate && safeProfile.rates.oneHour !== safeProfile.rates.baseRate && (
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                        <div className="text-xs font-semibold text-white">
                          {safeProfile.rates.oneHour}
                        </div>
                        <div className="text-[9px] text-white/50">{t("rates.oneHour")}</div>
                      </div>
                    )}
                    {safeProfile.rates.twoHours && (
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                        <div className="text-xs font-semibold text-white">
                          {safeProfile.rates.twoHours}
                        </div>
                        <div className="text-[9px] text-white/50">{t("rates.twoHours")}</div>
                      </div>
                    )}
                    {safeProfile.rates.halfDay && (
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                        <div className="text-xs font-semibold text-white">
                          {safeProfile.rates.halfDay}
                        </div>
                        <div className="text-[9px] text-white/50">{t("rates.halfDay")}</div>
                      </div>
                    )}
                    {safeProfile.rates.fullDay && (
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                        <div className="text-xs font-semibold text-white">
                          {safeProfile.rates.fullDay}
                        </div>
                        <div className="text-[9px] text-white/50">{t("rates.fullDay")}</div>
                      </div>
                    )}
                    {safeProfile.rates.overnight && (
                      <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                        <div className="text-xs font-semibold text-white">
                          {safeProfile.rates.overnight}
                        </div>
                        <div className="text-[9px] text-white/50">{t("rates.overnight")}</div>
                      </div>
                    )}

                    {/* Tarifs personnalisés intégrés dans la même grille */}
                    {safeProfile.customPrices && Array.isArray(safeProfile.customPrices) && safeProfile.customPrices.length > 0 && (
                      <>
                        {safeProfile.customPrices.map((customPrice: { label?: string; duration: string; price: string | number }, index: number) => (
                          <div key={index} className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-center hover:border-pink-500/30 transition-colors">
                            <div className="text-xs font-semibold text-white">
                              {customPrice.price}
                            </div>
                            <div className="text-[9px] text-white/50">{customPrice.label || customPrice.duration}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 7. Paiements - En septième selon la demande */}
              {safeProfile.options?.paymentMethods && safeProfile.options.paymentMethods.length > 0 && (
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                  <div className="p-4">
                    <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-400" />
                      {t("sections.payments")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {safeProfile.options.paymentMethods.map((method, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg text-sm border border-green-500/30 font-medium"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Devises - En huitième selon la demande */}
              {safeProfile.options?.acceptedCurrencies && safeProfile.options.acceptedCurrencies.length > 0 && (
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                  <div className="p-4">
                    <h3 className="text-md font-medium text-white/90 mb-3">{t("sections.currencies")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {safeProfile.options.acceptedCurrencies.map((currency, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-lg text-sm border border-yellow-500/30 font-medium"
                        >
                          {currency}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. LE RESTE NE BOUGE PAS - Mode de service */}
              {(safeProfile.availability.incall || safeProfile.availability.outcall) && (
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-pink-400" />
                      {t("sections.prestations")}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {safeProfile.availability.incall && (
                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <Home className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="text-white font-medium text-sm">{t("prestations.incall")}</div>
                        </div>
                      )}
                      {safeProfile.availability.outcall && (
                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Car className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="text-white font-medium text-sm">{t("prestations.outcall")}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Clientèle acceptée - Ne bouge pas */}
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-400" />
                    {t("sections.clientele")}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {safeProfile.clientele.acceptsCouples && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">{t("clientele.couples")}</span>
                      </div>
                    )}
                    {safeProfile.clientele.acceptsWomen && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">{t("clientele.women")}</span>
                      </div>
                    )}
                    {safeProfile.clientele.acceptsHandicapped && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">{t("clientele.handicapped")}</span>
                      </div>
                    )}
                    {safeProfile.clientele.acceptsSeniors && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">{t("clientele.seniors")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lieu & Équipements séparés - Ne bouge pas */}
              {safeProfile.options?.amenities && safeProfile.options.amenities.length > 0 && (
                <>
                  {/* Lieux */}
                  {safeProfile.options.amenities.filter(amenity => amenity.startsWith('opt:') && (amenity.includes('privé') || amenity.includes('discret') || amenity.includes('luxe') || amenity.includes('appartement') || amenity.includes('studio') || amenity.includes('maison'))).length > 0 && (
                    <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                      <div className="p-4">
                        <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-400" />
                          {t("sections.location")}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {safeProfile.options.amenities.filter(amenity => amenity.startsWith('opt:') && (amenity.includes('privé') || amenity.includes('discret') || amenity.includes('luxe') || amenity.includes('appartement') || amenity.includes('studio') || amenity.includes('maison'))).map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20"
                            >
                              <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                              <span className="text-blue-300 text-xs font-medium truncate">
                                {amenity.replace(/^opt:/, '')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Actions de contact - Gestion intelligente du téléphone */}
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-lg">
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{t("contact.title", { name: safeProfile.stageName })}</h3>
                    <p className="text-white/90 text-sm">{t("contact.subtitle")}</p>
                  </div>

                  <div className="space-y-3">
                    {/* Bouton Message Interne */}
                    <button 
                      onClick={handleMessage}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 hover:from-pink-500/20 hover:via-purple-500/20 hover:to-blue-500/20 rounded-xl text-white font-medium transition-all duration-300 text-sm border border-pink-500/30 hover:border-pink-400/50"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t("contact.privateMessage")}</span>
                    </button>

                    {/* Section Téléphone - Gestion des 3 cas */}
                    {safeProfile.contact && (() => {
                      const { phoneVisibility, phone } = safeProfile.contact;
                      const phoneNumber = phone || '';
                      const cleanPhone = phoneNumber.replace(/\D/g, ''); // Nettoyer le numéro pour les liens
                      const displayName = safeProfile.stageName;

                      // Messages pré-remplis
                      const whatsappMessage = `Bonjour ${displayName}, je vous écris depuis Felora.`;
                      const smsMessage = `Bonjour ${displayName}, je vous écris depuis Felora.`;

                      // Liens directs
                      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
                      const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(smsMessage)}`;
                      const callUrl = `tel:${cleanPhone}`;

                      if (phoneVisibility === 'visible' && phoneNumber) {
                        // CAS 1: Numéro visible - Afficher le numéro + boutons
                        return (
                          <div className="space-y-2">
                            <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                              <div className="flex items-center justify-center gap-2 text-green-300">
                                <Phone className="w-4 h-4" />
                                <span className="font-mono text-sm">{phoneNumber}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-xl text-green-300 hover:text-green-200 font-medium transition-all duration-300 border border-green-600/30 text-xs"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>{t("contact.whatsapp")}</span>
                              </a>
                              <a
                                href={smsUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 border border-blue-600/30 text-xs"
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>{t("contact.sms")}</span>
                              </a>
                              <a
                                href={callUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-xl text-orange-300 hover:text-orange-200 font-medium transition-all duration-300 border border-orange-600/30 text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{t("contact.call")}</span>
                              </a>
                            </div>
                          </div>
                        );
                      } else if (phoneVisibility === 'hidden' && phoneNumber) {
                        // CAS 2: Numéro caché - Boutons uniquement (numéro masqué mais fonctionnel)
                        return (
                          <div className="space-y-2">
                            <div className="text-center px-2 py-1 bg-white/[0.03] rounded-lg border border-white/5">
                              <div className="flex items-center justify-center gap-1.5 text-white/40">
                                <Phone className="w-3 h-3" />
                                <span className="text-[10px]">{t("contact.phoneAvailable")}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-xl text-green-300 hover:text-green-200 font-medium transition-all duration-300 border border-green-600/30 text-xs"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>{t("contact.whatsapp")}</span>
                              </a>
                              <a
                                href={smsUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-xl text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 border border-blue-600/30 text-xs"
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>{t("contact.sms")}</span>
                              </a>
                              <a
                                href={callUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-xl text-orange-300 hover:text-orange-200 font-medium transition-all duration-300 border border-orange-600/30 text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{t("contact.call")}</span>
                              </a>
                            </div>
                          </div>
                        );
                      } else if (phoneVisibility === 'none') {
                        // CAS 3: Messagerie privée uniquement - Simple message text
                        return (
                          <div className="text-center p-4 bg-purple-700/20 rounded-xl border border-purple-600/20">
                            <div className="flex items-center justify-center gap-2 text-purple-300">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">{t("contact.privateMessagingOnly")}</span>
                            </div>
                          </div>
                        );
                      }

                      return null; // Pas de contact téléphonique disponible
                    })()}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}