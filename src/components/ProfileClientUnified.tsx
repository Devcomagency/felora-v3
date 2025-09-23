'use client'

import { useState, useEffect } from 'react'
import { usePublicProfile } from '@/hooks/useUnifiedProfile'
import { ArrowLeft, MapPin, Star, Heart, MessageCircle, Crown, BadgeCheck, X } from 'lucide-react'

/**
 * MODAL PROFIL UNIFIÉ - Version simplifiée utilisant l'API unifiée
 *
 * IMPORTANT: Cette version NE GÈRE PAS les médias qui restent sur l'ancien système
 * Elle sert de test pour valider l'architecture unifiée avant migration complète
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Profil Unifié (Test)</h1>
            <p className="text-xs text-gray-400">API unifiée - Sans médias</p>
          </div>

          <div className="w-20"></div> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Basic Info */}
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile.stageName.charAt(0).toUpperCase()}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              {profile.stageName}
              <BadgeCheck className="w-5 h-5 text-blue-400" />
            </h2>

            <div className="flex items-center justify-center gap-4 text-gray-300 mb-4">
              {profile.age && <span>{profile.age} ans</span>}
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.city}
                </span>
              )}
            </div>

            {profile.description && (
              <p className="text-gray-300 max-w-2xl mx-auto">
                {profile.description}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">🌟</div>
              <div className="text-sm text-gray-400">Vérifiée</div>
            </div>
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
          </div>

          {/* Languages */}
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

          {/* Service Mode */}
          {(profile.availability.incall || profile.availability.outcall) && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📍</span> Mode de service
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.availability.incall && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm flex items-center gap-2">
                    <span>🏠</span> Je reçois
                  </span>
                )}
                {profile.availability.outcall && (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                    <span>🚗</span> Je me déplace
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Practices */}
          {profile.practices.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🔥</span> Pratiques spécialisées
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.practices.map((practice, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Physical Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>👤</span> Caractéristiques physiques
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {profile.physical.height && (
                <div>
                  <span className="text-gray-400">Taille:</span>
                  <span className="text-white ml-2">{profile.physical.height} cm</span>
                </div>
              )}
              {profile.physical.bodyType && (
                <div>
                  <span className="text-gray-400">Silhouette:</span>
                  <span className="text-white ml-2">{profile.physical.bodyType}</span>
                </div>
              )}
              {profile.physical.hairColor && (
                <div>
                  <span className="text-gray-400">Cheveux:</span>
                  <span className="text-white ml-2">{profile.physical.hairColor}</span>
                </div>
              )}
              {profile.physical.eyeColor && (
                <div>
                  <span className="text-gray-400">Yeux:</span>
                  <span className="text-white ml-2">{profile.physical.eyeColor}</span>
                </div>
              )}
              {profile.physical.ethnicity && (
                <div>
                  <span className="text-gray-400">Origine:</span>
                  <span className="text-white ml-2">{profile.physical.ethnicity}</span>
                </div>
              )}
              {profile.physical.bustSize && (
                <div>
                  <span className="text-gray-400">Poitrine:</span>
                  <span className="text-white ml-2">{profile.physical.bustSize}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rates */}
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
                  <div className="text-sm text-gray-400">Nuit complète</div>
                </div>
              )}
            </div>
          </div>

          {/* Clientele & Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Clientele */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>👥</span> Clientèle acceptée
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Couples</span>
                  <span className={profile.clientele.acceptsCouples ? 'text-green-400' : 'text-red-400'}>
                    {profile.clientele.acceptsCouples ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Femmes</span>
                  <span className={profile.clientele.acceptsWomen ? 'text-green-400' : 'text-red-400'}>
                    {profile.clientele.acceptsWomen ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Personnes handicapées</span>
                  <span className={profile.clientele.acceptsHandicapped ? 'text-green-400' : 'text-red-400'}>
                    {profile.clientele.acceptsHandicapped ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Personnes âgées</span>
                  <span className={profile.clientele.acceptsSeniors ? 'text-green-400' : 'text-red-400'}>
                    {profile.clientele.acceptsSeniors ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Options */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>💳</span> Paiement & Options
              </h3>

              {profile.options.paymentMethods.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Paiements acceptés:</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.options.paymentMethods.map((method, index) => (
                      <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.options.acceptedCurrencies.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Devises:</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.options.acceptedCurrencies.map((currency, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {currency}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.options.venueOptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Lieu & Options:</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.options.venueOptions.map((option, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">🔧 Informations de débogage</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• API utilisée: <code>/api/profile/unified/{profileId}</code></p>
              <p>• Mode: Public (modal)</p>
              <p>• Dernière mise à jour: {new Date(profile.updatedAt).toLocaleString()}</p>
              <p>• Médias: Gérés par l'ancien système (non migrés)</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}