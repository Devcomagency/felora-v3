'use client'

import { useEffect, useState } from 'react'
import { Search, Trash2, Eye, Video, Image as ImageIcon, AlertTriangle, ChevronLeft, ChevronRight, Filter, ExternalLink } from 'lucide-react'

interface MediaItem {
  id: string
  type: string
  url: string
  thumbUrl: string | null
  visibility: string
  ownerType: string
  ownerId: string
  owner?: {
    name: string
    stageName?: string
    userId?: string
  }
  reportCount: number
  price: number | null
  createdAt: string
}

interface MediaStats {
  totalActive: number
  reported: number
  deletedThisWeek: number
  uploadedToday: number
  totalPremium: number
}

export default function AdminMediaClean() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // 10 médias par page avec optimisations pour Safari

  // Filtres
  const [filterOwnerType, setFilterOwnerType] = useState<string>('ALL')
  const [filterVisibility, setFilterVisibility] = useState<string>('ALL')
  const [filterReported, setFilterReported] = useState(false)

  // Modal suppression avec notification
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, media: MediaItem | null }>({ isOpen: false, media: null })
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteDetails, setDeleteDetails] = useState('')
  const [notifyOwner, setNotifyOwner] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchMedia()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchMedia()
  }, [filterOwnerType, filterVisibility, filterReported, search])

  async function fetchMedia() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ownerType: filterOwnerType,
        visibility: filterVisibility,
        reported: filterReported.toString(),
        search: search
      })
      const res = await fetch(`/api/admin/media?${params}`)
      const data = await res.json()
      if (data.success) {
        setMedia(data.media)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/media/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Pagination
  const totalPages = Math.ceil(media.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMedia = media.slice(startIndex, endIndex)

  // Reset à la page 1 si changement de filtre
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterOwnerType, filterVisibility, filterReported])

  async function handleDelete() {
    if (!deleteModal.media || !deleteReason) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/media/${deleteModal.media.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deleteReason,
          details: deleteDetails,
          notifyOwner: notifyOwner
        })
      })

      const data = await res.json()

      if (data.success) {
        fetchMedia()
        fetchStats()
        setDeleteModal({ isOpen: false, media: null })
        setDeleteReason('')
        setDeleteDetails('')
        setNotifyOwner(true)
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Erreur de connexion')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Modération Médias</h1>
        <p className="text-gray-400">
          {media.length} média(s) · Page {currentPage} / {totalPages}
        </p>
      </div>

      {/* Stats - Design frais avec gradients */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {/* Total actifs */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={16} className="text-blue-400" />
                <div className="text-blue-400 text-xs font-medium uppercase tracking-wider">Total actifs</div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalActive}</div>
            </div>
          </div>

          {/* Signalés */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-5 hover:border-red-500/40 transition-all cursor-pointer"
               onClick={() => setFilterReported(true)}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-400" />
                <div className="text-red-400 text-xs font-medium uppercase tracking-wider">Signalés</div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.reported}</div>
              <div className="text-xs text-red-400/60 mt-1">Cliquer pour filtrer</div>
            </div>
          </div>

          {/* Supprimés */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20 rounded-xl p-5 hover:border-gray-500/40 transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 size={16} className="text-gray-400" />
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">Supprimés (7j)</div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.deletedThisWeek}</div>
            </div>
          </div>

          {/* Aujourd'hui */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-5 hover:border-green-500/40 transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={16} className="text-green-400" />
                <div className="text-green-400 text-xs font-medium uppercase tracking-wider">Aujourd'hui</div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.uploadedToday}</div>
            </div>
          </div>

          {/* Premium */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/40 transition-all cursor-pointer"
               onClick={() => setFilterVisibility('PREMIUM')}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Video size={16} className="text-purple-400" />
                <div className="text-purple-400 text-xs font-medium uppercase tracking-wider">Premium</div>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalPremium}</div>
              <div className="text-xs text-purple-400/60 mt-1">Cliquer pour filtrer</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres - Design moderne avec pills */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Filtres</h2>
          {(search || filterOwnerType !== 'ALL' || filterVisibility !== 'ALL' || filterReported) && (
            <button
              onClick={() => {
                setSearch('')
                setFilterOwnerType('ALL')
                setFilterVisibility('ALL')
                setFilterReported(false)
              }}
              className="ml-auto text-xs text-gray-400 hover:text-white transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par ID, propriétaire..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-gray-800 transition-all"
            />
          </div>

          {/* Pills filters */}
          <div className="flex flex-wrap gap-3">
            {/* Type propriétaire */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterOwnerType('ALL')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterOwnerType === 'ALL'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterOwnerType('ESCORT')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterOwnerType === 'ESCORT'
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                👤 Escorts
              </button>
              <button
                onClick={() => setFilterOwnerType('CLUB')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterOwnerType === 'CLUB'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                🏢 Clubs
              </button>
            </div>

            {/* Séparateur */}
            <div className="w-px bg-gray-700"></div>

            {/* Visibilité */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterVisibility('ALL')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterVisibility === 'ALL'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilterVisibility('PUBLIC')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterVisibility === 'PUBLIC'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                🌍 Public
              </button>
              <button
                onClick={() => setFilterVisibility('PREMIUM')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterVisibility === 'PREMIUM'
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                💎 Premium
              </button>
              <button
                onClick={() => setFilterVisibility('PRIVATE')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterVisibility === 'PRIVATE'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                🔒 Privé
              </button>
            </div>

            {/* Séparateur */}
            <div className="w-px bg-gray-700"></div>

            {/* Signalés */}
            <button
              onClick={() => setFilterReported(!filterReported)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterReported
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                Signalés uniquement
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Table - Design moderne */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Propriétaire</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Visibilité</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Signalements</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {currentMedia.map((item, index) => (
              <tr key={item.id} className="group hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-pink-500/5 transition-all duration-200">
                {/* Type */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.type.includes('video') ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                      {item.type.includes('video') ? (
                        <Video size={18} className="text-red-400" />
                      ) : (
                        <ImageIcon size={18} className="text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.type.includes('video') ? 'Vidéo' : 'Image'}
                      </div>
                      <div className="text-xs text-gray-500">{item.type.split('/')[1]}</div>
                    </div>
                  </div>
                </td>

                {/* Propriétaire - Lien visible avec icône */}
                <td className="px-6 py-4">
                  <div>
                    <button
                      onClick={() => {
                        // Utiliser ownerId qui est l'ID du profil escort/club
                        const profileUrl = `/profile/${item.ownerId}`
                        console.log('[ADMIN MEDIA] Opening profile:', {
                          ownerType: item.ownerType,
                          ownerId: item.ownerId,
                          profileUrl: profileUrl,
                          owner: item.owner
                        })
                        window.open(profileUrl, '_blank')
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors group/link"
                      title="Voir le profil"
                    >
                      <span className="underline underline-offset-2 decoration-purple-400/30 group-hover/link:decoration-purple-300">
                        {item.owner?.stageName || item.owner?.name || 'Unknown'}
                      </span>
                      <ExternalLink size={14} className="opacity-60 group-hover/link:opacity-100 transition-opacity" />
                    </button>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.ownerType === 'ESCORT'
                          ? 'bg-pink-500/10 text-pink-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {item.ownerType === 'ESCORT' ? '👤 Escort' : '🏢 Club'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Visibilité */}
                <td className="px-6 py-4">
                  <span className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full
                    ${item.visibility === 'PUBLIC' ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' : ''}
                    ${item.visibility === 'PREMIUM' ? 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20' : ''}
                    ${item.visibility === 'PRIVATE' ? 'bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20' : ''}
                  `}>
                    {item.visibility === 'PUBLIC' && '🌍'}
                    {item.visibility === 'PREMIUM' && '💎'}
                    {item.visibility === 'PRIVATE' && '🔒'}
                    {item.visibility}
                  </span>
                </td>

                {/* Signalements */}
                <td className="px-6 py-4">
                  {item.reportCount > 0 ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full ring-1 ring-red-500/20">
                      <AlertTriangle size={14} />
                      <span className="text-sm font-bold">{item.reportCount}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">—</span>
                  )}
                </td>

                {/* Date */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => window.open(item.url, '_blank')}
                      className="p-2.5 hover:bg-blue-500/10 rounded-xl transition-all hover:ring-2 hover:ring-blue-500/20 group/btn"
                      title="Voir le média"
                    >
                      <Eye size={18} className="text-gray-400 group-hover/btn:text-blue-400 transition-colors" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, media: item })}
                      className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all hover:ring-2 hover:ring-red-500/20 group/btn"
                      title="Supprimer"
                    >
                      <Trash2 size={18} className="text-gray-400 group-hover/btn:text-red-400 transition-colors" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {media.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun média trouvé
          </div>
        )}
      </div>

      {/* Pagination - Design moderne */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 hover:border-purple-500/50 transition-all shadow-lg disabled:shadow-none"
          >
            <ChevronLeft size={18} />
            <span className="font-medium">Précédent</span>
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`
                  min-w-[44px] h-11 px-4 rounded-xl font-semibold transition-all shadow-lg
                  ${currentPage === page
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110 shadow-purple-500/50'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white hover:scale-105'
                  }
                `}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 hover:border-purple-500/50 transition-all shadow-lg disabled:shadow-none"
          >
            <span className="font-medium">Suivant</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal Suppression */}
      {deleteModal.isOpen && deleteModal.media && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Supprimer le média</h3>

            <div className="mb-4">
              <img
                src={deleteModal.media.type.includes('video') ? deleteModal.media.thumbUrl || '/placeholder-video.svg' : deleteModal.media.url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Raison *</label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="INAPPROPRIATE">Contenu inapproprié</option>
                  <option value="REPORTED">Signalé par les utilisateurs</option>
                  <option value="COPYRIGHT">Violation de droits d'auteur</option>
                  <option value="QUALITY">Mauvaise qualité</option>
                  <option value="OTHER">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Détails (optionnel)</label>
                <textarea
                  value={deleteDetails}
                  onChange={(e) => setDeleteDetails(e.target.value)}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOwner}
                  onChange={(e) => setNotifyOwner(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Notifier le propriétaire</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal({ isOpen: false, media: null })
                  setDeleteReason('')
                  setDeleteDetails('')
                  setNotifyOwner(true)
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={!deleteReason || deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
