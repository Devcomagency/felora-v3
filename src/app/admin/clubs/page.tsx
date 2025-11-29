'use client'

import { useEffect, useState } from 'react'
import { Building2, MapPin, Users, Eye, CheckCircle, XCircle, Edit, Trash2, Phone, Mail, Globe, Calendar, Clock } from 'lucide-react'
import EscortsModal from '@/components/admin/clubs/EscortsModal'
import EditClubModal from '@/components/admin/clubs/EditClubModal'
import ScheduleModal from '@/components/admin/clubs/ScheduleModal'
import ClubStats from '@/components/admin/clubs/ClubStats'

interface ClubData {
  id: string
  userId: string
  handle: string
  companyName: string | null
  ideNumber: string | null
  managerName: string | null
  verified: boolean
  kycStatus: string
  createdAt: string
  details: {
    name: string | null
    description: string | null
    address: string | null
    city: string | null
    postalCode: string | null
    phone: string | null
    email: string | null
    websiteUrl: string | null
    avatarUrl: string | null
    coverUrl: string | null
    isActive: boolean
    capacity: number | null
    establishmentType: string | null
    views: number
  } | null
  services: {
    languages: string[]
    paymentMethods: string[]
    services: string[]
    equipments: string[]
    isOpen24_7: boolean
  } | null
  escortCount: number
  user: {
    email: string
    lastLoginAt: string | null
    bannedAt: string | null
  }
}

interface Stats {
  totalClubs: number
  activeClubs: number
  verifiedClubs: number
  totalEscorts: number
  totalViews: number
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubData[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'verified'>('all')

  // Modals state
  const [escortsModal, setEscortsModal] = useState<{ clubId: string; clubName: string } | null>(null)
  const [editModal, setEditModal] = useState<{ clubId: string; clubName: string; details: any } | null>(null)
  const [scheduleModal, setScheduleModal] = useState<{ clubId: string; clubName: string; schedule: string | null; isOpen24_7: boolean } | null>(null)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/clubs')
      if (!response.ok) throw new Error('Failed to fetch clubs')
      const data = await response.json()
      setClubs(data.clubs)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleClubStatus = async (clubId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/clubs/${clubId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      if (!response.ok) throw new Error('Failed to update club')
      fetchClubs()
    } catch (error) {
      console.error('Error toggling club status:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const filteredClubs = clubs.filter(club => {
    if (filter === 'active') return club.details?.isActive === true
    if (filter === 'inactive') return club.details?.isActive === false
    if (filter === 'verified') return club.verified === true
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="text-purple-400" size={32} />
            Gestion des Clubs
          </h1>
          <p className="text-gray-400 mt-1">Gérez les établissements et leurs escorts</p>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Building2 className="text-purple-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalClubs}</div>
                <div className="text-sm text-gray-400">Total Clubs</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{stats.activeClubs}</div>
                <div className="text-sm text-gray-400">Actifs</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-blue-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{stats.verifiedClubs}</div>
                <div className="text-sm text-gray-400">Vérifiés</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Users className="text-pink-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalEscorts}</div>
                <div className="text-sm text-gray-400">Escorts Affiliées</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Eye className="text-cyan-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Vues Totales</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'all'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Tous ({clubs.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'active'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Actifs ({clubs.filter(c => c.details?.isActive).length})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'inactive'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Inactifs ({clubs.filter(c => !c.details?.isActive).length})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            filter === 'verified'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Vérifiés ({clubs.filter(c => c.verified).length})
        </button>
      </div>

      {/* Liste des clubs */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClubs.map((club) => (
          <div
            key={club.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {club.details?.avatarUrl ? (
                  <img
                    src={club.details.avatarUrl}
                    alt={club.details.name || club.handle}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Building2 className="text-purple-400" size={32} />
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {club.details?.name || club.companyName || club.handle}
                      {club.verified && (
                        <CheckCircle className="text-blue-400" size={20} title="Vérifié" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">@{club.handle}</p>
                  </div>

                  {/* Badges de statut */}
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        club.details?.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {club.details?.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      {club.escortCount} escort{club.escortCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {club.details?.description && (
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {club.details.description}
                  </p>
                )}

                {/* Statistiques */}
                <ClubStats
                  views={club.details?.views || 0}
                  escortCount={club.escortCount}
                />

                {/* Informations détaillées */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {club.details?.city && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={16} className="text-purple-400" />
                      <span>{club.details.city}</span>
                    </div>
                  )}
                  {club.details?.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={16} className="text-purple-400" />
                      <span>{club.details.phone}</span>
                    </div>
                  )}
                  {club.user.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={16} className="text-purple-400" />
                      <span className="truncate">{club.user.email}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setEscortsModal({ clubId: club.id, clubName: club.details?.name || club.handle })}
                    className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Users size={14} />
                    Escorts ({club.escortCount})
                  </button>

                  <button
                    onClick={() => setEditModal({
                      clubId: club.id,
                      clubName: club.details?.name || club.handle,
                      details: club.details
                    })}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Edit size={14} />
                    Modifier
                  </button>

                  <button
                    onClick={() => setScheduleModal({
                      clubId: club.id,
                      clubName: club.details?.name || club.handle,
                      schedule: club.services?.openingHours || null,
                      isOpen24_7: club.services?.isOpen24_7 || false
                    })}
                    className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Clock size={14} />
                    Horaires
                  </button>

                  <button
                    onClick={() => toggleClubStatus(club.id, club.details?.isActive || false)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      club.details?.isActive
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                    }`}
                  >
                    {club.details?.isActive ? (
                      <>
                        <XCircle size={14} />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Activer
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.open(`/profile-test/club/${club.handle}`, '_blank')}
                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    Voir
                  </button>

                  {club.details?.websiteUrl && (
                    <a
                      href={club.details.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                      <Globe size={14} />
                      Site
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredClubs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Aucun club trouvé avec ces filtres
          </div>
        )}
      </div>

      {/* Modals */}
      {escortsModal && (
        <EscortsModal
          clubId={escortsModal.clubId}
          clubName={escortsModal.clubName}
          onClose={() => setEscortsModal(null)}
        />
      )}

      {editModal && (
        <EditClubModal
          clubId={editModal.clubId}
          clubName={editModal.clubName}
          currentDetails={editModal.details}
          onClose={() => setEditModal(null)}
          onSave={() => {
            fetchClubs()
            setEditModal(null)
          }}
        />
      )}

      {scheduleModal && (
        <ScheduleModal
          clubId={scheduleModal.clubId}
          clubName={scheduleModal.clubName}
          currentSchedule={scheduleModal.schedule}
          isOpen24_7={scheduleModal.isOpen24_7}
          onClose={() => setScheduleModal(null)}
          onSave={() => {
            fetchClubs()
            setScheduleModal(null)
          }}
        />
      )}
    </div>
  )
}
