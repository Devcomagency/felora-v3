"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import { Building2, Check, X, Clock, UserMinus, ExternalLink } from 'lucide-react'

type ClubPreview = {
  id: string
  linkId?: string
  name: string
  avatar?: string
  handle: string
  joinedAt?: string
}

type Invitation = {
  id: string
  clubId: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED'
  sentAt: string
  expiresAt: string
  message?: string
  club?: ClubPreview
}

type ClubLink = {
  id: string
  clubId: string
  joinedAt: string
  club?: ClubPreview
}

export default function EscortClubsPage() {
  const { data: session } = useSession()
  const [linkedClubs, setLinkedClubs] = useState<ClubPreview[]>([])
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'clubs' | 'invitations'>('invitations')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Récupérer les invitations reçues
      const invitationsRes = await fetch('/api/club-escort-invitations?type=received')
      const invitationsData = await invitationsRes.json()

      if (invitationsData.success) {
        setReceivedInvitations(invitationsData.data || [])
      }

      // Récupérer les clubs liés
      const clubsRes = await fetch('/api/escort/my-clubs')
      const clubsData = await clubsRes.json()

      if (clubsData.success) {
        setLinkedClubs(clubsData.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Accepter une invitation
  const acceptInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/club-escort-invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
      } else {
        alert(data.error || 'Erreur lors de l\'acceptation')
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      alert('Erreur lors de l\'acceptation')
    }
  }

  // Refuser une invitation
  const declineInvitation = async (invitationId: string) => {
    if (!confirm('Voulez-vous vraiment refuser cette invitation ?')) return

    try {
      const res = await fetch(`/api/club-escort-invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' })
      })

      const data = await res.json()

      if (data.success) {
        await loadData()
      } else {
        alert(data.error || 'Erreur lors du refus')
      }
    } catch (error) {
      console.error('Error declining invitation:', error)
      alert('Erreur lors du refus')
    }
  }

  // Quitter un club
  const leaveClub = async (linkId: string, clubName: string) => {
    if (!confirm(`Voulez-vous vraiment quitter ${clubName} ?`)) return

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
      console.error('Error leaving club:', error)
      alert('Erreur lors du retrait')
    }
  }

  const pendingInvitations = receivedInvitations.filter(inv => inv.status === 'PENDING')

  return (
    <DashboardLayout title="Mes Clubs" subtitle="Gestion des clubs affiliés">
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        {/* Header avec onglets */}
        <div className="flex items-center gap-4 mb-6">
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
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'clubs'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Mes clubs ({linkedClubs.length})
          </button>
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm text-center py-8">Chargement…</div>
        ) : (
          <>
            {/* Onglet Invitations */}
            {activeTab === 'invitations' && (
              <div className="space-y-3">
                {pendingInvitations.length > 0 ? (
                  pendingInvitations.map(invitation => (
                    <div
                      key={invitation.id}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                        {invitation.club?.avatar ? (
                          <img
                            src={invitation.club.avatar}
                            alt={invitation.club.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building2 size={20} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="text-white font-medium text-lg">
                          {invitation.club?.name || 'Club'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Invitation reçue le {new Date(invitation.sentAt).toLocaleDateString('fr-FR')}
                        </div>
                        {invitation.message && (
                          <div className="text-sm text-gray-300 mt-1 italic">
                            "{invitation.message}"
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Expire le {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptInvitation(invitation.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check size={18} />
                          Accepter
                        </button>
                        <button
                          onClick={() => declineInvitation(invitation.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <X size={18} />
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Aucune invitation en attente</p>
                    <p className="text-sm mt-2">
                      Les clubs peuvent vous inviter à apparaître sur leur profil
                    </p>
                  </div>
                )}

                {/* Invitations traitées */}
                {receivedInvitations.filter(inv => inv.status !== 'PENDING').length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-white font-semibold mb-3">Historique</h3>
                    <div className="space-y-2">
                      {receivedInvitations
                        .filter(inv => inv.status !== 'PENDING')
                        .map(invitation => (
                          <div
                            key={invitation.id}
                            className="flex items-center gap-4 p-3 bg-gray-800/40 rounded-lg border border-gray-700"
                          >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                              {invitation.club?.avatar ? (
                                <img
                                  src={invitation.club.avatar}
                                  alt={invitation.club.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Building2 size={16} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">
                                {invitation.club?.name || 'Club'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(invitation.sentAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>

                            <div>
                              {invitation.status === 'ACCEPTED' && (
                                <span className="text-green-400 text-sm">✓ Acceptée</span>
                              )}
                              {invitation.status === 'DECLINED' && (
                                <span className="text-red-400 text-sm">✗ Refusée</span>
                              )}
                              {invitation.status === 'EXPIRED' && (
                                <span className="text-gray-400 text-sm">⏱ Expirée</span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Mes Clubs */}
            {activeTab === 'clubs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {linkedClubs.length > 0 ? (
                  linkedClubs.map(club => (
                    <div
                      key={club.id}
                      className="rounded-xl overflow-hidden bg-gray-800/40 border border-gray-700 hover:border-purple-500/50 transition-all group"
                    >
                      {/* Header */}
                      <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative">
                        {club.avatar ? (
                          <img
                            src={club.avatar}
                            alt={club.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={48} className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-1">{club.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">@{club.handle}</p>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <a
                            href={`/profile-test/club/${club.handle}`}
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                          >
                            <ExternalLink size={14} />
                            Voir profil
                          </a>
                          <button
                            onClick={() => {
                              if (club.linkId) {
                                leaveClub(club.linkId, club.name)
                              } else {
                                alert('Impossible de quitter ce club (linkId manquant)')
                              }
                            }}
                            className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Quitter le club"
                          >
                            <UserMinus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-400 py-12">
                    <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Vous n'êtes affiliée à aucun club</p>
                    <p className="text-sm mt-2">
                      Acceptez une invitation pour apparaître sur le profil d'un club
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
