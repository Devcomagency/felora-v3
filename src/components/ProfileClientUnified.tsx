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

              {/* Description avec statut intégré */}
              {profile.description && (
                <div className="glass-card">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-3 h-3 rounded-full ${profile.availability.availableNow ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      <span className="text-sm font-medium text-white">
                        {profile.availability.availableNow ? 'Disponible maintenant' : 'Actuellement occupée'}
                      </span>
                      {profile.availability.weekendAvailable && (
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                          Week-end OK
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{profile.description}</p>
                  </div>
                </div>
              )}

              {/* Mode de service - Design moderne */}
              {(profile.availability.incall || profile.availability.outcall) && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-pink-400" />
                      Prestations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.availability.incall && (
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Home className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Je reçois</div>
                            <div className="text-xs text-green-300">Chez moi</div>
                          </div>
                        </div>
                      )}
                      {profile.availability.outcall && (
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Car className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Je me déplace</div>
                            <div className="text-xs text-blue-300">Chez vous / Hôtel</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tarifs - Design premium */}
              <div className="glass-card">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-pink-400" />
                    Tarifs
                  </h3>

                  {/* Tarif principal en vedette */}
                  {(profile.rates.baseRate || profile.rates.oneHour) && (
                    <div className="relative mb-4 p-5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl text-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 animate-pulse"></div>
                      <div className="relative">
                        <div className="text-3xl font-bold text-white mb-1">
                          {profile.rates.baseRate || profile.rates.oneHour} {profile.rates.currency}
                        </div>
                        <div className="text-sm text-white/90 font-medium">À partir de</div>
                      </div>
                    </div>
                  )}

                  {/* Grille des tarifs - Design moderne */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {profile.rates.fifteenMin && (
                      <div className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-purple-500/50 rounded-xl transition-all group">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.rates.fifteenMin} {profile.rates.currency}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">15 minutes</div>
                      </div>
                    )}
                    {profile.rates.thirtyMin && (
                      <div className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-purple-500/50 rounded-xl transition-all group">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.rates.thirtyMin} {profile.rates.currency}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">30 minutes</div>
                      </div>
                    )}
                    {profile.rates.oneHour && profile.rates.baseRate && profile.rates.oneHour !== profile.rates.baseRate && (
                      <div className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-purple-500/50 rounded-xl transition-all group">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.rates.oneHour} {profile.rates.currency}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">1 heure</div>
                      </div>
                    )}
                    {profile.rates.twoHours && (
                      <div className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-purple-500/50 rounded-xl transition-all group">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.rates.twoHours} {profile.rates.currency}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">2 heures</div>
                      </div>
                    )}
                    {profile.rates.halfDay && (
                      <div className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-purple-500/50 rounded-xl transition-all group">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.rates.halfDay} {profile.rates.currency}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Demi-journée</div>
                      </div>
                    )}
                    {profile.rates.fullDay && (
                      <div className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-purple-500/50 rounded-xl transition-all group">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.rates.fullDay} {profile.rates.currency}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Journée</div>
                      </div>
                    )}
                    {profile.rates.overnight && (
                      <div className="p-4 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-purple-500/50 rounded-xl transition-all group">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {profile.rates.overnight} {profile.rates.currency}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Nuit entière</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Langues parlées */}
              {profile.languages.length > 0 && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Langues parlées</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30 hover:border-blue-400/50 transition-all font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Clientèle acceptée */}
              <div className="glass-card">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-pink-400" />
                    Clientèle acceptée
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {profile.clientele.acceptsCouples && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">Couples</span>
                      </div>
                    )}
                    {profile.clientele.acceptsWomen && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">Femmes</span>
                      </div>
                    )}
                    {profile.clientele.acceptsHandicapped && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">Personnes handicapées</span>
                      </div>
                    )}
                    {profile.clientele.acceptsSeniors && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="text-purple-300 text-sm font-medium">Personnes âgées</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Caractéristiques physiques - Compact et moderne */}
              <div className="glass-card">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Profil physique</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.physical.height && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Taille</div>
                        <div className="text-white font-medium">{profile.physical.height} cm</div>
                      </div>
                    )}
                    {profile.physical.bodyType && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Silhouette</div>
                        <div className="text-white font-medium">{profile.physical.bodyType}</div>
                      </div>
                    )}
                    {profile.physical.hairColor && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Cheveux</div>
                        <div className="text-white font-medium">{profile.physical.hairColor}</div>
                      </div>
                    )}
                    {profile.physical.eyeColor && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Yeux</div>
                        <div className="text-white font-medium">{profile.physical.eyeColor}</div>
                      </div>
                    )}
                    {profile.physical.ethnicity && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Origine</div>
                        <div className="text-white font-medium">{profile.physical.ethnicity}</div>
                      </div>
                    )}
                    {profile.physical.bustSize && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Tour poitrine</div>
                        <div className="text-white font-medium">{profile.physical.bustSize}</div>
                      </div>
                    )}
                    {profile.physical.breastType && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Type poitrine</div>
                        <div className="text-white font-medium">{profile.physical.breastType}</div>
                      </div>
                    )}
                    {profile.physical.pubicHair && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Pilosité</div>
                        <div className="text-white font-medium">{profile.physical.pubicHair}</div>
                      </div>
                    )}
                    {(profile.physical.tattoos || profile.physical.piercings || profile.physical.smoker !== undefined) && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Autres</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.physical.tattoos && (
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                              Tatouages
                            </span>
                          )}
                          {profile.physical.piercings && (
                            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                              Piercings
                            </span>
                          )}
                          {profile.physical.smoker !== undefined && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              profile.physical.smoker ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                              {profile.physical.smoker ? 'Fumeur' : 'Non-fumeur'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options et paiements - Design groupé */}
              {(profile.options.paymentMethods.length > 0 || profile.options.acceptedCurrencies.length > 0 || profile.options.amenities.length > 0) && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-pink-400" />
                      Options & Paiements
                    </h3>

                    <div className="space-y-4">
                      {/* Méthodes de paiement */}
                      {profile.options.paymentMethods.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Paiements acceptés
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.options.paymentMethods.map((method, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg text-sm border border-green-500/30 font-medium"
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
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Devises</h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.options.acceptedCurrencies.map((currency, index) => (
                              <span
                                key={index}
                                className="px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-lg text-sm border border-yellow-500/30 font-medium"
                              >
                                {currency}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Équipements et options */}
                      {profile.options.amenities.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Lieu & Équipements</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {profile.options.amenities.map((amenity, index) => (
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
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions de contact - Premium CTA */}
              <div className="glass-card border-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Contactez {profile.stageName}</h3>
                    <p className="text-gray-300">Réservez votre moment priviligié</p>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                      <MessageCircle className="w-5 h-5" />
                      <span>Envoyer un message</span>
                    </button>
                    <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-800/30 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white font-semibold transition-all duration-300 border border-gray-600/30 hover:border-pink-500/50">
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