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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">

          {/* Header avec fermeture */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 truncate">{profile.stageName}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  {profile.age && <span>{profile.age} ans</span>}
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.city}
                    </span>
                  )}
                  {profile.category && (
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs">
                      {profile.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">

              {/* Description */}
              {profile.description && (
                <div className="text-gray-600 leading-relaxed">
                  {profile.description}
                </div>
              )}

              {/* Mode de service */}
              {(profile.availability.incall || profile.availability.outcall) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Mode de service
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.availability.incall && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                        <Home className="w-3 h-3" />
                        <span>Je reçois</span>
                      </div>
                    )}
                    {profile.availability.outcall && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                        <Car className="w-3 h-3" />
                        <span>Je me déplace</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Disponibilité */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${profile.availability.availableNow ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="text-xs text-gray-600">
                    {profile.availability.availableNow ? 'Disponible maintenant' : 'Non disponible'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Clock className={`w-4 h-4 mx-auto mb-1 ${profile.availability.weekendAvailable ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="text-xs text-gray-600">
                    {profile.availability.weekendAvailable ? 'Week-ends OK' : 'Semaine uniquement'}
                  </div>
                </div>
              </div>

              {/* Tarifs */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Tarifs
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(profile.rates.baseRate || profile.rates.oneHour) && (
                    <div className="col-span-2 text-center p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white">
                      <div className="text-lg font-bold">
                        {profile.rates.baseRate || profile.rates.oneHour} {profile.rates.currency}
                      </div>
                      <div className="text-xs opacity-90">À partir de</div>
                    </div>
                  )}

                  {profile.rates.fifteenMin && (
                    <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{profile.rates.fifteenMin} {profile.rates.currency}</div>
                      <div className="text-xs text-gray-500">15 min</div>
                    </div>
                  )}
                  {profile.rates.thirtyMin && (
                    <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{profile.rates.thirtyMin} {profile.rates.currency}</div>
                      <div className="text-xs text-gray-500">30 min</div>
                    </div>
                  )}
                  {profile.rates.oneHour && profile.rates.baseRate && profile.rates.oneHour !== profile.rates.baseRate && (
                    <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{profile.rates.oneHour} {profile.rates.currency}</div>
                      <div className="text-xs text-gray-500">1h</div>
                    </div>
                  )}
                  {profile.rates.twoHours && (
                    <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{profile.rates.twoHours} {profile.rates.currency}</div>
                      <div className="text-xs text-gray-500">2h</div>
                    </div>
                  )}
                  {profile.rates.halfDay && (
                    <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{profile.rates.halfDay} {profile.rates.currency}</div>
                      <div className="text-xs text-gray-500">Demi-journée</div>
                    </div>
                  )}
                  {profile.rates.fullDay && (
                    <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{profile.rates.fullDay} {profile.rates.currency}</div>
                      <div className="text-xs text-gray-500">Journée</div>
                    </div>
                  )}
                  {profile.rates.overnight && (
                    <div className="text-center p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="font-semibold text-gray-900">{profile.rates.overnight} {profile.rates.currency}</div>
                      <div className="text-xs text-gray-500">Nuit</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Langues */}
              {profile.languages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Langues parlées</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {profile.services.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Services proposés</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clientèle acceptée */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Clientèle acceptée
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.clientele.acceptsCouples && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      Couples
                    </span>
                  )}
                  {profile.clientele.acceptsWomen && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      Femmes
                    </span>
                  )}
                  {profile.clientele.acceptsHandicapped && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      Personnes handicapées
                    </span>
                  )}
                  {profile.clientele.acceptsSeniors && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      Personnes âgées
                    </span>
                  )}
                </div>
              </div>

              {/* Caractéristiques physiques */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Caractéristiques</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {profile.physical.height && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taille</span>
                      <span className="text-gray-900">{profile.physical.height} cm</span>
                    </div>
                  )}
                  {profile.physical.bodyType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Silhouette</span>
                      <span className="text-gray-900">{profile.physical.bodyType}</span>
                    </div>
                  )}
                  {profile.physical.hairColor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cheveux</span>
                      <span className="text-gray-900">{profile.physical.hairColor}</span>
                    </div>
                  )}
                  {profile.physical.eyeColor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yeux</span>
                      <span className="text-gray-900">{profile.physical.eyeColor}</span>
                    </div>
                  )}
                  {profile.physical.ethnicity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Origine</span>
                      <span className="text-gray-900">{profile.physical.ethnicity}</span>
                    </div>
                  )}
                  {profile.physical.bustSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tour poitrine</span>
                      <span className="text-gray-900">{profile.physical.bustSize}</span>
                    </div>
                  )}
                  {profile.physical.breastType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type poitrine</span>
                      <span className="text-gray-900">{profile.physical.breastType}</span>
                    </div>
                  )}
                  {profile.physical.pubicHair && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pilosité</span>
                      <span className="text-gray-900">{profile.physical.pubicHair}</span>
                    </div>
                  )}
                  {profile.physical.tattoos && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tatouages</span>
                      <span className="text-gray-900">Oui</span>
                    </div>
                  )}
                  {profile.physical.piercings && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Piercings</span>
                      <span className="text-gray-900">Oui</span>
                    </div>
                  )}
                  {profile.physical.smoker !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fumeur</span>
                      <span className="text-gray-900">{profile.physical.smoker ? 'Oui' : 'Non'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Méthodes de paiement */}
              {profile.options.paymentMethods.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Méthodes de paiement</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.options.paymentMethods.map((method, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Devises acceptées */}
              {profile.options.acceptedCurrencies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Devises acceptées</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.options.acceptedCurrencies.map((currency, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {currency}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Équipements du lieu */}
              {profile.options.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Lieu & Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.options.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                      >
                        {amenity.replace(/^(opt:|srv:)/, '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions de contact */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 mt-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>Favoris</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}