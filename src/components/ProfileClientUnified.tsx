'use client'

import { useState, useEffect } from 'react'
import { usePublicProfile } from '@/hooks/useUnifiedProfile'
import { ArrowLeft, MapPin, Star, Heart, MessageCircle, Crown, BadgeCheck, X, Clock, Users, Home, Car, CreditCard, Settings, Phone, Smartphone, MessageSquare, ExternalLink } from 'lucide-react'

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
        <div className="bg-gray-900 rounded-lg p-8 text-white text-center max-w-md mx-4">
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
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border border-gray-800">

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
          <div className="overflow-y-auto max-h-[calc(90vh-100px)] pb-6">
            <div className="p-6 space-y-6">

              {/* 1. Profil physique - En premier selon la demande */}
              <div className="glass-card">
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Profil physique</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {profile.physical.height && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Taille</div>
                        <div className="text-white text-sm font-medium">{profile.physical.height} cm</div>
                      </div>
                    )}
                    {profile.physical.bodyType && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Silhouette</div>
                        <div className="text-white text-sm font-medium">{profile.physical.bodyType}</div>
                      </div>
                    )}
                    {profile.physical.hairColor && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Cheveux</div>
                        <div className="text-white text-sm font-medium">{profile.physical.hairColor}</div>
                      </div>
                    )}
                    {profile.physical.eyeColor && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Yeux</div>
                        <div className="text-white text-sm font-medium">{profile.physical.eyeColor}</div>
                      </div>
                    )}
                    {profile.physical.ethnicity && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Origine</div>
                        <div className="text-white text-sm font-medium">{profile.physical.ethnicity}</div>
                      </div>
                    )}
                    {profile.physical.bustSize && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Tour poitrine</div>
                        <div className="text-white text-sm font-medium">{profile.physical.bustSize}</div>
                      </div>
                    )}
                    {profile.physical.breastType && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Type poitrine</div>
                        <div className="text-white text-sm font-medium">{profile.physical.breastType}</div>
                      </div>
                    )}
                    {profile.physical.pubicHair && (
                      <div className="p-2 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Pilosité</div>
                        <div className="text-white text-sm font-medium">{profile.physical.pubicHair}</div>
                      </div>
                    )}
                    {(profile.physical.tattoos || profile.physical.piercings || profile.physical.smoker !== undefined) && (
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="text-xs text-gray-400 mb-2">Spécificités</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.physical.tattoos && (
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
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

              {/* 2. Services - En deuxième selon la demande */}
              {profile.options.amenities.length > 0 && (
                <>
                  {profile.options.amenities.filter(amenity => {
                    const cleanAmenity = amenity.replace(/^(opt:|srv:)/, '').toLowerCase();
                    const equipmentKeywords = ['douche à deux', 'jacuzzi', 'sauna', 'climatisation', 'fumoir', 'parking', 'accès handicapé', 'ambiance musicale', 'bar', 'pole dance'];
                    const locationKeywords = ['privé', 'discret', 'luxe', 'appartement', 'studio', 'maison'];

                    // C'est un service si ce n'est ni un équipement ni un lieu
                    const isEquipment = equipmentKeywords.some(keyword => cleanAmenity.includes(keyword));
                    const isLocation = locationKeywords.some(keyword => cleanAmenity.includes(keyword));

                    return !isEquipment && !isLocation;
                  }).length > 0 && (
                    <div className="glass-card">
                      <div className="p-4">
                        <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-purple-400" />
                          Services
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {profile.options.amenities.filter(amenity => {
                            const cleanAmenity = amenity.replace(/^(opt:|srv:)/, '').toLowerCase();
                            const equipmentKeywords = ['douche à deux', 'jacuzzi', 'sauna', 'climatisation', 'fumoir', 'parking', 'accès handicapé', 'ambiance musicale', 'bar', 'pole dance'];
                            const locationKeywords = ['privé', 'discret', 'luxe', 'appartement', 'studio', 'maison'];

                            const isEquipment = equipmentKeywords.some(keyword => cleanAmenity.includes(keyword));
                            const isLocation = locationKeywords.some(keyword => cleanAmenity.includes(keyword));

                            return !isEquipment && !isLocation;
                          }).map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"
                            >
                              <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></span>
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

              {/* 3. Langues - En troisième selon la demande */}
              {profile.languages.length > 0 && (
                <div className="glass-card">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Langues parlées</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.filter((lang, index, arr) => {
                        // Filtrer les doublons 'fr' et 'français'
                        const lowerLang = lang.toLowerCase();
                        if (lowerLang === 'fr' && arr.some(l => l.toLowerCase() === 'français')) {
                          return false;
                        }
                        return true;
                      }).map((lang) => (
                        <span
                          key={lang}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30 hover:border-blue-400/50 transition-all font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Équipements - En quatrième selon la demande */}
              {profile.options.amenities.length > 0 && (
                <>
                  {profile.options.amenities.filter(amenity => {
                    const cleanAmenity = amenity.replace(/^(opt:|srv:)/, '').toLowerCase();
                    const equipmentKeywords = ['douche à deux', 'jacuzzi', 'sauna', 'climatisation', 'fumoir', 'parking', 'accès handicapé', 'ambiance musicale', 'bar', 'pole dance'];
                    return equipmentKeywords.some(keyword => cleanAmenity.includes(keyword));
                  }).length > 0 && (
                    <div className="glass-card">
                      <div className="p-4">
                        <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-orange-400" />
                          Équipements
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {profile.options.amenities.filter(amenity => {
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

              {/* 5. Tarifs - En cinquième selon la demande */}
              <div className="glass-card">
                <div className="p-4">
                  <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-pink-400" />
                    Tarifs
                  </h3>

                  {/* Tarif principal compact */}
                  {(profile.rates.baseRate || profile.rates.oneHour) && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-lg text-center border border-pink-500/30">
                      <div className="text-lg font-bold text-white">
                        {profile.rates.baseRate || profile.rates.oneHour} {profile.rates.currency}
                      </div>
                      <div className="text-xs text-white/70">À partir de</div>
                    </div>
                  )}

                  {/* Grille des tarifs - Design compact */}
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
                    {profile.rates.fifteenMin && (
                      <div className="p-2 bg-gray-800/20 border border-gray-700/20 rounded-lg text-center">
                        <div className="text-sm font-medium text-white">
                          {profile.rates.fifteenMin}
                        </div>
                        <div className="text-xs text-gray-400">15min</div>
                      </div>
                    )}
                    {profile.rates.thirtyMin && (
                      <div className="p-2 bg-gray-800/20 border border-gray-700/20 rounded-lg text-center">
                        <div className="text-sm font-medium text-white">
                          {profile.rates.thirtyMin}
                        </div>
                        <div className="text-xs text-gray-400">30min</div>
                      </div>
                    )}
                    {profile.rates.oneHour && profile.rates.baseRate && profile.rates.oneHour !== profile.rates.baseRate && (
                      <div className="p-2 bg-gray-800/20 border border-gray-700/20 rounded-lg text-center">
                        <div className="text-sm font-medium text-white">
                          {profile.rates.oneHour}
                        </div>
                        <div className="text-xs text-gray-400">1h</div>
                      </div>
                    )}
                    {profile.rates.twoHours && (
                      <div className="p-2 bg-gray-800/20 border border-gray-700/20 rounded-lg text-center">
                        <div className="text-sm font-medium text-white">
                          {profile.rates.twoHours}
                        </div>
                        <div className="text-xs text-gray-400">2h</div>
                      </div>
                    )}
                    {profile.rates.halfDay && (
                      <div className="p-2 bg-gray-800/20 border border-gray-700/20 rounded-lg text-center">
                        <div className="text-sm font-medium text-white">
                          {profile.rates.halfDay}
                        </div>
                        <div className="text-xs text-gray-400">½j</div>
                      </div>
                    )}
                    {profile.rates.fullDay && (
                      <div className="p-2 bg-gray-800/20 border border-gray-700/20 rounded-lg text-center">
                        <div className="text-sm font-medium text-white">
                          {profile.rates.fullDay}
                        </div>
                        <div className="text-xs text-gray-400">Jour</div>
                      </div>
                    )}
                    {profile.rates.overnight && (
                      <div className="p-2 bg-gray-800/20 border border-gray-700/20 rounded-lg text-center">
                        <div className="text-sm font-medium text-white">
                          {profile.rates.overnight}
                        </div>
                        <div className="text-xs text-gray-400">Nuit</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Paiements - En sixième selon la demande */}
              {profile.options.paymentMethods.length > 0 && (
                <div className="glass-card">
                  <div className="p-4">
                    <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-400" />
                      Paiements
                    </h3>
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
                </div>
              )}

              {/* 7. Devises - En septième selon la demande */}
              {profile.options.acceptedCurrencies.length > 0 && (
                <div className="glass-card">
                  <div className="p-4">
                    <h3 className="text-md font-medium text-white/90 mb-3">Devises</h3>
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
                </div>
              )}

              {/* 8. LE RESTE NE BOUGE PAS - Mode de service */}
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

              {/* Clientèle acceptée - Ne bouge pas */}
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

              {/* Lieu & Équipements séparés - Ne bouge pas */}
              {profile.options.amenities.length > 0 && (
                <>
                  {/* Lieux */}
                  {profile.options.amenities.filter(amenity => amenity.startsWith('opt:') && (amenity.includes('privé') || amenity.includes('discret') || amenity.includes('luxe') || amenity.includes('appartement') || amenity.includes('studio') || amenity.includes('maison'))).length > 0 && (
                    <div className="glass-card">
                      <div className="p-4">
                        <h3 className="text-md font-medium text-white/90 mb-3 flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-400" />
                          Lieu
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {profile.options.amenities.filter(amenity => amenity.startsWith('opt:') && (amenity.includes('privé') || amenity.includes('discret') || amenity.includes('luxe') || amenity.includes('appartement') || amenity.includes('studio') || amenity.includes('maison'))).map((amenity, index) => (
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
              <div className="glass-card border-gradient-to-r from-pink-500/30 via-purple-500/30 to-blue-500/30">
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">Contactez {profile.stageName}</h3>
                    <p className="text-gray-300 text-sm">Réservez votre moment privilégié</p>
                  </div>

                  <div className="space-y-3">
                    {/* Bouton Message Interne */}
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-300 text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>Message privé</span>
                    </button>

                    {/* Section Téléphone - Gestion des 3 cas */}
                    {profile.contact && (() => {
                      const { phoneVisibility, phone } = profile.contact;
                      const phoneNumber = phone || '';
                      const cleanPhone = phoneNumber.replace(/\D/g, ''); // Nettoyer le numéro pour les liens
                      const displayName = profile.stageName;

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
                            <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
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
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-300 hover:text-green-200 font-medium transition-all duration-300 border border-green-600/30 text-xs"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                              <a
                                href={smsUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 border border-blue-600/30 text-xs"
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>SMS</span>
                              </a>
                              <a
                                href={callUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg text-orange-300 hover:text-orange-200 font-medium transition-all duration-300 border border-orange-600/30 text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Appel</span>
                              </a>
                            </div>
                          </div>
                        );
                      } else if (phoneVisibility === 'hidden' && phoneNumber) {
                        // CAS 2: Numéro caché - Boutons uniquement (numéro masqué mais fonctionnel)
                        return (
                          <div className="space-y-2">
                            <div className="text-center p-2 bg-gray-700/20 rounded-lg border border-gray-600/20">
                              <div className="flex items-center justify-center gap-2 text-gray-400">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">Contact téléphonique disponible</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-300 hover:text-green-200 font-medium transition-all duration-300 border border-green-600/30 text-xs"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                              <a
                                href={smsUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-300 hover:text-blue-200 font-medium transition-all duration-300 border border-blue-600/30 text-xs"
                              >
                                <Smartphone className="w-3 h-3" />
                                <span>SMS</span>
                              </a>
                              <a
                                href={callUrl}
                                className="flex items-center justify-center gap-1 px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg text-orange-300 hover:text-orange-200 font-medium transition-all duration-300 border border-orange-600/30 text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Appel</span>
                              </a>
                            </div>
                          </div>
                        );
                      } else if (phoneVisibility === 'private') {
                        // CAS 3: Messagerie privée uniquement - Redirection vers messagerie interne
                        return (
                          <div className="space-y-2">
                            <div className="text-center p-2 bg-purple-700/20 rounded-lg border border-purple-600/20">
                              <div className="flex items-center justify-center gap-2 text-purple-400">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">Contact par messagerie privée uniquement</span>
                              </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-purple-300 hover:text-purple-200 font-medium transition-all duration-300 border border-purple-600/30 text-sm">
                              <MessageCircle className="w-4 h-4" />
                              <span>Ouvrir la messagerie</span>
                            </button>
                          </div>
                        );
                      }

                      return null; // Pas de contact téléphonique disponible
                    })()}

                    {/* Bouton Favoris */}
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300 border border-gray-600/30 hover:border-pink-500/50 text-sm">
                      <Heart className="w-4 h-4" />
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