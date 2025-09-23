'use client'

import { useUnifiedProfile, useDashboardProfile, usePublicProfile } from '@/hooks/useUnifiedProfile'
import { ProfileClientUnified } from '@/components/ProfileClientUnified'
import { useState } from 'react'

/**
 * PAGE DE TEST pour l'API unifiée
 * À supprimer une fois la migration terminée
 */

export default function TestUnifiedApiPage() {
  const [testProfileId, setTestProfileId] = useState('')
  const [showModal, setShowModal] = useState(false)

  // Test dashboard (profil privé)
  const { profile: dashboardProfile, loading: dashboardLoading, error: dashboardError } = useDashboardProfile()

  // Test modal public (si ID fourni)
  const { profile: publicProfile, loading: publicLoading, error: publicError } = usePublicProfile(testProfileId)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="text-center">
          <h1 className="text-3xl font-bold text-pink-400 mb-4">🧪 Test API Unifiée</h1>
          <p className="text-gray-300">Validation de l'architecture unifiée profil (sans médias)</p>
        </div>

        {/* Test Dashboard Profile */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-400 mb-4">📊 Test Dashboard Profile (Mode Privé)</h2>

          {dashboardLoading && <p className="text-yellow-400">🔄 Chargement dashboard...</p>}
          {dashboardError && <p className="text-red-400">❌ Erreur dashboard: {dashboardError}</p>}

          {dashboardProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Identité</h3>
                <p>ID: {dashboardProfile.id}</p>
                <p>Prénom: {dashboardProfile.firstName || 'N/A'}</p>
                <p>Nom scène: {dashboardProfile.stageName}</p>
                <p>Âge: {dashboardProfile.age || 'N/A'}</p>
                <p>Nationalité: {dashboardProfile.nationality || 'N/A'}</p>
                <p>Ville: {dashboardProfile.city}</p>
                <p>Adresse: {dashboardProfile.address || 'N/A'}</p>
                <p>Coordonnées: {dashboardProfile.coordinates ? `${dashboardProfile.coordinates.lat.toFixed(4)}, ${dashboardProfile.coordinates.lng.toFixed(4)}` : 'N/A'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Services</h3>
                <p>Langues: {dashboardProfile.languages.join(', ') || 'Aucune'}</p>
                <p className="mt-2"><strong>Services ({dashboardProfile.services.length}):</strong></p>
                <p className="text-xs text-gray-300 ml-2">{dashboardProfile.services.join(', ') || 'Aucun'}</p>
                <p className="mt-2"><strong>Pratiques ({dashboardProfile.practices.length}):</strong></p>
                <p className="text-xs text-gray-300 ml-2">{dashboardProfile.practices.join(', ') || 'Aucune'}</p>
                <p className="mt-2">Outcall: {dashboardProfile.availability.outcall ? '✅' : '❌'}</p>
                <p>Incall: {dashboardProfile.availability.incall ? '✅' : '❌'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Physique</h3>
                <p>Taille: {dashboardProfile.physical.height || 'N/A'} cm</p>
                <p>Silhouette: {dashboardProfile.physical.bodyType || 'N/A'}</p>
                <p>Cheveux: {dashboardProfile.physical.hairColor || 'N/A'}</p>
                <p>Yeux: {dashboardProfile.physical.eyeColor || 'N/A'}</p>
                <p>Origine: {dashboardProfile.physical.ethnicity || 'N/A'}</p>
                <p>Tour poitrine: {dashboardProfile.physical.bustSize || 'N/A'}</p>
                <p>Type poitrine: {dashboardProfile.physical.breastType || 'N/A'}</p>
                <p>Tatouages: {dashboardProfile.physical.tattoos === true ? '✅' : dashboardProfile.physical.tattoos === false ? '❌' : 'N/A'}</p>
                <p>Piercings: {dashboardProfile.physical.piercings === true ? '✅' : dashboardProfile.physical.piercings === false ? '❌' : 'N/A'}</p>
                <p>Poils pubis: {dashboardProfile.physical.pubicHair || 'N/A'}</p>
                <p>Fumeur: {dashboardProfile.physical.smoker === true ? '✅' : dashboardProfile.physical.smoker === false ? '❌' : 'N/A'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Clientèle & Options</h3>
                <p>Couples: {dashboardProfile.clientele.acceptsCouples ? '✅' : '❌'}</p>
                <p>Femmes: {dashboardProfile.clientele.acceptsWomen ? '✅' : '❌'}</p>
                <p>Handicapés: {dashboardProfile.clientele.acceptsHandicapped ? '✅' : '❌'}</p>
                <p>Seniors: {dashboardProfile.clientele.acceptsSeniors ? '✅' : '❌'}</p>
                <p>Paiements: {dashboardProfile.options.paymentMethods.join(', ') || 'Aucun'}</p>
                <p>Devises: {dashboardProfile.options.acceptedCurrencies.join(', ') || 'Aucune'}</p>
                <p>Lieu: {dashboardProfile.options.venueOptions.join(', ') || 'Aucune'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">🆕 Nouveaux Champs</h3>
                <p>Catégorie: <span className={dashboardProfile.category ? 'text-green-400' : 'text-red-400'}>{dashboardProfile.category || '❌ VIDE'}</span></p>
                <p>Âge vérifié: {dashboardProfile.ageVerified ? '✅' : '❌'}</p>
                <p>Tarif base: <span className={dashboardProfile.rates.baseRate ? 'text-green-400' : 'text-red-400'}>{dashboardProfile.rates.baseRate || '❌ VIDE'}</span> {dashboardProfile.rates.currency}</p>

                <p className="mt-2"><strong>Services Classic ({dashboardProfile.servicesDetailed?.classic?.length || 0}):</strong></p>
                <p className="text-xs text-gray-300 ml-2">{dashboardProfile.servicesDetailed?.classic?.join(', ') || '❌ VIDE - Dashboard ne sauvegarde pas encore'}</p>

                <p className="mt-2"><strong>Services BDSM ({dashboardProfile.servicesDetailed?.bdsm?.length || 0}):</strong></p>
                <p className="text-xs text-gray-300 ml-2">{dashboardProfile.servicesDetailed?.bdsm?.join(', ') || '❌ VIDE - Dashboard ne sauvegarde pas encore'}</p>

                <p className="mt-2"><strong>Services Massage ({dashboardProfile.servicesDetailed?.massage?.length || 0}):</strong></p>
                <p className="text-xs text-gray-300 ml-2">{dashboardProfile.servicesDetailed?.massage?.join(', ') || '❌ VIDE - Dashboard ne sauvegarde pas encore'}</p>

                <p className="mt-2">Contact mode: <span className={dashboardProfile.phoneDisplayType !== 'hidden' ? 'text-green-400' : 'text-red-400'}>{dashboardProfile.phoneDisplayType || '❌ VIDE'}</span></p>
                <p>Origine détails: <span className={dashboardProfile.originDetails ? 'text-green-400' : 'text-red-400'}>{dashboardProfile.originDetails || '❌ VIDE'}</span></p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Verification & Complétion</h3>
                <p>Badge vérifié: {dashboardProfile.isVerifiedBadge ? '✅' : '❌'}</p>
                <p>Profil complété: {dashboardProfile.profileCompleted ? '✅' : '❌'}</p>
                <p>Statut: {dashboardProfile.status || 'N/A'}</p>
                <p>Durée min: {dashboardProfile.minimumDuration || 'N/A'}</p>
                <p>Telegram: {dashboardProfile.telegram?.connected ? '✅ Connecté' : '❌ Non connecté'}</p>
                <p>Tél visibilité: {dashboardProfile.phoneVisibility || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Test Public Profile */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">🌍 Test Public Profile (Mode Modal)</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ID Profil Public à tester:</label>
            <input
              type="text"
              value={testProfileId}
              onChange={(e) => setTestProfileId(e.target.value)}
              placeholder="Entrez un ID de profil escort public..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              Copiez l'ID depuis le dashboard ou l'URL d'un profil public
            </p>
          </div>

          {testProfileId && (
            <>
              {publicLoading && <p className="text-yellow-400">🔄 Chargement profil public...</p>}
              {publicError && <p className="text-red-400">❌ Erreur profil public: {publicError}</p>}

              {publicProfile && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-purple-300 mb-2">Identité Publique</h3>
                      <p>Nom: {publicProfile.stageName}</p>
                      <p>Catégorie: {publicProfile.category || 'N/A'}</p>
                      <p>Âge: {publicProfile.age || 'N/A'}</p>
                      <p>Ville: {publicProfile.city}</p>
                      <p>Description: {publicProfile.description.substring(0, 100)}...</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-purple-300 mb-2">Services Publics</h3>
                      <p>Langues: {publicProfile.languages.join(', ') || 'Aucune'}</p>
                      <p className="mt-1"><strong>Services ({publicProfile.services.length}):</strong></p>
                      <p className="text-xs text-gray-300 ml-2">{publicProfile.services.join(', ') || 'Aucun'}</p>
                      <p className="mt-2">Tarif base: {publicProfile.rates.baseRate || 'N/A'} {publicProfile.rates.currency}</p>
                      <p>Tarif 1H: {publicProfile.rates.oneHour || 'N/A'} {publicProfile.rates.currency}</p>
                      <p>Disponible: {publicProfile.availability.availableNow ? '🟢 Oui' : '🔴 Non'}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-purple-300 mb-2">🆕 Services Détaillés</h3>
                      <p><strong>Classic ({publicProfile.servicesDetailed?.classic?.length || 0}):</strong></p>
                      <p className="text-xs text-gray-300 ml-2 mb-2">{publicProfile.servicesDetailed?.classic?.join(', ') || 'Aucun'}</p>
                      <p><strong>BDSM ({publicProfile.servicesDetailed?.bdsm?.length || 0}):</strong></p>
                      <p className="text-xs text-gray-300 ml-2 mb-2">{publicProfile.servicesDetailed?.bdsm?.join(', ') || 'Aucun'}</p>
                      <p><strong>Massage ({publicProfile.servicesDetailed?.massage?.length || 0}):</strong></p>
                      <p className="text-xs text-gray-300 ml-2 mb-2">{publicProfile.servicesDetailed?.massage?.join(', ') || 'Aucun'}</p>
                      <p>Physique: {publicProfile.physical.breastType || 'N/A'} / {publicProfile.physical.pubicHair || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-white font-medium"
                    >
                      🔍 Ouvrir Modal Unifié (Test)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Comparaison */}
        {dashboardProfile && publicProfile && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-400 mb-4">✅ Comparaison Dashboard vs Public</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Dashboard (privé)</h3>
                <p>Champs: {Object.keys(dashboardProfile).length}</p>
                <p>Has userId: {dashboardProfile.userId ? '✅' : '❌'}</p>
                <p>Has address: {dashboardProfile.address ? '✅' : '❌'}</p>
                <p>Has user data: {dashboardProfile.user ? '✅' : '❌'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Public (modal)</h3>
                <p>Champs: {Object.keys(publicProfile).length}</p>
                <p>Same name: {dashboardProfile.stageName === publicProfile.stageName ? '✅' : '❌'}</p>
                <p>Same age: {dashboardProfile.age === publicProfile.age ? '✅' : '❌'}</p>
                <p>Same languages: {JSON.stringify(dashboardProfile.languages) === JSON.stringify(publicProfile.languages) ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          <p>🔄 Cette page sera supprimée après migration complète</p>
        </div>

      </div>

      {/* Modal Unifié */}
      {showModal && testProfileId && (
        <ProfileClientUnified
          profileId={testProfileId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}