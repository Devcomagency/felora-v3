'use client'

import React, { useState, useEffect } from 'react'
import { Comment, CommentStats, AdminAction, BLOCK_DURATIONS } from '@/types/comments'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

interface AdminCommentsPageProps {}

// Old admin comments page (V3 original)
function OldAdminCommentsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Comments (Version Originale)</h1>
        <p className="text-gray-400">Cette page utilise l'ancienne interface V3</p>
      </div>
    </div>
  )
}

// New admin comments page (V2 design)
function NewAdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'reported' | 'deleted'>('pending')
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Charger les commentaires admin
  const loadAdminComments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: activeTab,
        limit: '50'
      })

      const response = await fetch(`/api/admin/comments?${params}`)
      const result = await response.json()

      if (result.success) {
        setComments(result.data.comments)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error loading admin comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminComments()
  }, [activeTab])

  // Actions d'administration
  const performAdminAction = async (
    action: string, 
    commentId?: string, 
    userId?: string, 
    options?: any
  ) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          commentId,
          userId,
          ...options
        })
      })

      if (response.ok) {
        await loadAdminComments()
        setSelectedComments(new Set())
        return true
      }
      return false
    } catch (error) {
      console.error('Error performing admin action:', error)
      return false
    } finally {
      setActionLoading(false)
    }
  }

  // Actions en lot
  const performBulkAction = async (action: string) => {
    if (selectedComments.size === 0) return

    const promises = Array.from(selectedComments).map(commentId =>
      performAdminAction(action, commentId)
    )

    await Promise.all(promises)
  }

  // Sélection des commentaires
  const toggleCommentSelection = (commentId: string) => {
    const newSelection = new Set(selectedComments)
    if (newSelection.has(commentId)) {
      newSelection.delete(commentId)
    } else {
      newSelection.add(commentId)
    }
    setSelectedComments(newSelection)
    setShowBulkActions(newSelection.size > 0)
  }

  const selectAll = () => {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedComments(new Set(comments.map(c => c.id)))
      setShowBulkActions(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header avec style V2 */}
      <div 
        className="border-b backdrop-blur-sm"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Gestion des Commentaires
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--felora-silver-70)' }}>
                Interface d'administration Felora
              </p>
            </div>
            
            {/* Stats en temps réel */}
            {stats && (
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                  <div className="text-xs text-gray-400">En attente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{stats.reported}</div>
                  <div className="text-xs text-gray-400">Signalés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                  <div className="text-xs text-gray-400">Approuvés</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex gap-4">
          {[
            { key: 'pending', label: 'En attente', count: stats?.pending },
            { key: 'reported', label: 'Signalés', count: stats?.reported },
            { key: 'approved', label: 'Approuvés', count: stats?.approved },
            { key: 'deleted', label: 'Supprimés', count: stats?.deleted }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions en lot */}
      {showBulkActions && (
        <div className="px-6 py-3 bg-purple-900/50 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">
              {selectedComments.size} commentaire(s) sélectionné(s)
            </span>
            
            <div className="flex gap-2">
              {activeTab === 'pending' && (
                <>
                  <button
                    onClick={() => performBulkAction('approve')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    disabled={actionLoading}
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => performBulkAction('reject')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    disabled={actionLoading}
                  >
                    ❌ Rejeter
                  </button>
                </>
              )}
              
              <button
                onClick={() => performBulkAction('delete')}
                className="px-3 py-1 bg-red-800 text-white rounded text-sm hover:bg-red-900"
                disabled={actionLoading}
              >
                🗑️ Supprimer
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedComments(new Set())
                setShowBulkActions(false)
              }}
              className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Contrôles */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedComments.size === comments.length && comments.length > 0}
            onChange={selectAll}
            className="rounded"
          />
          <span className="text-gray-400 text-sm">
            Sélectionner tout
          </span>
        </div>

        <button
          onClick={loadAdminComments}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '🔄 Chargement...' : '🔄 Actualiser'}
        </button>
      </div>

      {/* Liste des commentaires */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">Aucun commentaire dans cette catégorie</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <AdminCommentCard
                key={comment.id}
                comment={comment}
                selected={selectedComments.has(comment.id)}
                onSelect={toggleCommentSelection}
                onAction={performAdminAction}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour afficher chaque commentaire en mode admin
function AdminCommentCard({
  comment,
  selected,
  onSelect,
  onAction,
  actionLoading
}: {
  comment: Comment
  selected: boolean
  onSelect: (id: string) => void
  onAction: (action: string, commentId?: string, userId?: string, options?: any) => Promise<boolean>
  actionLoading: boolean
}) {
  const [showUserActions, setShowUserActions] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      selected 
        ? 'border-purple-500 bg-purple-900/20' 
        : 'border-gray-700 bg-gray-800/50'
    } ${comment.reported ? 'border-red-500' : ''} ${comment.pinned ? 'border-yellow-500' : ''}`}>
      
      {/* Header avec sélection et actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(comment.id)}
            className="rounded"
          />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{comment.user.name}</span>
                {comment.user.verified && <span className="text-green-400">✓</span>}
                {comment.user.admin && <span className="text-purple-400">👑</span>}
                {comment.user.blocked && <span className="text-red-400">🚫</span>}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(comment.timestamp).toLocaleString('fr-FR')} • 
                Profil: {comment.profileId}
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          {comment.pinned && (
            <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">📌 Épinglé</span>
          )}
          
          {comment.reported && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">⚠️ Signalé</span>
          )}
          
          {!comment.approved && (
            <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">⏳ En attente</span>
          )}
          
          {comment.deleted && (
            <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">🗑️ Supprimé</span>
          )}
        </div>
      </div>

      {/* Contenu du commentaire */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {comment.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < comment.rating! ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
              ))}
              <span className="text-sm text-gray-400 ml-1">({comment.rating}/5)</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Score: {comment.score}</span>
            {comment.reportCount > 0 && (
              <span className="text-red-400">Signalements: {comment.reportCount}</span>
            )}
          </div>
        </div>
        
        <p className="text-gray-300 leading-relaxed">{comment.text}</p>
      </div>

      {/* Actions d'administration */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
        {!comment.deleted && (
          <>
            {!comment.approved ? (
              <>
                <button
                  onClick={() => onAction('approve', comment.id)}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ Approuver
                </button>
                <button
                  onClick={() => onAction('reject', comment.id)}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  ❌ Rejeter
                </button>
              </>
            ) : (
              <button
                onClick={() => onAction(comment.pinned ? 'unpin' : 'pin', comment.id)}
                disabled={actionLoading}
                className={`px-3 py-1 rounded text-sm disabled:opacity-50 ${
                  comment.pinned 
                    ? 'bg-yellow-700 text-white hover:bg-yellow-800' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {comment.pinned ? '📌 Désépingler' : '📌 Épingler'}
              </button>
            )}
          </>
        )}

        <button
          onClick={() => onAction('delete', comment.id)}
          disabled={actionLoading}
          className="px-3 py-1 bg-red-800 text-white rounded text-sm hover:bg-red-900 disabled:opacity-50"
        >
          🗑️ Supprimer
        </button>

        <button
          onClick={() => setShowUserActions(!showUserActions)}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          👤 Utilisateur
        </button>
      </div>

      {/* Actions utilisateur expandées */}
      {showUserActions && (
        <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {!comment.user.verified && (
              <button
                onClick={() => onAction('verify_user', undefined, comment.user.id)}
                disabled={actionLoading}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                ✅ Vérifier utilisateur
              </button>
            )}
            
            {!comment.user.blocked ? (
              <button
                onClick={() => setShowBlockModal(true)}
                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              >
                🚫 Bloquer utilisateur
              </button>
            ) : (
              <button
                onClick={() => onAction('unblock_user', undefined, comment.user.id)}
                disabled={actionLoading}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
              >
                ✅ Débloquer utilisateur
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de blocage */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Bloquer l'utilisateur</h3>
            <p className="text-gray-300 mb-4">Durée du blocage :</p>
            
            <div className="space-y-2">
              {BLOCK_DURATIONS.map((duration) => (
                <button
                  key={`${duration.value}-${duration.unit}`}
                  onClick={async () => {
                    await onAction('block_user', undefined, comment.user.id, { duration })
                    setShowBlockModal(false)
                  }}
                  className="w-full p-2 text-left bg-gray-700 hover:bg-gray-600 text-white rounded"
                >
                  {duration.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCommentsPage({}: AdminCommentsPageProps) {
  const isNewAdminCommentsEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_ADMIN_COMMENTS')
  
  if (isNewAdminCommentsEnabled) {
    return <NewAdminCommentsPage />
  }
  
  return <OldAdminCommentsPage />
}