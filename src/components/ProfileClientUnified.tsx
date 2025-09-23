'use client'

import { useState, useEffect } from 'react'
import { usePublicProfile } from '@/hooks/useUnifiedProfile'
import { ArrowLeft, MapPin, Star, Heart, MessageCircle, Crown, BadgeCheck, X, Clock, Users, Home, Car, CreditCard, Settings } from 'lucide-react'

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
  const { profile, loading, error } = usePublicProfile(profileId)

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-white">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32"></div>
          </div>
          <p className="text-gray-300 mt-4">Chargement du profil unifié...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-8 text-white max-w-md">
          <div className="text-red-400 mb-4">
            <X className="w-8 h-8 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-gray-300 mb-4">{error || 'Profil non trouvé'}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border border-gray-800">

          {/* Header avec fermeture */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-lg border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar avec gradient ring style Felora */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-white">
                      {profile.stageName.charAt(0)}
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white truncate">{profile.stageName}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-300">
                    {profile.age && <span>{profile.age} ans</span>}
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.city}, {profile.canton}
                      </span>
                    )}
                    {profile.category && (
                      <span className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 rounded-full text-xs border border-pink-500/30">
                        {profile.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="overflow-y-auto max-h-[calc(95vh-100px)]">
            <div className="p-6 space-y-6">

              {/* Description */}
              {profile.description && (
                <div className="glass-card">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white">À propos</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 leading-relaxed">{profile.description}</p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="glass-card">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">Aperçu</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${profile.availability.availableNow ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      <div className="text-xs text-gray-300">
                        {profile.availability.availableNow ? 'Disponible' : 'Occupée'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                      <Clock className={`w-4 h-4 mx-auto mb-2 ${profile.availability.weekendAvailable ? 'text-green-400' : 'text-gray-400'}`} />
                      <div className="text-xs text-gray-300">
                        {profile.availability.weekendAvailable ? 'Week-end OK' : 'Semaine uniquement'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode de service */}
              {(profile.availability.incall || profile.availability.outcall) && (
                <div className="glass-card">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Mode de service
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-3">
                      {profile.availability.incall && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full border border-green-500/30">
                          <Home className="w-4 h-4" />
                          <span>Je reçois</span>
                        </div>
                      )}
                      {profile.availability.outcall && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full border border-blue-500/30">
                          <Car className="w-4 h-4" />
                          <span>Je me déplace</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tarifs */}
              <div className="glass-card">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Tarifs
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {/* Tarif principal */}
                    {(profile.rates.baseRate || profile.rates.oneHour) && (
                      <div className="text-center p-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg">
                        <div className="text-2xl font-bold text-white">
                          {profile.rates.baseRate || profile.rates.oneHour} {profile.rates.currency}
                        </div>
                        <div className="text-sm text-white/80">À partir de</div>
                      </div>
                    )}

                    {/* Grille des tarifs détaillés */}
                    <div className="grid grid-cols-2 gap-3">
                      {profile.rates.fifteenMin && (
                        <div className="text-center p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="font-semibold text-white">{profile.rates.fifteenMin} {profile.rates.currency}</div>
                          <div className="text-xs text-gray-400">15 min</div>
                        </div>
                      )}
                      {profile.rates.thirtyMin && (
                        <div className="text-center p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="font-semibold text-white">{profile.rates.thirtyMin} {profile.rates.currency}</div>
                          <div className="text-xs text-gray-400">30 min</div>
                        </div>
                      )}
                      {profile.rates.oneHour && profile.rates.baseRate && profile.rates.oneHour !== profile.rates.baseRate && (
                        <div className="text-center p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="font-semibold text-white">{profile.rates.oneHour} {profile.rates.currency}</div>
                          <div className="text-xs text-gray-400">1h</div>
                        </div>
                      )}
                      {profile.rates.twoHours && (
                        <div className="text-center p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="font-semibold text-white">{profile.rates.twoHours} {profile.rates.currency}</div>
                          <div className="text-xs text-gray-400">2h</div>
                        </div>
                      )}
                      {profile.rates.halfDay && (
                        <div className="text-center p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="font-semibold text-white">{profile.rates.halfDay} {profile.rates.currency}</div>
                          <div className="text-xs text-gray-400">Demi-journée</div>
                        </div>
                      )}
                      {profile.rates.fullDay && (
                        <div className="text-center p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="font-semibold text-white">{profile.rates.fullDay} {profile.rates.currency}</div>
                          <div className="text-xs text-gray-400">Journée</div>
                        </div>
                      )}
                      {profile.rates.overnight && (
                        <div className="text-center p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                          <div className="font-semibold text-white">{profile.rates.overnight} {profile.rates.currency}</div>
                          <div className="text-xs text-gray-400">Nuit</div>
                        </div>
                      )}
                    </div>

                    {/* Info note */}
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm flex items-start gap-2">
                        <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        Tarifs indicatifs, contactez pour un devis précis
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Langues */}
              {profile.languages.length > 0 && (
                <div className="glass-card">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white">Langues parlées</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Services */}
              {profile.services.length > 0 && (
                <div className="glass-card">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white">Services proposés</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 rounded-full text-sm border border-pink-500/30"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Clientèle acceptée */}
              <div className="glass-card">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Clientèle acceptée
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.clientele.acceptsCouples && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        Couples
                      </span>
                    )}
                    {profile.clientele.acceptsWomen && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        Femmes
                      </span>
                    )}
                    {profile.clientele.acceptsHandicapped && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        Personnes handicapées
                      </span>
                    )}
                    {profile.clientele.acceptsSeniors && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        Personnes âgées
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Caractéristiques physiques */}
              <div className="glass-card">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">Caractéristiques physiques</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {profile.physical.height && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Taille</span>
                        <span className="text-white font-medium">{profile.physical.height} cm</span>
                      </div>
                    )}
                    {profile.physical.bodyType && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Silhouette</span>
                        <span className="text-white font-medium">{profile.physical.bodyType}</span>
                      </div>
                    )}
                    {profile.physical.hairColor && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Cheveux</span>
                        <span className="text-white font-medium">{profile.physical.hairColor}</span>
                      </div>
                    )}
                    {profile.physical.eyeColor && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Yeux</span>
                        <span className="text-white font-medium">{profile.physical.eyeColor}</span>
                      </div>
                    )}
                    {profile.physical.ethnicity && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Origine</span>
                        <span className="text-white font-medium">{profile.physical.ethnicity}</span>
                      </div>
                    )}
                    {profile.physical.bustSize && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Tour poitrine</span>
                        <span className="text-white font-medium">{profile.physical.bustSize}</span>
                      </div>
                    )}
                    {profile.physical.breastType && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Type poitrine</span>
                        <span className="text-white font-medium">{profile.physical.breastType}</span>
                      </div>
                    )}
                    {profile.physical.pubicHair && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Pilosité</span>
                        <span className="text-white font-medium">{profile.physical.pubicHair}</span>
                      </div>
                    )}
                    {profile.physical.tattoos && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Tatouages</span>
                        <span className="text-white font-medium">Oui</span>
                      </div>
                    )}
                    {profile.physical.piercings && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Piercings</span>
                        <span className="text-white font-medium">Oui</span>
                      </div>
                    )}
                    {profile.physical.smoker !== undefined && (
                      <div className="flex justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                        <span className="text-gray-400">Fumeur</span>
                        <span className="text-white font-medium">{profile.physical.smoker ? 'Oui' : 'Non'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Méthodes de paiement */}
              {profile.options.paymentMethods.length > 0 && (
                <div className="glass-card">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Méthodes de paiement
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.options.paymentMethods.map((method, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-full text-sm border border-green-500/30"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Devises acceptées */}
              {profile.options.acceptedCurrencies.length > 0 && (
                <div className="glass-card">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white">Devises acceptées</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.options.acceptedCurrencies.map((currency, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-full text-sm border border-yellow-500/30"
                        >
                          {currency}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Équipements du lieu */}
              {profile.options.amenities.length > 0 && (
                <div className="glass-card">
                  <div className="p-4 border-b border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Lieu & Options
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.options.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30"
                        >
                          {amenity.replace(/^(opt:|srv:)/, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions de contact - Style Felora */}
              <div className="glass-card">
                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">Contactez {profile.stageName}</h3>
                    <p className="text-gray-300 text-sm">Démarrez une conversation maintenant</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105">
                      <MessageCircle className="w-5 h-5" />
                      <span>Envoyer un message</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 font-semibold transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50">
                      <Heart className="w-5 h-5" />
                      <span>Ajouter aux favoris</span>
                    </button>
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