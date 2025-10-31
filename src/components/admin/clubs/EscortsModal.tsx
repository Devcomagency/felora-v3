'use client'

import { useEffect, useState } from 'react'
import { X, Users, Eye, Star, Trash2, ExternalLink } from 'lucide-react'

interface EscortData {
  id: string
  stageName: string
  profilePhoto: string | null
  city: string | null
  category: string
  isVerifiedBadge: boolean
  views: number
  rating: number
  joinedAt: string
}

interface EscortsModalProps {
  clubId: string
  clubName: string
  onClose: () => void
}

export default function EscortsModal({ clubId, clubName, onClose }: EscortsModalProps) {
  const [escorts, setEscorts] = useState<EscortData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEscorts()
  }, [clubId])

  const fetchEscorts = async () => {
    try {
      const response = await fetch(`/api/admin/clubs/${clubId}/escorts`)
      if (!response.ok) throw new Error('Failed to fetch escorts')
      const data = await response.json()
      setEscorts(data.escorts)
    } catch (error) {
      console.error('Error fetching escorts:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeEscort = async (escortId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette escort du club ?')) return

    try {
      const response = await fetch(`/api/admin/clubs/${clubId}/escorts/${escortId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove escort')
      fetchEscorts()
    } catch (error) {
      console.error('Error removing escort:', error)
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Users className="text-pink-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Escorts Affiliées</h2>
              <p className="text-sm text-gray-400">{clubName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Chargement...</div>
          ) : escorts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Aucune escort affiliée à ce club
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escorts.map((escort) => (
                <div
                  key={escort.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                      {escort.profilePhoto ? (
                        <img
                          src={escort.profilePhoto}
                          alt={escort.stageName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                          <Users className="text-pink-400" size={24} />
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        {escort.stageName}
                        {escort.isVerifiedBadge && (
                          <Star className="text-blue-400" size={14} fill="currentColor" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {escort.city && `${escort.city} • `}
                        {escort.category}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Eye size={12} />
                          <span>{escort.views.toLocaleString()}</span>
                        </div>
                        {escort.rating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star size={12} fill="currentColor" />
                            <span>{escort.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`/profile/${escort.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs transition-colors flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          Voir
                        </a>
                        <button
                          onClick={() => removeEscort(escort.id)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{escorts.length} escort{escorts.length > 1 ? 's' : ''} affiliée{escorts.length > 1 ? 's' : ''}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
