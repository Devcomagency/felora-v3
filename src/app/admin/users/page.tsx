'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Eye, Ban, CheckCircle, Trash2, Send, Shield, Calendar, TrendingUp, Lock, Edit, History } from 'lucide-react'

// Import des modals
import NotificationModal from '@/components/admin/users/modals/NotificationModal'
import BulkNotificationModal from '@/components/admin/users/modals/BulkNotificationModal'
import EditUserModal from '@/components/admin/users/modals/EditUserModal'
import DeleteUserModal from '@/components/admin/users/modals/DeleteUserModal'
import KYCHistoryModal from '@/components/admin/users/modals/KYCHistoryModal'

// Import des composants stats/filtres/pagination
import UserStats from '@/components/admin/users/UserStats'
import UserFilters from '@/components/admin/users/UserFilters'
import Pagination from '@/components/admin/users/Pagination'
import BulkActions, { exportToCSV } from '@/components/admin/users/BulkActions'

// Import des constantes de catégories
import { ESCORT_ROLE_LABEL, getCategoryLabelWithIcon, getCategoryLabel } from '@/lib/constants/escort-categories'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  bannedAt: string | null
  bannedReason: string | null
  escortProfile: {
    id: string
    displayName: string
    isVerifiedBadge: boolean
    viewsCount: number
    subscriptionType: string | null
    subscriptionRenewalCount: number
    subscriptionExpiresAt: string | null
    category: string
    _count: { media: number }
  } | null
  escortProfileV2: {
    id: string
    handle: string
  } | null
  clubProfile: {
    id: string
    handle?: string
    displayName: string
    isVerifiedBadge: boolean
    viewsCount: number
    subscriptionType: string | null
    subscriptionRenewalCount: number
    subscriptionExpiresAt: string | null
    _count: { media: number }
  } | null
  kycSubmissions: Array<{
    id: string
    status: string
    createdAt: string
  }>
  _count: {
    sentMessages: number
    receivedMessages: number
    notifications: number
  }
}

interface Statistics {
  totalUsers: number
  totalEscorts: number
  totalClubs: number
  totalClients: number
  totalBanned: number
  newThisWeek: number
  activeUsers: number
  verifiedProfiles: number
  activeSubscriptions: number
  expiredSubscriptions: number
  escortsByCategory?: Record<string, number>
}

