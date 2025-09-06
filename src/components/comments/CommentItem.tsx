'use client'

import React, { useState } from 'react'
import { Comment, CommentThread } from '@/types/comments'
import { CommentForm } from './CommentForm'

interface CommentItemProps {
  thread: CommentThread
  onVote: (commentId: string, vote: 'up' | 'down') => void
  onReport: (commentId: string, reason: string) => void
  onReply: (data: { text: string; rating?: number; parentId?: string }) => Promise<boolean>
  canDelete: (comment: Comment) => boolean
  currentUser?: {
    id: string
    name: string
    email?: string
    avatar?: string
  }
  allowRatings?: boolean
  level?: number
}

export function CommentItem({
  thread,
  onVote,
  onReport,
  onReply,
  canDelete,
  currentUser,
  allowRatings = true,
  level = 0
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const { comment } = thread
  const maxNestingLevel = 3 // Limite de niveaux de réponses

  const handleReport = () => {
    if (!reportReason.trim()) {
      alert('Veuillez entrer une raison pour le signalement')
      return
    }
    onReport(comment.id, reportReason)
    setShowReportModal(false)
    setReportReason('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className={`${level > 0 ? 'ml-8 mt-3' : ''}`}>
      {/* Commentaire principal */}
      <div 
        className={`rounded-lg border transition-all ${
          comment.pinned 
            ? 'border-yellow-500/50 bg-yellow-500/5' 
            : 'border-white/10 bg-white/5'
        } ${comment.reported ? 'border-red-500/50' : ''} backdrop-blur-sm`}
      >
        <div className="p-4">
          {/* En-tête du commentaire */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                {comment.user.avatar ? (
                  <img 
                    src={comment.user.avatar} 
                    alt={comment.user.name}
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  comment.user.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Infos utilisateur */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{comment.user.name}</span>
                  {comment.user.verified && (
                    <span className="text-green-400 text-sm" title="Utilisateur vérifié">✓</span>
                  )}
                  {comment.user.admin && (
                    <span className="text-purple-400 text-sm" title="Administrateur">👑</span>
                  )}
                  {comment.pinned && (
                    <span className="text-yellow-400 text-sm" title="Épinglé">📌</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{formatDate(comment.timestamp)}</span>
                  {comment.edit && (
                    <span title={`Modifié le ${new Date(comment.edit.timestamp).toLocaleString('fr-FR')}`}>
                      • modifié
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center gap-1">
              {comment.score !== 0 && (
                <div className={`px-2 py-1 rounded-full text-xs ${
                  comment.score > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {comment.score > 0 ? '+' : ''}{comment.score}
                </div>
              )}
              
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title={collapsed ? 'Développer' : 'Réduire'}
              >
                <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {!collapsed && (
            <>
              {/* Note (si présente) */}
              {comment.rating && allowRatings && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < comment.rating! ? 'text-yellow-400' : 'text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">({comment.rating}/5)</span>
                </div>
              )}

              {/* Contenu du commentaire */}
              <div className="text-gray-300 leading-relaxed mb-4">
                {comment.text}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Votes */}
                  {currentUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVote(comment.id, 'up')}
                        className={`p-1 rounded transition-colors ${
                          comment.userVote === 'up'
                            ? 'text-green-400'
                            : 'text-gray-400 hover:text-green-400'
                        }`}
                        title="J'aime"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      
                      <span className="text-sm text-gray-400 min-w-[20px] text-center">
                        {comment.votes.up.length - comment.votes.down.length}
                      </span>
                      
                      <button
                        onClick={() => onVote(comment.id, 'down')}
                        className={`p-1 rounded transition-colors ${
                          comment.userVote === 'down'
                            ? 'text-red-400'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                        title="Je n'aime pas"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Répondre */}
                  {currentUser && level < maxNestingLevel && (
                    <button
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      💬 Répondre
                    </button>
                  )}

                  {/* Nombre de réponses */}
                  {thread.repliesCount > 0 && (
                    <button
                      onClick={() => setShowReplies(!showReplies)}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {showReplies ? '▼' : '▶'} {thread.repliesCount} réponse{thread.repliesCount > 1 ? 's' : ''}
                    </button>
                  )}
                </div>

                {/* Menu actions */}
                <div className="flex items-center gap-2">
                  {/* Signaler */}
                  {currentUser && currentUser.id !== comment.user.id && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      title="Signaler"
                    >
                      ⚠️
                    </button>
                  )}

                  {/* Supprimer */}
                  {canDelete(comment) && (
                    <button
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
                          // TODO: Implémenter la suppression
                        }
                      }}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Formulaire de réponse */}
        {showReplyForm && !collapsed && (
          <div className="border-t border-white/10 p-4">
            <CommentForm
              onSubmit={onReply}
              onCancel={() => setShowReplyForm(false)}
              allowRating={false}
              parentId={comment.id}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>

      {/* Réponses */}
      {showReplies && !collapsed && thread.replies.length > 0 && (
        <div className="space-y-3">
          {thread.replies.map((replyThread) => (
            <CommentItem
              key={replyThread.comment.id}
              thread={replyThread}
              onVote={onVote}
              onReport={onReport}
              onReply={onReply}
              canDelete={canDelete}
              currentUser={currentUser}
              allowRatings={allowRatings}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {/* Modal de signalement */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
          <div 
            className="w-full max-w-md rounded-xl border border-white/20 shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,0.9) 100%)',
              backdropFilter: 'blur(30px)'
            }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Signaler ce commentaire</h3>
              
              <div className="space-y-3 mb-4">
                {[
                  'Contenu inapproprié',
                  'Spam ou publicité',
                  'Harcèlement',
                  'Informations fausses',
                  'Autre'
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="report-reason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="text-purple-500"
                    />
                    <span className="text-gray-300">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReportModal(false)
                    setReportReason('')
                  }}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-gray-300 border border-white/20 hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: reportReason
                      ? 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 50%, #4FD1C7 100%)'
                      : 'linear-gradient(135deg, #666 0%, #555 100%)',
                    boxShadow: reportReason
                      ? '0 4px 16px rgba(255,107,157,0.3)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  Signaler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
