'use client'

import { useState } from 'react'
import { Globe, Eye, Trash2, Edit, Heart, MessageCircle, Share, ArrowRight } from 'lucide-react'

interface MediaPost {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  thumbUrl?: string
  visibility: 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE'
  price?: number
  position?: number
  likeCount: number
  reactCount: number
  createdAt: string
}

interface PublicPostsSectionProps {
  posts: MediaPost[]
  onDeletePost: (postId: string) => void
  onVisibilityChange: (postId: string, visibility: 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE', price?: number) => void
}

export default function PublicPostsSection({ posts, onDeletePost, onVisibilityChange }: PublicPostsSectionProps) {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showActions, setShowActions] = useState(false)

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const handleBulkVisibilityChange = (visibility: 'PRIVATE') => {
    selectedPosts.forEach(postId => {
      onVisibilityChange(postId, visibility)
    })
    setSelectedPosts([])
    setShowActions(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      {/* En-tête section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Globe className="text-green-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Publications Publiques</h2>
            <p className="text-gray-400 text-sm">Visibles sur ton profil public</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {selectedPosts.length > 0 && (
            <>
              <button
                onClick={() => handleBulkVisibilityChange('PRIVATE')}
                className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
              >
                Passer en privé ({selectedPosts.length})
              </button>
              <button
                onClick={() => setSelectedPosts([])}
                className="px-4 py-2 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-lg hover:bg-gray-600/30 transition-colors text-sm"
              >
                Désélectionner
              </button>
            </>
          )}
          <span className="text-sm text-gray-400">{posts.length} publication{posts.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Grille des posts publics */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune publication publique</h3>
          <p className="text-gray-500 text-sm mb-4">
            Tes publications publiques apparaissent sur ton profil et dans les résultats de recherche.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openUploader'))}
            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            Créer ma première publication
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-green-500/50 transition-all cursor-pointer"
            >
              {/* Sélection */}
              <input
                type="checkbox"
                checked={selectedPosts.includes(post.id)}
                onChange={() => togglePostSelection(post.id)}
                className="absolute top-3 left-3 z-10 w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
              />

              {/* Badge public */}
              <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg">
                <Globe size={12} className="text-green-400" />
              </div>

              {/* Image/Vidéo */}
              <div className="aspect-square relative">
                <img
                  src={post.thumbUrl || post.url}
                  alt="Publication"
                  className="w-full h-full object-cover"
                />
                {post.type === 'VIDEO' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart size={14} />
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={14} />
                      <span>{post.reactCount}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                </div>

                {/* Actions rapides */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Ouvrir modal d'édition
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Éditer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onVisibilityChange(post.id, 'PRIVATE')
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                      title="Passer en privé"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Supprimer cette publication ?')) {
                        onDeletePost(post.id)
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informations */}
      {posts.length > 0 && (
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-green-400 text-sm">
            <Globe size={16} />
            <span className="font-medium">Visibilité publique</span>
          </div>
          <p className="text-green-300/80 text-sm mt-1">
            Ces publications sont visibles sur ton profil public et peuvent apparaître dans les résultats de recherche.
          </p>
        </div>
      )}
    </div>
  )
}