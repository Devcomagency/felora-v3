'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Comment, CommentThread, CommentStats } from '@/types/comments'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
// import { CommentFilters } from './CommentFilters' // Retiré

interface CommentsSectionProps {
  profileId: string
  profileType: 'escort' | 'club'
  profileOwnerId?: string
  currentUser?: {
    id: string
    name: string
    email?: string
    avatar?: string
    verified?: boolean
    admin?: boolean
  }
  allowRatings?: boolean
  moderationRequired?: boolean
  className?: string
}

export function CommentsSection({
  profileId,
  profileType,
  profileOwnerId,
  currentUser,
  allowRatings = true,
  moderationRequired = false,
  className = ''
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  // Plus de tri - ordre chronologique uniquement
  const sortBy = 'timestamp'
  const sortOrder = 'desc'
  const [showForm, setShowForm] = useState(false)

  // Charger les commentaires
  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        profileId,
        profileType,
        sortBy,
        sortOrder,
        limit: '50'
      })

      const response = await fetch(`/api/comments?${params}`)
      const result = await response.json()

      if (result.success) {
        setComments(result.data.comments)
        setStats(result.data.stats)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }, [profileId, profileType, sortBy, sortOrder])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  // Soumettre un nouveau commentaire
  const submitComment = useCallback(async (commentData: {
    text: string
    rating?: number
    parentId?: string
    anonymousName?: string
  }) => {
    // Permettre les commentaires anonymes

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          profileType,
          text: commentData.text,
          rating: commentData.rating,
          parentId: commentData.parentId,
          user: currentUser || {
            id: 'anonymous',
            name: commentData.anonymousName || 'Anonyme',
            email: '',
            avatar: '',
            verified: false
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Recharger les commentaires
        await loadComments()
        setShowForm(false)
        return true
      } else {
        alert(result.error || 'Erreur lors de la publication')
        return false
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Erreur de connexion')
      return false
    } finally {
      setSubmitting(false)
    }
  }, [profileId, profileType, loadComments])

  // Voter pour un commentaire
  const voteComment = useCallback(async (commentId: string, vote: 'up' | 'down') => {
    // Permettre les votes anonymes

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote, userId: currentUser?.id || 'anonymous' })
      })

      if (response.ok) {
        await loadComments() // Recharger pour mettre à jour les scores
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }, [loadComments])

  // Signaler un commentaire
  const reportComment = useCallback(async (commentId: string, reason: string) => {
    // Permettre les signalements anonymes

    try {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, userId: currentUser?.id || 'anonymous' })
      })

      if (response.ok) {
        alert('Commentaire signalé avec succès')
        await loadComments()
      }
    } catch (error) {
      console.error('Error reporting comment:', error)
    }
  }, [loadComments])

  // Vérifier les permissions
  const canDelete = useCallback((comment: Comment) => {
    if (!currentUser) return false
    return currentUser.admin || 
           currentUser.id === profileOwnerId || 
           currentUser.id === comment.user.id
  }, [currentUser, profileOwnerId])

  // Organiser les commentaires en threads
  const commentThreads = useMemo(() => {
    const threads: CommentThread[] = []
    const commentMap = new Map<string, Comment>()
    
    // Créer une map des commentaires
    comments.forEach(comment => {
      commentMap.set(comment.id, comment)
    })

    // Organiser en threads
    comments.forEach(comment => {
      if (!comment.parentId) {
        // Commentaire racine
        const thread: CommentThread = {
          comment,
          replies: [],
          repliesCount: 0,
          collapsed: false
        }
        
        // Ajouter les réponses
        const addReplies = (parentId: string, targetReplies: CommentThread[]) => {
          const replies = comments.filter(c => c.parentId === parentId)
          replies.forEach(reply => {
            const replyThread: CommentThread = {
              comment: reply,
              replies: [],
              repliesCount: 0,
              collapsed: false
            }
            addReplies(reply.id, replyThread.replies)
            replyThread.repliesCount = replyThread.replies.length
            targetReplies.push(replyThread)
          })
        }
        
        addReplies(comment.id, thread.replies)
        thread.repliesCount = thread.replies.length
        threads.push(thread)
      }
    })

    return threads
  }, [comments])

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            <div className="h-3 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">
            Commentaires {stats && `(${stats.total})`}
          </h3>
          {stats?.averageRating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-300">
                {stats.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="group relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgba(15,15,25,0.8) 0%, rgba(25,15,35,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,107,157,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          {/* Effet de brillance au survol */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(183,148,246,0.1) 50%, rgba(79,209,199,0.1) 100%)'
            }}
          ></div>
          
          {/* Contenu du bouton */}
          <div className="relative flex items-center gap-2.5">
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                boxShadow: '0 2px 8px rgba(255,107,157,0.3)'
              }}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
              Commenter
            </span>
          </div>
          
          {/* Bordure animée */}
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(135deg, transparent 30%, rgba(255,107,157,0.3) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite'
            }}
          ></div>
        </button>
      </div>

      {/* Formulaire de commentaire */}
      {showForm && (
        <CommentForm
          onSubmit={submitComment}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
          currentUser={currentUser}
        />
      )}

      {/* Filtres retirés - plus de tri */}

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {commentThreads.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">Aucun commentaire pour le moment</p>
            <p className="text-sm text-gray-500">Soyez le premier à commenter</p>
          </div>
        ) : (
          commentThreads.map((thread) => (
            <CommentItem
              key={thread.comment.id}
              thread={thread}
              onVote={voteComment}
              onReport={reportComment}
              onReply={submitComment}
              canDelete={canDelete}
              currentUser={currentUser}
              allowRatings={allowRatings}
            />
          ))
        )}
      </div>
      
      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}