interface FilterState {
  searchQuery: string
  role: string
  status: string
  subscription: string
  dateFrom: string
  dateTo: string
  lastLoginFrom: string
  lastLoginTo: string
  city: string
  canton: string
  category: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  // Filtres (state unifié)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    role: 'ALL',
    status: 'ALL',
    subscription: 'ALL',
    dateFrom: '',
    dateTo: '',
    lastLoginFrom: '',
    lastLoginTo: '',
    city: '',
    canton: '',
    category: 'ALL'
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Sélection multiple
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Vue & Tri
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastLoginAt' | 'email'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // États pour les modals
  const [notificationModal, setNotificationModal] = useState<{ isOpen: boolean, user: UserData | null }>({ isOpen: false, user: null })
  const [bulkNotificationModal, setBulkNotificationModal] = useState(false)
  const [editModal, setEditModal] = useState<{ isOpen: boolean, user: UserData | null }>({ isOpen: false, user: null })
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, user: UserData | null }>({ isOpen: false, user: null })
  const [kycHistoryModal, setKycHistoryModal] = useState<{ isOpen: boolean, user: UserData | null }>({ isOpen: false, user: null })

  // Filtres sauvegardés
  const [savedFilters, setSavedFilters] = useState<{ name: string, filters: FilterState }[]>([])

  useEffect(() => {
    // Vérifier si déjà authentifié (même système que /admin/kyc)
    const auth = localStorage.getItem('felora-admin-auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchUsers()
      loadSavedFilters()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    // Authentification admin (mêmes credentials que /admin/kyc)
    const adminCredentials = {
      email: 'info@devcom.ch',
      password: 'Devcom20!'
    }

    if (email === adminCredentials.email && password === adminCredentials.password) {
      setIsAuthenticated(true)
      localStorage.setItem('felora-admin-auth', 'true')
      fetchUsers()
      loadSavedFilters()
    } else {
      setAuthError('Email ou mot de passe incorrect')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('felora-admin-auth')
  }

  const loadSavedFilters = () => {
    const saved = localStorage.getItem('admin-saved-filters')
    if (saved) {
      setSavedFilters(JSON.parse(saved))
    }
  }

  const handleSaveFilters = (name: string, filtersToSave: FilterState) => {
    const newSaved = [...savedFilters, { name, filters: filtersToSave }]
    setSavedFilters(newSaved)
    localStorage.setItem('admin-saved-filters', JSON.stringify(newSaved))
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      const data = await res.json()

      if (data.success) {
        setUsers(data.users)
        setStatistics(data.statistics)
      } else {
        console.error('Erreur:', data.error)
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handlers pour les modals
  const handleSendNotification = async (title: string, message: string, type: string) => {
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: notificationModal.user?.id,
          title,
          message,
          type
        })
      })

      const data = await res.json()
      if (data.success) {
        alert('✅ Notification envoyée avec succès!')
        fetchUsers()
      } else {
        alert('❌ Erreur: ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'envoi')
    }
  }

  const handleBulkNotification = async (title: string, message: string, type: string, link?: string) => {
    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_NOTIFICATION',
          userIds: selectedUsers,
          data: { title, message, type, link }
        })
      })

      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.count} notification(s) envoyée(s)!`)
        setSelectedUsers([])
        fetchUsers()
      } else {
        alert('❌ Erreur: ' + data.error)
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'envoi en masse')
    }
  }

  const handleEditUser = async (userId: string, data: { email: string; name: string; role: string }) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()
      if (result.success) {
        alert('✅ Utilisateur modifié avec succès!')
        fetchUsers()
      } else {
        alert('❌ Erreur: ' + result.error)
      }
    } catch (error) {
      alert('❌ Erreur lors de la modification')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const result = await res.json()
      if (result.success) {
        alert('✅ Utilisateur supprimé avec succès!')
        fetchUsers()
      } else {
        alert('❌ Erreur: ' + result.error)
      }
    } catch (error) {
      alert('❌ Erreur lors de la suppression')
    }
  }

  const handleBulkBan = async () => {
    const reason = prompt('Raison du bannissement:')
    if (!reason) return

    const confirmed = confirm(`Bannir ${selectedUsers.length} utilisateur(s)?`)
    if (!confirmed) return

    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BAN',
          userIds: selectedUsers,
          data: { reason }
        })
      })

      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.count} utilisateur(s) banni(s)!`)
        setSelectedUsers([])
        fetchUsers()
      }
    } catch (error) {
      alert('❌ Erreur')
    }
  }

  const handleBulkUnban = async () => {
    const confirmed = confirm(`Débannir ${selectedUsers.length} utilisateur(s)?`)
    if (!confirmed) return

    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UNBAN',
          userIds: selectedUsers
        })
      })

      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.count} utilisateur(s) débanni(s)!`)
        setSelectedUsers([])
        fetchUsers()
      }
    } catch (error) {
      alert('❌ Erreur')
    }
  }

  const handleBulkDelete = async () => {
    const confirmed = confirm(`⚠️ ATTENTION: Supprimer définitivement ${selectedUsers.length} utilisateur(s)?\n\nCette action est IRRÉVERSIBLE!`)
    if (!confirmed) return

    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          userIds: selectedUsers
        })
      })

      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.count} utilisateur(s) supprimé(s)!`)
        setSelectedUsers([])
        fetchUsers()
      }
    } catch (error) {
      alert('❌ Erreur')
    }
  }

  const handleBulkEmail = async () => {
    alert('📧 Fonctionnalité d\'envoi d\'emails en masse à venir!')
    // TODO: Implémenter l'envoi d'emails via Resend
  }

  const handleExportCSV = () => {
    const selectedUsersData = users.filter(u => selectedUsers.includes(u.id))
    const csvData = selectedUsersData.map(u => ({
      Email: u.email,
      Nom: u.name || '',
      Role: u.role,
      DateCreation: new Date(u.createdAt).toLocaleDateString('fr-FR'),
      DerniereConnexion: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais',
      Statut: u.bannedAt ? 'Banni' : 'Actif',
      Messages: u._count.sentMessages + u._count.receivedMessages,
      Notifications: u._count.notifications
    }))
    exportToCSV(csvData, `felora-users-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleViewProfile = (user: UserData) => {
    if (user.role === 'ESCORT' && user.escortProfile) {
      router.push(`/profile/${user.escortProfile.id}`)
    } else if (user.role === 'CLUB' && user.clubProfile) {
      const identifier = user.clubProfile.handle || user.clubProfile.id
      router.push(`/profile-test/club/${identifier}`)
    } else {
      alert('Aucun profil disponible pour cet utilisateur')
    }
  }

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    // Recherche
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesSearch =
        user.email.toLowerCase().includes(query) ||
        (user.name && user.name.toLowerCase().includes(query)) ||
        user.id.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Rôle
    if (filters.role !== 'ALL' && user.role !== filters.role) return false

    // Statut
    if (filters.status === 'BANNED' && !user.bannedAt) return false
    if (filters.status === 'ACTIVE' && user.bannedAt) return false
    if (filters.status === 'VERIFIED') {
      const isVerified = user.escortProfile?.isVerifiedBadge || user.clubProfile?.isVerifiedBadge
      if (!isVerified) return false
    }
    if (filters.status === 'UNVERIFIED') {
      // Afficher uniquement les profils qui ont un escortProfile OU clubProfile mais qui ne sont PAS vérifiés
      const hasProfile = user.escortProfile || user.clubProfile
      const isVerified = user.escortProfile?.isVerifiedBadge || user.clubProfile?.isVerifiedBadge
      if (!hasProfile || isVerified) return false
    }

    // Date d'inscription
    if (filters.dateFrom) {
      if (new Date(user.createdAt) < new Date(filters.dateFrom)) return false
    }
    if (filters.dateTo) {
      if (new Date(user.createdAt) > new Date(filters.dateTo)) return false
    }

    // Dernière connexion
    if (filters.lastLoginFrom && user.lastLoginAt) {
      if (new Date(user.lastLoginAt) < new Date(filters.lastLoginFrom)) return false
    }
    if (filters.lastLoginTo && user.lastLoginAt) {
      if (new Date(user.lastLoginAt) > new Date(filters.lastLoginTo)) return false
    }

    // Catégorie (pour les escortes uniquement)
    if (filters.category !== 'ALL' && user.role === 'ESCORT' && user.escortProfile) {
      if (user.escortProfile.category !== filters.category) return false
    }

    return true
  })

  // Tri
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compareValue = 0

    if (sortBy === 'email') {
      compareValue = a.email.localeCompare(b.email)
    } else if (sortBy === 'createdAt') {
      compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortBy === 'lastLoginAt') {
      const aDate = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0
      const bDate = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0
      compareValue = aDate - bDate
    }

    return sortOrder === 'asc' ? compareValue : -compareValue
  })

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex)

  // Sélection multiple
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleAllSelection = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id))
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Admin - Gestion Utilisateurs</h1>
            <p className="text-white/60">Authentification requise</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestion des Utilisateurs</h1>
            <p className="text-white/60">Administrez tous les comptes de la plateforme</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            <Lock size={16} className="inline mr-2" />
            Déconnexion
          </button>
        </div>

        {/* Statistics */}
        {statistics && (
          <UserStats statistics={statistics} />
        )}

        {/* Filters */}
        <UserFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSaveFilters={handleSaveFilters}
          savedFilters={savedFilters}
        />

        {/* Results header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <span className="font-semibold">{sortedUsers.length}</span> utilisateur(s) trouvé(s)
              {selectedUsers.length > 0 && (
                <span className="ml-4 text-purple-400">
                  ({selectedUsers.length} sélectionné(s))
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              >
                <option value="createdAt">Date création</option>
                <option value="lastLoginAt">Dernière connexion</option>
                <option value="email">Email</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Users list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white/60">Chargement des utilisateurs...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
            <p className="text-white/60 text-lg">Aucun utilisateur trouvé</p>
            <p className="text-white/40 text-sm mt-2">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sélection totale */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                onChange={toggleAllSelection}
                className="w-5 h-5 rounded bg-white/10 border-white/20"
              />
              <span className="text-white/80 text-sm">
                Sélectionner tous les utilisateurs de cette page
              </span>
            </div>

            {/* User cards */}
            {paginatedUsers.map(user => (
              <div
                key={user.id}
                className={`bg-white/5 backdrop-blur-xl border rounded-xl p-4 hover:border-white/20 transition-all ${
                  selectedUsers.includes(user.id) ? 'border-purple-500 bg-purple-500/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="mt-1 w-5 h-5 rounded bg-white/10 border-white/20"
                  />

                  {/* User info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold">{user.name || 'Sans nom'}</h3>
                        {/* Pour les escorts, afficher la catégorie directement avec couleur rose */}
                        {user.role === 'ESCORT' && user.escortProfile?.category ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-pink-500/20 text-pink-400">
                            {getCategoryLabel(user.escortProfile.category)}
                          </span>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'ESCORT' ? 'bg-pink-500/20 text-pink-400'
                              : user.role === 'CLUB' ? 'bg-purple-500/20 text-purple-400'
                              : user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        )}
                        {user.bannedAt && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                            BANNI
                          </span>
                        )}
                        {(user.escortProfile?.isVerifiedBadge || user.clubProfile?.isVerifiedBadge) && (
                          <CheckCircle size={16} className="text-blue-400" />
                        )}
                      </div>
                      <div className="text-xs text-white/40">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>

                    <div className="text-white/60 text-sm mb-3">
                      📧 {user.email}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <div className="text-white/40 text-xs">Inscription</div>
                        <div className="text-white/80">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Dernière connexion</div>
                        <div className="text-white/80">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">Messages</div>
                        <div className="text-white/80">
                          {user._count.sentMessages + user._count.receivedMessages}
                        </div>
                      </div>
                      <div>
                        <div className="text-white/40 text-xs">KYC</div>
                        <div className="text-white/80">
                          {user.kycSubmissions.length > 0 ? (
                            <span className={
                              user.kycSubmissions[0].status === 'APPROVED' ? 'text-green-400'
                                : user.kycSubmissions[0].status === 'REJECTED' ? 'text-red-400'
                                : 'text-yellow-400'
                            }>
                              {user.kycSubmissions[0].status}
                            </span>
                          ) : 'Aucun'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {user.role !== 'CLIENT' && (
                        <button
                          onClick={() => handleViewProfile(user)}
                          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Voir profil
                        </button>
                      )}
                      <button
                        onClick={() => setNotificationModal({ isOpen: true, user })}
                        className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                      >
                        <Send size={14} />
                        Notification
                      </button>
                      <button
                        onClick={() => setEditModal({ isOpen: true, user })}
                        className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Éditer
                      </button>
                      {user.kycSubmissions.length > 0 && (
                        <button
                          onClick={() => setKycHistoryModal({ isOpen: true, user })}
                          className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <History size={14} />
                          KYC
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, user })}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={sortedUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedUsers.length}
          onClearSelection={() => setSelectedUsers([])}
          onBanUsers={handleBulkBan}
          onUnbanUsers={handleBulkUnban}
          onSendNotification={() => setBulkNotificationModal(true)}
          onSendEmail={handleBulkEmail}
          onDeleteUsers={handleBulkDelete}
          onExportCSV={handleExportCSV}
        />

        {/* Modals */}
        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={() => setNotificationModal({ isOpen: false, user: null })}
          userId={notificationModal.user?.id || ''}
          userEmail={notificationModal.user?.email || ''}
          onSend={handleSendNotification}
        />

        <BulkNotificationModal
          isOpen={bulkNotificationModal}
          onClose={() => setBulkNotificationModal(false)}
          userCount={selectedUsers.length}
          userEmails={users.filter(u => selectedUsers.includes(u.id)).map(u => u.email)}
          onSend={handleBulkNotification}
        />

        <EditUserModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, user: null })}
          user={editModal.user || { id: '', email: '', name: '', role: '' }}
          onSave={handleEditUser}
        />

        <DeleteUserModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, user: null })}
          user={deleteModal.user || { id: '', email: '', name: '', role: '' }}
          onDelete={handleDeleteUser}
        />

        <KYCHistoryModal
          isOpen={kycHistoryModal.isOpen}
          onClose={() => setKycHistoryModal({ isOpen: false, user: null })}
          userId={kycHistoryModal.user?.id || ''}
          userEmail={kycHistoryModal.user?.email || ''}
        />
      </div>
    </div>
  )
}
