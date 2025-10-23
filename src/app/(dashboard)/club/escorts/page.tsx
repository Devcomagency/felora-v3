"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import { Plus, Search, X, UserPlus, UserMinus, Clock, Check, XCircle } from 'lucide-react'

type EscortCard = {
  id: string
  linkId?: string
  name: string
  city?: string
  avatar?: string
  verified?: boolean
  joinedAt?: string
}

type Invitation = {
  id: string
  escortId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED'
  sentAt: string
  message?: string
  escort?: EscortCard
}

type Link = {
  id: string
  escortId: string
  joinedAt: string
}

export default function ClubEscortsPage() {
  const { data: session } = useSession()
  const [clubId, setClubId] = useState<string>('')
  const [linkedEscorts, setLinkedEscorts] = useState<EscortCard[]>([])
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<EscortCard[]>([])
  const [searching, setSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'linked' | 'invitations'>('linked')

  // Charger les données initiales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Récupérer l'ID du club
      const meRes = await fetch('/api/clubs/profile/me')
      const meData = await meRes.json()
      const myClubId = meData?.club?.id

      if (!myClubId) {
        console.error('No club profile found')
        return
      }

      setClubId(myClubId)

      // Récupérer les escorts liées
      const escortsRes = await fetch(`/api/clubs/${myClubId}/escorts`)
      const escortsData = await escortsRes.json()

      if (escortsData.success) {
        setLinkedEscorts(escortsData.data || [])
      }

      // Récupérer les invitations envoyées
      const invitationsRes = await fetch('/api/club-escort-invitations?type=sent')
      const invitationsData = await invitationsRes.json()

      if (invitationsData.success) {
        setSentInvitations(invitationsData.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rechercher des escorts
  const searchEscorts = async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const res = await fetch(`/api/search/escorts?q=${encodeURIComponent(term)}`)
      const data = await res.json()

      if (data.success) {
        // Filtrer les escorts déjà liées ou invitées
        const linkedIds = linkedEscorts.map(e => e.id)
        const invitedIds = sentInvitations
          .filter(inv => inv.status === 'PENDING')
          .map(inv => inv.escortId)

        const filtered = (data.data || []).filter(
          (e: EscortCard) => !linkedIds.includes(e.id) && !invitedIds.includes(e.id)
        )

        setSearchResults(filtered)
      }
    } catch (error) {
      console.error('Error searching escorts:', error)
    } finally {
      setSearching(false)
    }
  }

  // Retirer une escort du club
  const removeEscort = async (linkId: string, escortName: string) => {
    if (!confirm(`Voulez-vous vraiment retirer ${escortName} du club ?`)) return

    try {
      const res = await fetch(`/api/club-escort-links/${linkId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
      } else {
        alert(data.error || 'Erreur lors du retrait')
      }
    } catch (error) {
      console.error('Error removing escort:', error)
      alert('Erreur lors du retrait')
    }
  }

  // Envoyer une invitation
  const sendInvitation = async (escortId: string) => {
    try {
      const res = await fetch('/api/club-escort-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escortId })
      })

      const data = await res.json()

      if (data.success) {
        // Rafraîchir les données
        await loadData()
        setShowInviteModal(false)
        setSearchTerm('')
        setSearchResults([])
        // Basculer vers l'onglet invitations pour voir l'invitation envoyée
        setActiveTab('invitations')
        alert('Invitation envoyée avec succès !')
      } else {
        alert(data.error || 'Erreur lors de l\'envoi de l\'invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Erreur lors de l\'envoi de l\'invitation')
    }
  }

  // Annuler une invitation
  const cancelInvitation = async (invitationId: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette invitation ?')) return

    try {
      const res = await fetch(`/api/club-escort-invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
      } else {
        alert(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error('Error canceling invitation:', error)
      alert('Erreur lors de l\'annulation')
    }
  }

  // Retirer une escort
  const removeLink = async (linkId: string) => {
    if (!confirm('Voulez-vous vraiment retirer cette escort du club ?')) return

    try {
      const res = await fetch(`/api/club-escort-links/${linkId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
      } else {
        alert(data.error || 'Erreur lors du retrait')
      }
    } catch (error) {
      console.error('Error removing link:', error)
      alert('Erreur lors du retrait')
    }
  }

  const pendingInvitations = sentInvitations.filter(inv => inv.status === 'PENDING')

  return (
    <DashboardLayout title="Mes Escorts" subtitle="Gestion des escortes liées au club">
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        {/* Header avec bouton inviter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('linked')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'linked'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Escorts liées ({linkedEscorts.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'invitations'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Invitations ({pendingInvitations.length})
            </button>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <UserPlus size={18} />
            Inviter une escort
          </button>
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm text-center py-8">Chargement…</div>
        ) : (
          <>
            {/* Onglet Escorts liées */}
            {activeTab === 'linked' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {linkedEscorts.map(escort => (
                  <div key={escort.id} className="rounded-xl overflow-hidden bg-gray-900/60 border border-gray-800 group relative">
                    <div className="aspect-square bg-black/30">
                      <img
                        src={escort.avatar || 'https://placehold.co/400x400?text=Escort'}
                        alt={escort.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-white font-medium text-sm">{escort.name}</div>
                      <div className="text-gray-400 text-xs">{escort.city || '—'}</div>
                    </div>

                    {/* Bouton retirer au survol */}
                    <button
                      onClick={() => {
                        if (escort.linkId) {
                          removeEscort(escort.linkId, escort.name)
                        } else {
                          alert('Impossible de retirer cette escort (linkId manquant)')
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retirer du club"
                    >
                      <UserMinus size={16} className="text-white" />
                    </button>
                  </div>
                ))}

                {linkedEscorts.length === 0 && (
                  <div className="col-span-full text-center text-gray-400 text-sm py-8">
                    Aucune escort liée pour le moment
                  </div>
                )}
              </div>
            )}

            {/* Onglet Invitations */}
            {activeTab === 'invitations' && (
              <div className="space-y-3">
                {sentInvitations.map(invitation => (
                  <div
                    key={invitation.id}
                    className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                      {invitation.escort?.avatar ? (
                        <img
                          src={invitation.escort.avatar}
                          alt={invitation.escort.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {invitation.escort?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="text-white font-medium">{invitation.escort?.name || 'Escort'}</div>
                      <div className="text-xs text-gray-400">
                        Envoyée le {new Date(invitation.sentAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    {/* Statut */}
                    <div>
                      {invitation.status === 'PENDING' && (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Clock size={14} />
                          En attente
                        </span>
                      )}
                      {invitation.status === 'ACCEPTED' && (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <Check size={14} />
                          Acceptée
                        </span>
                      )}
                      {invitation.status === 'DECLINED' && (
                        <span className="flex items-center gap-1 text-red-400 text-sm">
                          <XCircle size={14} />
                          Refusée
                        </span>
                      )}
                      {invitation.status === 'CANCELLED' && (
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <X size={14} />
                          Annulée
                        </span>
                      )}
                      {invitation.status === 'EXPIRED' && (
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <Clock size={14} />
                          Expirée
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {invitation.status === 'PENDING' && (
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                ))}

                {sentInvitations.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Aucune invitation envoyée
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Inviter une escort</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setSearchTerm('')
                  setSearchResults([])
                }}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Recherche */}
            <div className="p-6 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    searchEscorts(e.target.value)
                  }}
                  placeholder="Rechercher une escort par nom ou ville..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Résultats */}
            <div className="flex-1 overflow-y-auto p-6">
              {searching ? (
                <div className="text-center text-gray-400 py-8">Recherche en cours...</div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map(escort => (
                    <div
                      key={escort.id}
                      className="flex items-center gap-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                        {escort.avatar ? (
                          <img
                            src={escort.avatar}
                            alt={escort.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                            {escort.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-white font-medium">{escort.name}</div>
                        <div className="text-sm text-gray-400">{escort.city || 'Ville non spécifiée'}</div>
                      </div>

                      <button
                        onClick={() => sendInvitation(escort.id)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Inviter
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="text-center text-gray-400 py-8">
                  Aucune escort trouvée
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Tapez au moins 2 caractères pour rechercher
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
