'use client'

import { useUnifiedProfile, useDashboardProfile, usePublicProfile } from '@/hooks/useUnifiedProfile'
import { useState } from 'react'

/**
 * PAGE DE TEST pour l'API unifiée
 * À supprimer une fois la migration terminée
 */

export default function TestUnifiedApiPage() {
  const [testProfileId, setTestProfileId] = useState('')

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
                <p>Nom: {dashboardProfile.stageName}</p>
                <p>Âge: {dashboardProfile.age || 'N/A'}</p>
                <p>Ville: {dashboardProfile.city}</p>
                <p>Adresse: {dashboardProfile.address || 'N/A'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Services</h3>
                <p>Langues: {dashboardProfile.languages.join(', ') || 'Aucune'}</p>
                <p>Services: {dashboardProfile.services.length} service(s)</p>
                <p>Pratiques: {dashboardProfile.practices.length} pratique(s)</p>
                <p>Outcall: {dashboardProfile.availability.outcall ? '✅' : '❌'}</p>
                <p>Incall: {dashboardProfile.availability.incall ? '✅' : '❌'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Physique</h3>
                <p>Taille: {dashboardProfile.physical.height || 'N/A'} cm</p>
                <p>Silhouette: {dashboardProfile.physical.bodyType || 'N/A'}</p>
                <p>Cheveux: {dashboardProfile.physical.hairColor || 'N/A'}</p>
                <p>Yeux: {dashboardProfile.physical.eyeColor || 'N/A'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Clientèle & Options</h3>
                <p>Couples: {dashboardProfile.clientele.acceptsCouples ? '✅' : '❌'}</p>
                <p>Femmes: {dashboardProfile.clientele.acceptsWomen ? '✅' : '❌'}</p>
                <p>Paiements: {dashboardProfile.options.paymentMethods.join(', ') || 'Aucun'}</p>
                <p>Devises: {dashboardProfile.options.acceptedCurrencies.join(', ') || 'Aucune'}</p>
                <p>Lieu: {dashboardProfile.options.venueOptions.join(', ') || 'Aucune'}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-purple-300 mb-2">Identité Publique</h3>
                    <p>Nom: {publicProfile.stageName}</p>
                    <p>Âge: {publicProfile.age || 'N/A'}</p>
                    <p>Ville: {publicProfile.city}</p>
                    <p>Description: {publicProfile.description.substring(0, 100)}...</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-purple-300 mb-2">Services Publics</h3>
                    <p>Langues: {publicProfile.languages.join(', ') || 'Aucune'}</p>
                    <p>Services: {publicProfile.services.length} service(s)</p>
                    <p>Tarif 1H: {publicProfile.rates.oneHour || 'N/A'} {publicProfile.rates.currency}</p>
                    <p>Disponible: {publicProfile.availability.availableNow ? '🟢 Oui' : '🔴 Non'}</p>
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
    </div>
  )
}