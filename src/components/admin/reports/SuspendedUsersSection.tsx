'use client'

import { useState, useEffect } from 'react'
import { UserX, CheckCircle, Clock } from 'lucide-react'

interface SuspendedUser {
  id: string
  email: string
  name: string | null
  suspendedUntil: string | null
  suspensionReason: string | null
  bannedAt: string | null
  bannedReason: string | null
}

export default function SuspendedUsersSection() {
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unsuspending, setUnsuspending] = useState<string | null>(null)

  useEffect(() => {
    fetchSuspendedUsers()
  }, [])

  async function fetchSuspendedUsers() {
    try {
      const res = await fetch('/api/admin/users/suspended')
      const data = await res.json()
      if (data.success) {
        setSuspendedUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching suspended users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnsuspend(userId: string) {
    if (!confirm('Êtes-vous sûr de vouloir lever la suspension de cet utilisateur ?')) {
      return
    }

    setUnsuspending(userId)
    try {
      const res = await fetch('/api/admin/users/unsuspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await res.json()
      if (data.success) {
        alert('Suspension levée avec succès')
        fetchSuspendedUsers() // Rafraîchir la liste
      } else {
        alert(data.error || 'Erreur lors de la levée de suspension')
      }
    } catch (error) {
      console.error('Error unsuspending user:', error)
      alert('Erreur de connexion')
    } finally {
      setUnsuspending(null)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getTimeLeft(dateString: string) {
    const now = new Date()
    const suspendedUntil = new Date(dateString)
    const timeLeft = suspendedUntil.getTime() - now.getTime()

    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
    const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60))

    if (daysLeft > 1) {
      return `${daysLeft} jours restants`
    } else if (hoursLeft > 1) {
      return `${hoursLeft} heures restantes`
    } else {
      return 'Expire bientôt'
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (suspendedUsers.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8">
        <div className="text-center text-gray-400">
          <CheckCircle className="mx-auto mb-4" size={48} />
          <p>Aucun utilisateur suspendu ou banni actuellement</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <UserX className="text-orange-400" size={24} />
          <div>
            <h3 className="text-xl font-bold text-white">Utilisateurs Suspendus</h3>
            <p className="text-sm text-gray-400 mt-1">
              {suspendedUsers.length} utilisateur{suspendedUsers.length > 1 ? 's' : ''} suspendu{suspendedUsers.length > 1 ? 's' : ''} ou banni{suspendedUsers.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <div className="divide-y divide-white/5">
          {suspendedUsers.map((user) => {
            const isBanned = !!user.bannedAt
            const isSuspended = !!user.suspendedUntil

            return (
              <div key={user.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">
                        {user.name || user.email}
                      </h4>
                      {isBanned ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                          BANNI
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                          SUSPENDU
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-400 mb-3">{user.email}</p>

                    {isBanned ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-red-400 mb-2">
                          <UserX size={16} />
                          <span>Banni depuis: {formatDate(user.bannedAt!)}</span>
                        </div>
                        <div className="text-sm text-gray-300">
                          <span className="text-gray-500">Raison:</span> {user.bannedReason || 'Non spécifiée'}
                        </div>
                      </>
                    ) : isSuspended ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-orange-400 mb-2">
                          <Clock size={16} />
                          <span>Jusqu'au: {formatDate(user.suspendedUntil!)}</span>
                          <span className="text-gray-500">({getTimeLeft(user.suspendedUntil!)})</span>
                        </div>
                        <div className="text-sm text-gray-300">
                          <span className="text-gray-500">Raison:</span> {user.suspensionReason || 'Non spécifiée'}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <button
                    onClick={() => handleUnsuspend(user.id)}
                    disabled={unsuspending === user.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {unsuspending === user.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Lever la suspension
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
