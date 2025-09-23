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
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-2xl">

          {/* Header */}
          <div className="relative p-6 border-b border-gray-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.stageName}</h1>

              <div className="flex items-center justify-center gap-4 text-sm text-gray-300 mb-4">
                {profile.age && (
                  <span className="flex items-center gap-1">
                    <span>🎂</span> {profile.age} ans
                  </span>
                )}
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}, {profile.canton}
                  </span>
                )}
                {profile.category && (
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full">
                    {profile.category}
                  </span>
                )}
              </div>

              {profile.description && (
                <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {profile.description}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">💬</div>
                <div className="text-sm text-gray-400">Langues</div>
                <div className="text-xs text-white">{profile.languages.length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-sm text-gray-400">Services</div>
                <div className="text-xs text-white">{profile.services.length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">
                  {profile.availability.availableNow ? '🟢' : '🔴'}
                </div>
                <div className="text-sm text-gray-400">
                  {profile.availability.availableNow ? 'Disponible' : 'Occupée'}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">
                  {profile.availability.weekendAvailable ? '📅' : '🚫'}
                </div>
                <div className="text-sm text-gray-400">
                  {profile.availability.weekendAvailable ? 'Week-end OK' : 'Semaine uniquement'}
                </div>
              </div>
            </div>

            {/* Mode de service */}
            {(profile.availability.incall || profile.availability.outcall) && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📍</span> Mode de service
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.availability.incall && (
                    <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center gap-2">
                      <Home className="w-4 h-4" /> Je reçois
                    </span>
                  )}
                  {profile.availability.outcall && (
                    <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                      <Car className="w-4 h-4" /> Je me déplace
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Langues */}
            {profile.languages.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🗣️</span> Langues parlées
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {profile.services.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💋</span> Services proposés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clientèle acceptée */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> Clientèle acceptée
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.clientele.acceptsCouples && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    👫 Couples
                  </span>
                )}
                {profile.clientele.acceptsWomen && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    👩 Femmes
                  </span>
                )}
                {profile.clientele.acceptsHandicapped && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    ♿ Personnes handicapées
                  </span>
                )}
                {profile.clientele.acceptsSeniors && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    👴 Personnes âgées
                  </span>
                )}
              </div>
            </div>

            {/* Caractéristiques physiques */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>👤</span> Caractéristiques physiques
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {profile.physical.height && (
                  <div>
                    <span className="text-gray-400">Taille :</span>
                    <span className="text-white ml-2">{profile.physical.height} cm</span>
                  </div>
                )}
                {profile.physical.bodyType && (
                  <div>
                    <span className="text-gray-400">Silhouette :</span>
                    <span className="text-white ml-2">{profile.physical.bodyType}</span>
                  </div>
                )}
                {profile.physical.hairColor && (
                  <div>
                    <span className="text-gray-400">Cheveux :</span>
                    <span className="text-white ml-2">{profile.physical.hairColor}</span>
                  </div>
                )}
                {profile.physical.eyeColor && (
                  <div>
                    <span className="text-gray-400">Yeux :</span>
                    <span className="text-white ml-2">{profile.physical.eyeColor}</span>
                  </div>
                )}
                {profile.physical.ethnicity && (
                  <div>
                    <span className="text-gray-400">Origine :</span>
                    <span className="text-white ml-2">{profile.physical.ethnicity}</span>
                  </div>
                )}
                {profile.physical.bustSize && (
                  <div>
                    <span className="text-gray-400">Tour poitrine :</span>
                    <span className="text-white ml-2">{profile.physical.bustSize}</span>
                  </div>
                )}
                {profile.physical.breastType && (
                  <div>
                    <span className="text-gray-400">Type poitrine :</span>
                    <span className="text-white ml-2">{profile.physical.breastType}</span>
                  </div>
                )}
                {profile.physical.pubicHair && (
                  <div>
                    <span className="text-gray-400">Pilosité :</span>
                    <span className="text-white ml-2">{profile.physical.pubicHair}</span>
                  </div>
                )}
                {profile.physical.tattoos !== undefined && (
                  <div>
                    <span className="text-gray-400">Tatouages :</span>
                    <span className="text-white ml-2">{profile.physical.tattoos ? 'Oui' : 'Non'}</span>
                  </div>
                )}
                {profile.physical.piercings !== undefined && (
                  <div>
                    <span className="text-gray-400">Piercings :</span>
                    <span className="text-white ml-2">{profile.physical.piercings ? 'Oui' : 'Non'}</span>
                  </div>
                )}
                {profile.physical.smoker !== undefined && (
                  <div>
                    <span className="text-gray-400">Fumeur :</span>
                    <span className="text-white ml-2">{profile.physical.smoker ? 'Oui' : 'Non'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tarifs */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>💰</span> Tarifs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.rates.oneHour && (
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {profile.rates.oneHour} {profile.rates.currency}
                    </div>
                    <div className="text-sm text-gray-400">1 heure</div>
                  </div>
                )}
                {profile.rates.twoHours && (
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {profile.rates.twoHours} {profile.rates.currency}
                    </div>
                    <div className="text-sm text-gray-400">2 heures</div>
                  </div>
                )}
                {profile.rates.overnight && (
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {profile.rates.overnight} {profile.rates.currency}
                    </div>
                    <div className="text-sm text-gray-400">Nuit</div>
                  </div>
                )}
                {profile.rates.baseRate && (
                  <div className="text-center p-4 bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {profile.rates.baseRate} {profile.rates.currency}
                    </div>
                    <div className="text-sm text-gray-400">Tarif de base</div>
                  </div>
                )}
              </div>
            </div>

            {/* Méthodes de paiement */}
            {profile.options.paymentMethods.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Méthodes de paiement
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.options.paymentMethods.map((method, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Devises acceptées */}
            {profile.options.acceptedCurrencies.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💱</span> Devises acceptées
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.options.acceptedCurrencies.map((currency, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Équipements du lieu */}
            {profile.options.amenities.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Lieu & Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.options.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Actions */}
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-6 border border-pink-500/20">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Contactez {profile.stageName}</h3>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Envoyer un message
                  </button>
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Ajouter aux favoris
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