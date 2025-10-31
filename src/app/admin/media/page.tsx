'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Filter, Eye, Trash2, AlertTriangle, Image as ImageIcon, Video, Lock, DollarSign, Calendar, Download, RefreshCw, CheckSquare, Square, LogOut, ArrowUpDown, RotateCcw } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import toast, { Toaster } from 'react-hot-toast'

interface MediaItem {
  id: string
  ownerType: string
  ownerId: string
  type: string
  url: string
  thumbUrl: string | null
  description: string | null
  visibility: 'PUBLIC' | 'PREMIUM' | 'PRIVATE' | 'REQUESTABLE'
  price: number | null
  likeCount: number
  reactCount: number
  reportCount: number
  reportedAt: string | null
  createdAt: string
  owner?: {
    name: string
    stageName?: string
    slug?: string
  }
}

interface MediaStats {
  totalActive: number
  reported: number
  deletedThisWeek: number
  uploadedToday: number
  totalPremium: number
}

type SortOption = 'reportCount' | 'createdAt' | 'likeCount'

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [stats, setStats] = useState<MediaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  // Filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch] = useDebounce(searchQuery, 500) // ✅ Debounce 500ms
  const [filterOwnerType, setFilterOwnerType] = useState<string>('ALL')
  const [filterVisibility, setFilterVisibility] = useState<string>('ALL')
  const [filterReported, setFilterReported] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('reportCount') // ✅ Tri personnalisé

  // Selection multiple (bulk actions)
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set())

  // Modal de suppression
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, media: MediaItem | null }>({ isOpen: false, media: null })
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteDetails, setDeleteDetails] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Preview modal
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, media: MediaItem | null }>({ isOpen: false, media: null })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/check')
      if (response.ok) {
        setIsAuthenticated(true)
        fetchMedia()
        fetchStats()
      } else {
        setLoading(false)
      }
    } catch (e) {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        toast.success('✅ Connexion réussie')
        fetchMedia()
        fetchStats()
      } else {
        setAuthError(data.error)
        toast.error('❌ ' + data.error)
      }
    } catch (error) {
      setAuthError('Erreur de connexion')
      toast.error('❌ Erreur de connexion')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
      toast.success('✅ Déconnexion réussie')
    } catch (error) {
      toast.error('❌ Erreur de déconnexion')
    }
  }

  const fetchMedia = async (showToast = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ownerType: filterOwnerType,
        visibility: filterVisibility,
        reported: filterReported.toString(),
        search: debouncedSearch
      })

      const response = await fetch(`/api/admin/media?${params}`)
      const data = await response.json()

      if (data.success) {
        // Tri côté client
        let sorted = [...data.media]
        if (sortBy === 'reportCount') {
          sorted.sort((a, b) => b.reportCount - a.reportCount)
        } else if (sortBy === 'createdAt') {
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        } else if (sortBy === 'likeCount') {
          sorted.sort((a, b) => b.likeCount - a.likeCount)
        }
        setMedia(sorted)
        // Only show toast on manual refresh, not on every filter change
        if (showToast) {
          toast.success(`✅ ${sorted.length} médias chargés`)
        }
      }
    } catch (e) {
      console.error('Error fetching media:', e)
      toast.error('❌ Erreur de chargement des médias')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/media/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (e) {
      console.error('Error fetching stats:', e)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.media || !deleteReason) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/media/${deleteModal.media.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deleteReason,
          details: deleteDetails
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('✅ Média supprimé et utilisateur notifié')
        fetchMedia()
        fetchStats()
        setDeleteModal({ isOpen: false, media: null })
        setDeleteReason('')
        setDeleteDetails('')
      } else {
        toast.error('❌ ' + (data.error || 'Erreur lors de la suppression'))
      }
    } catch (e) {
      console.error('Error deleting media:', e)
      toast.error('❌ Erreur de connexion')
    } finally {
      setDeleting(false)
    }
  }

  // ✅ Bulk delete
  const handleBulkDelete = async () => {
    if (selectedMedia.size === 0) {
      toast.error('❌ Aucun média sélectionné')
      return
    }

    if (!confirm(`Supprimer ${selectedMedia.size} médias ?`)) return

    const reason = prompt('Raison de suppression :')
    if (!reason) return

    toast.loading(`Suppression de ${selectedMedia.size} médias...`)

    let successCount = 0
    for (const id of selectedMedia) {
      try {
        const response = await fetch(`/api/admin/media/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason, details: '' })
        })

        if (response.ok) successCount++
      } catch (e) {
        console.error(`Failed to delete ${id}:`, e)
      }
    }

    toast.dismiss()
    toast.success(`✅ ${successCount}/${selectedMedia.size} médias supprimés`)
    setSelectedMedia(new Set())
    fetchMedia()
    fetchStats()
  }

  // ✅ Export CSV
  const handleExportCSV = () => {
    const csv = [
      ['ID', 'Type', 'Propriétaire', 'Visibilité', 'Likes', 'Reports', 'Date'].join(','),
      ...media.map(m => [
        m.id,
        m.type,
        m.ownerType + ' - ' + (m.owner?.stageName || m.owner?.name || 'Unknown'),
        m.visibility,
        m.likeCount,
        m.reportCount,
        new Date(m.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `felora-media-${new Date().toISOString()}.csv`
    a.click()
    toast.success('✅ Export CSV réussi')
  }

  // Toggle selection
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedMedia)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedMedia(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedMedia.size === media.length) {
      setSelectedMedia(new Set())
    } else {
      setSelectedMedia(new Set(media.map(m => m.id)))
    }
  }

  // Generate profile URL with media parameter for fullscreen
  const getProfileUrl = (item: MediaItem): string => {
    if (item.ownerType === 'ESCORT') {
      // For escorts: /profile/{escortId}#media-{mediaId}
      return `/profile/${item.ownerId}#media-${item.id}`
    } else if (item.ownerType === 'CLUB' && item.owner?.slug) {
      // For clubs: /profile-test/club/{slug}#media-{mediaId}
      return `/profile-test/club/${item.owner.slug}#media-${item.id}`
    } else {
      // Fallback to old format if slug is missing
      return `/profile/${item.ownerId}#media-${item.id}`
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchMedia()
    }
  }, [filterOwnerType, filterVisibility, filterReported, debouncedSearch, sortBy])

  // Page de connexion
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
          <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ImageIcon size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Modération Média</h1>
              <p className="text-gray-400 text-sm">Connexion admin sécurisée</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="admin@felora.ch"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 space-y-6">
        {/* Header avec logout */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Modération Média</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Total actifs</div>
              <div className="text-2xl font-bold text-white">{stats.totalActive}</div>
            </div>
            <div className="bg-black/30 backdrop-blur-xl border border-red-500/20 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Signalés</div>
              <div className="text-2xl font-bold text-red-400">{stats.reported}</div>
            </div>
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Supprimés (7j)</div>
              <div className="text-2xl font-bold text-white">{stats.deletedThisWeek}</div>
            </div>
            <div className="bg-black/30 backdrop-blur-xl border border-green-500/20 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Aujourd'hui</div>
              <div className="text-2xl font-bold text-green-400">{stats.uploadedToday}</div>
            </div>
            <div className="bg-black/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Premium</div>
              <div className="text-2xl font-bold text-purple-400">{stats.totalPremium}</div>
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={media.length === 0}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>

          {selectedMedia.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Supprimer ({selectedMedia.size})
            </button>
          )}

          <button
            onClick={() => fetchMedia(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Recherche</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID ou description..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Propriétaire</label>
              <select
                value={filterOwnerType}
                onChange={(e) => setFilterOwnerType(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">Tous</option>
                <option value="ESCORT">Escorts</option>
                <option value="CLUB">Clubs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Visibilité</label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">Tous</option>
                <option value="PUBLIC">Public</option>
                <option value="PREMIUM">Premium</option>
                <option value="PRIVATE">Privé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="reportCount">Signalements</option>
                <option value="createdAt">Date</option>
                <option value="likeCount">Likes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Signalés</label>
              <button
                onClick={() => setFilterReported(!filterReported)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterReported
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {filterReported ? '⚠️ Uniquement signalés' : 'Tous'}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk select bar */}
        {media.length > 0 && (
          <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
            >
              {selectedMedia.size === media.length ? <CheckSquare size={20} /> : <Square size={20} />}
              <span className="text-sm">
                {selectedMedia.size === media.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </span>
            </button>
            {selectedMedia.size > 0 && (
              <span className="text-gray-400 text-sm">
                {selectedMedia.size} sélectionné{selectedMedia.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Liste des médias */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : media.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Aucun média trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className={`bg-black/30 backdrop-blur-xl border rounded-xl overflow-hidden hover:border-purple-500/50 transition-colors ${
                  item.reportCount > 0 ? 'border-red-500/50' : 'border-white/10'
                } ${selectedMedia.has(item.id) ? 'ring-2 ring-purple-500' : ''}`}
              >
                {/* Preview */}
                <div
                  className="relative aspect-square bg-gray-900 cursor-pointer group"
                  onClick={() => setPreviewModal({ isOpen: true, media: item })}
                >
                  {/* Checkbox */}
                  <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSelect(item.id)
                    }}
                  >
                    <button className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-lg flex items-center justify-center text-white transition-colors">
                      {selectedMedia.has(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </div>

                  <img
                    src={item.thumbUrl || item.url}
                    alt={item.description || 'Media'}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      // Si le thumbnail échoue, essayer l'URL originale
                      if (img.src !== item.url && item.thumbUrl) {
                        img.src = item.url
                      } else {
                        // Si l'URL originale échoue aussi, afficher le placeholder approprié
                        img.onerror = null
                        const isVideo = item.type.includes('video')
                        img.src = isVideo ? '/placeholder-video.svg' : '/placeholder-image.svg'
                      }
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <Eye size={20} className="text-white" />
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-2 right-2">
                    {item.type.includes('video') ? (
                      <div className="px-2 py-1 bg-red-500 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                        <Video size={12} /> Vidéo
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-blue-500 rounded-lg text-white text-xs font-medium flex items-center gap-1">
                        <ImageIcon size={12} /> Photo
                      </div>
                    )}
                  </div>

                  {/* Report badge */}
                  {item.reportCount > 0 && (
                    <div className="absolute top-12 right-2">
                      <div className="px-2 py-1 bg-red-500 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                        <AlertTriangle size={12} /> {item.reportCount}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {item.ownerType} · {item.owner?.stageName || item.owner?.name || 'Unknown'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                      item.visibility === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400' :
                      item.visibility === 'PRIVATE' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.visibility === 'PREMIUM' && <Lock size={10} className="inline mr-1" />}
                      {item.visibility}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-white text-sm line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>❤️ {item.likeCount}</span>
                    {item.price && <span>💎 {item.price} CHF</span>}
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {item.reportCount > 0 && (
                    <div className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {item.reportCount} signalement{item.reportCount > 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewModal({ isOpen: true, media: item })}
                        className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-colors"
                      >
                        👁️ Voir
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, media: item })}
                        className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                    {/* Link to profile with media */}
                    <a
                      href={getProfileUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 text-sm transition-colors text-center"
                    >
                      🔗 Voir sur le profil
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.isOpen && deleteModal.media && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">🗑️ Supprimer ce média</h3>

              {/* Preview */}
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={deleteModal.media.thumbUrl || deleteModal.media.url}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    // Essayer l'URL originale si thumbnail échoue
                    if (img.src !== deleteModal.media.url && deleteModal.media.thumbUrl) {
                      img.src = deleteModal.media.url
                    } else {
                      img.onerror = null
                      const isVideo = deleteModal.media.type.includes('video')
                      img.src = isVideo ? '/placeholder-video.svg' : '/placeholder-image.svg'
                    }
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Raison de suppression *</label>
                  <select
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="Contenu inapproprié">Contenu inapproprié</option>
                    <option value="Nudité non autorisée">Nudité non autorisée</option>
                    <option value="Violence / Harcèlement">Violence / Harcèlement</option>
                    <option value="Contenu illégal">Contenu illégal</option>
                    <option value="Spam / Publicité">Spam / Publicité</option>
                    <option value="Droits d'auteur">Droits d'auteur</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Détails (optionnel)</label>
                  <textarea
                    value={deleteDetails}
                    onChange={(e) => setDeleteDetails(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-xs">
                    ⚠️ L'utilisateur recevra une notification automatiquement avec la raison de suppression.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteModal({ isOpen: false, media: null })
                      setDeleteReason('')
                      setDeleteDetails('')
                    }}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!deleteReason || deleting}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Suppression...' : 'Supprimer et notifier'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewModal.isOpen && previewModal.media && (
          <div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewModal({ isOpen: false, media: null })}
          >
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                {previewModal.media.type.includes('video') ? (
                  <video
                    src={previewModal.media.url}
                    controls
                    className="w-full max-h-[80vh] rounded-xl bg-black"
                    onError={(e) => {
                      console.error('Erreur chargement vidéo:', previewModal.media.url)
                      // Replace video with placeholder on error
                      const video = e.target as HTMLVideoElement
                      const parent = video.parentElement
                      if (parent) {
                        parent.innerHTML = `<img src="/placeholder-video.svg" alt="Vidéo non disponible" class="w-full max-h-[80vh] object-contain rounded-xl" />`
                      }
                    }}
                  />
                ) : (
                  <img
                    src={previewModal.media.url}
                    alt="Preview"
                    className="w-full max-h-[80vh] object-contain rounded-xl"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.onerror = null
                      img.src = '/placeholder-image.svg'
                    }}
                  />
                )}

                <button
                  onClick={() => setPreviewModal({ isOpen: false, media: null })}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 p-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">
                    {previewModal.media.owner?.stageName || previewModal.media.owner?.name || 'Unknown'}
                  </span>
                  <span className="text-gray-400 text-sm">{previewModal.media.ownerType}</span>
                </div>
                {previewModal.media.description && (
                  <p className="text-gray-300 text-sm">{previewModal.media.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
