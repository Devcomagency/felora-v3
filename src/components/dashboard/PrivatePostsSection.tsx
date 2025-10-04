'use client'

import { useState } from 'react'
import { Lock, DollarSign, Eye, Trash2, Edit, Heart, MessageCircle, Crown, ArrowRight } from 'lucide-react'

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

interface PrivatePostsSectionProps {
  posts: MediaPost[]
  onDeletePost: (postId: string) => void
  onVisibilityChange: (postId: string, visibility: 'PUBLIC' | 'PRIVATE' | 'REQUESTABLE', price?: number) => void
}

export default function PrivatePostsSection({ posts, onDeletePost, onVisibilityChange }: PrivatePostsSectionProps) {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [priceValue, setPriceValue] = useState<number>(50)

  const privatePosts = posts.filter(post => post.visibility === 'PRIVATE')
  const requestablePosts = posts.filter(post => post.visibility === 'REQUESTABLE')

  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const handleBulkVisibilityChange = (visibility: 'PUBLIC' | 'REQUESTABLE') => {
    if (visibility === 'REQUESTABLE') {
      setShowPriceModal(true)
    } else {
      selectedPosts.forEach(postId => {
        onVisibilityChange(postId, visibility)
      })
      setSelectedPosts([])
    }
  }

  const handlePriceConfirm = () => {
    selectedPosts.forEach(postId => {
      onVisibilityChange(postId, 'REQUESTABLE', priceValue)
    })
    setSelectedPosts([])
    setShowPriceModal(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getVisibilityInfo = (post: MediaPost) => {
    if (post.visibility === 'REQUESTABLE') {
      return {
        icon: <DollarSign size={12} className="text-yellow-400" />,
        label: `${post.price}♦`,
        bgColor: 'bg-yellow-500/20 border-yellow-500/30',
        textColor: 'text-yellow-400'
      }
    } else {
      return {
        icon: <Lock size={12} className="text-red-400" />,
        label: 'Privé',
        bgColor: 'bg-red-500/20 border-red-500/30',
        textColor: 'text-red-400'
      }
    }
  }

  const renderPostGrid = (posts: MediaPost[], title: string, emptyMessage: string) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        {title === 'Privées' && <Lock size={16} className="text-red-400" />}
        {title === 'À la demande' && <DollarSign size={16} className="text-yellow-400" />}
        <span>{title} ({posts.length})</span>
      </h3>
      
      {posts.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
          <div className="text-gray-500 mb-2">
            {title === 'Privées' ? <Lock size={32} className="mx-auto" /> : <DollarSign size={32} className="mx-auto" />}
          </div>
          <p className="text-gray-400 text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => {
            const visibilityInfo = getVisibilityInfo(post)
            return (
              <div
                key={post.id}
                className="group relative bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
              >
                {/* Sélection */}
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={() => togglePostSelection(post.id)}
                  className="absolute top-3 left-3 z-10 w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                />

                {/* Badge visibilité */}
                <div className={`absolute top-3 right-3 z-10 px-2 py-1 backdrop-blur-sm border rounded-lg ${visibilityInfo.bgColor}`}>
                  <div className="flex items-center space-x-1">
                    {visibilityInfo.icon}
                    <span className={`text-xs ${visibilityInfo.textColor}`}>{visibilityInfo.label}</span>
                  </div>
                </div>

                {/* Image/Vidéo */}
                <div className="aspect-square relative">
                  <img
                    src={post.thumbUrl || post.url}
                    alt="Publication privée"
                    className="w-full h-full object-cover"
                  />
                  {post.type === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay privé */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Stats et actions */}
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
                          onVisibilityChange(post.id, 'PUBLIC')
                        }}
                        className="p-1.5 text-gray-400 hover:text-green-400 transition-colors"
                        title="Rendre public"
                      >
                        <Eye size={14} />
                      </button>
                      {post.visibility === 'PRIVATE' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onVisibilityChange(post.id, 'REQUESTABLE', 50)
                          }}
                          className="p-1.5 text-gray-400 hover:text-yellow-400 transition-colors"
                          title="Mettre à la demande"
                        >
                          <DollarSign size={14} />
                        </button>
                      )}
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
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      {/* En-tête section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Crown className="text-purple-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Publications Privées</h2>
            <p className="text-gray-400 text-sm">Accès restreint et contenu premium</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {selectedPosts.length > 0 && (
            <>
              <button
                onClick={() => handleBulkVisibilityChange('PUBLIC')}
                className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
              >
                Rendre public ({selectedPosts.length})
              </button>
              <button
                onClick={() => handleBulkVisibilityChange('REQUESTABLE')}
                className="px-4 py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm"
              >
                À la demande ({selectedPosts.length})
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

      {/* Contenu */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Crown className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune publication privée</h3>
          <p className="text-gray-500 text-sm mb-4">
            Crée du contenu exclusif pour générer des revenus supplémentaires.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openUploader'))}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            Créer du contenu premium
          </button>
        </div>
      ) : (
        <div>
          {/* Posts privés */}
          {renderPostGrid(privatePosts, 'Privées', 'Contenu visible seulement par toi')}
          
          {/* Posts payants */}
          {renderPostGrid(requestablePosts, 'À la demande', 'Contenu premium à débloquer')}
        </div>
      )}

      {/* Modal prix */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Définir le prix</h3>
            <p className="text-gray-400 text-sm mb-4">
              Quel prix veux-tu fixer pour accéder à ces {selectedPosts.length} publication{selectedPosts.length > 1 ? 's' : ''} ?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prix en diamants (♦)
              </label>
              <input
                type="number"
                value={priceValue}
                onChange={(e) => setPriceValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                min="1"
                max="500"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePriceConfirm}
                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informations */}
      {posts.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <Lock size={16} />
              <span className="font-medium">Publications privées</span>
            </div>
            <p className="text-red-300/80 text-sm mt-1">
              Visibles seulement par toi. Parfait pour organiser ton contenu avant publication.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-400 text-sm">
              <DollarSign size={16} />
              <span className="font-medium">Publications à la demande</span>
            </div>
            <p className="text-yellow-300/80 text-sm mt-1">
              Contenu premium que tes clients peuvent débloquer contre des diamants.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}