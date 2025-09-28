'use client'

import { useState, useEffect } from 'react'
import {
  Upload, Play, Image as ImageIcon, Diamond, Eye,
  Archive, MoreVertical, Check, ArrowLeft, Trash2,
  Grid, List, Search, Plus, TrendingUp, X
} from 'lucide-react'

interface Media {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  visibility: 'PUBLIC' | 'PREMIUM' | 'ARCHIVED'
  price?: number
  createdAt: string
  views?: number
  earnings?: number
}

interface UserDiamonds {
  balance: number
  totalEarned: number
  totalSpent: number
}

type UploadStep = 'select' | 'configure' | 'uploading' | 'success'
type ViewMode = 'grid' | 'list'
type FilterTab = 'all' | 'public' | 'premium' | 'archived'

export default function ModernMediaManager() {
  const [medias, setMedias] = useState<Media[]>([])
  const [userDiamonds, setUserDiamonds] = useState<UserDiamonds>({ balance: 0, totalEarned: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)
  const [unlockedMedias, setUnlockedMedias] = useState<Set<string>>(new Set())

  // Upload workflow states
  const [uploadStep, setUploadStep] = useState<UploadStep>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [uploadVisibility, setUploadVisibility] = useState<'PUBLIC' | 'PREMIUM'>('PUBLIC')
  const [uploadPrice, setUploadPrice] = useState<number>(10)

  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Charger les médias
  const loadMedias = async () => {
    try {
      const response = await fetch('/api/profile/unified/me')
      if (response.ok) {
        const data = await response.json()
        setMedias(data.medias || [])
      } else {
        console.log('API non disponible, mode test')
        setMedias([])
      }
    } catch (error) {
      console.error('Erreur chargement médias:', error)
      setMedias([])
    } finally {
      setLoading(false)
    }
  }

  // Charger le wallet diamants
  const loadDiamonds = async () => {
    try {
      const response = await fetch('/api/diamonds/wallet')
      if (response.ok) {
        const data = await response.json()
        setUserDiamonds(data.wallet || { balance: 0, totalEarned: 0, totalSpent: 0 })
      }
    } catch (error) {
      console.error('Erreur chargement diamants:', error)
    }
  }

  // Vérifier les accès aux médias
  const checkMediaAccess = async () => {
    const accessChecks = await Promise.all(
      medias
        .filter(m => m.visibility === 'PREMIUM')
        .map(async (media) => {
          try {
            const response = await fetch(`/api/media/unlock?mediaId=${media.id}`)
            if (response.ok) {
              const data = await response.json()
              return { mediaId: media.id, hasAccess: data.hasAccess }
            }
          } catch (error) {
            console.error('Erreur vérification accès:', error)
          }
          return { mediaId: media.id, hasAccess: false }
        })
    )

    const unlockedSet = new Set(
      accessChecks.filter(check => check.hasAccess).map(check => check.mediaId)
    )
    setUnlockedMedias(unlockedSet)
  }

  useEffect(() => {
    loadMedias()
    loadDiamonds()
  }, [])

  useEffect(() => {
    if (medias.length > 0) {
      checkMediaAccess()
    }
  }, [medias])

  // Upload workflow
  const handleFileSelect = (files: FileList) => {
    const file = files[0]
    if (!file) return

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl)
      }

      const previewUrl = URL.createObjectURL(file)
      setFilePreviewUrl(previewUrl)
      setSelectedFile(file)
      setUploadStep('configure')
    } else {
      alert('Format non supporté. Utilisez des images ou vidéos.')
    }
  }

  const confirmUpload = async () => {
    if (!selectedFile) return

    setUploadStep('uploading')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('visibility', uploadVisibility)
      if (uploadVisibility === 'PREMIUM') {
        formData.append('price', uploadPrice.toString())
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()

        const newMedia: Media = {
          id: data.media.id,
          url: data.media.url,
          type: data.media.type,
          visibility: uploadVisibility,
          price: uploadVisibility === 'PREMIUM' ? uploadPrice : undefined,
          createdAt: new Date().toISOString(),
          views: 0,
          earnings: 0
        }

        setMedias(prev => [newMedia, ...prev])
        setUploadStep('success')

        setTimeout(() => {
          resetUpload()
          setShowUploadModal(false)
        }, 2000)
      } else {
        const error = await response.json()
        alert(error.message || 'Erreur upload')
        setUploadStep('configure')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload')
      setUploadStep('configure')
    }
  }

  const resetUpload = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
    setUploadStep('select')
    setSelectedFile(null)
    setUploadVisibility('PUBLIC')
    setUploadPrice(10)
  }

  const cancelUpload = () => {
    resetUpload()
    setShowUploadModal(false)
  }

  // Actions sur les médias
  const archiveMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: 'ARCHIVED' })
      })

      if (response.ok) {
        setMedias(prev => prev.map(m =>
          m.id === mediaId ? { ...m, visibility: 'ARCHIVED' } : m
        ))
        alert('Média archivé')
      }
    } catch (error) {
      console.error('Erreur archivage:', error)
      alert('Erreur lors de l\'archivage')
    }
  }

  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce média ?')) return

    try {
      const response = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' })
      if (response.ok) {
        setMedias(prev => prev.filter(m => m.id !== mediaId))
        alert('Média supprimé')
      } else {
        alert('Erreur suppression')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const publishMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: 'PUBLIC' })
      })

      if (response.ok) {
        setMedias(prev => prev.map(m =>
          m.id === mediaId ? { ...m, visibility: 'PUBLIC' } : m
        ))
        alert('Média publié')
      }
    } catch (error) {
      console.error('Erreur publication:', error)
      alert('Erreur lors de la publication')
    }
  }

  // Débloquer un média premium
  const unlockPremiumMedia = async (mediaId: string, price: number) => {
    if (userDiamonds.balance < price) {
      alert(`Vous n'avez pas assez de diamants (${price} requis, ${userDiamonds.balance} disponibles)`)
      return
    }

    try {
      const response = await fetch('/api/media/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, price })
      })

      if (response.ok) {
        const data = await response.json()
        alert('Média débloqué !')
        setUnlockedMedias(prev => new Set([...prev, mediaId]))
        setUserDiamonds(prev => ({ ...prev, balance: data.newBalance }))
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur déblocage')
      }
    } catch (error) {
      console.error('Erreur déblocage:', error)
      alert('Erreur lors du déblocage')
    }
  }

  // Filtrer les médias
  const filteredMedias = medias.filter(media => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'public' && media.visibility === 'PUBLIC') ||
      (activeTab === 'premium' && media.visibility === 'PREMIUM') ||
      (activeTab === 'archived' && media.visibility === 'ARCHIVED')

    const matchesSearch = !searchTerm ||
      media.type.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesTab && matchesSearch
  })

  // Statistiques
  const stats = {
    total: medias.length,
    public: medias.filter(m => m.visibility === 'PUBLIC').length,
    premium: medias.filter(m => m.visibility === 'PREMIUM').length,
    archived: medias.filter(m => m.visibility === 'ARCHIVED').length,
    totalEarnings: medias.reduce((sum, m) => sum + (m.earnings || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Design sombre et minimal */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Médias</h1>
            <p className="text-gray-400 text-sm">
              {stats.total} médias • {stats.totalEarnings} diamants gagnés
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet */}
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2">
              <Diamond className="w-4 h-4 text-amber-400" />
              <span className="text-white font-medium">{userDiamonds.balance}</span>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Stats minimalistes */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'white' },
          { label: 'Public', value: stats.public, color: 'emerald-400' },
          { label: 'Premium', value: stats.premium, color: 'amber-400' },
          { label: 'Archivés', value: stats.archived, color: 'gray-400' }
        ].map((stat, index) => (
          <div key={index} className="bg-black/20 backdrop-blur-xl border border-white/[0.05] rounded-xl p-4">
            <div className={`text-2xl font-bold text-${stat.color} mb-1`}>
              {stat.value}
            </div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Contrôles */}
      <div className="bg-black/20 backdrop-blur-xl border border-white/[0.05] rounded-2xl p-4">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-black/40 rounded-xl p-1">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'public', label: 'Public' },
              { key: 'premium', label: 'Premium' },
              { key: 'archived', label: 'Archivés' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as FilterTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contrôles droite */}
          <div className="flex items-center gap-3">
            {/* Recherche */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/20 w-48"
              />
            </div>

            {/* View Mode */}
            <div className="flex bg-black/40 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des médias */}
      {filteredMedias.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredMedias.map((media) => {
            const isPremium = media.visibility === 'PREMIUM'
            const isUnlocked = unlockedMedias.has(media.id)
            const shouldBlur = isPremium && !isUnlocked
            const isArchived = media.visibility === 'ARCHIVED'

            return (
              <div
                key={media.id}
                className={`relative group bg-black/20 backdrop-blur-xl border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Média */}
                <div className={`relative ${
                  viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'
                }`}>
                  {media.type === 'VIDEO' ? (
                    <video
                      src={media.url}
                      className={`w-full h-full object-cover ${shouldBlur ? 'blur-md' : ''}`}
                      muted
                      controls={!shouldBlur}
                      poster={media.url}
                      onError={(e) => {
                        console.log('Erreur chargement vidéo:', e)
                      }}
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt="Media preview"
                      className={`w-full h-full object-cover ${shouldBlur ? 'blur-md' : ''}`}
                      onError={(e) => {
                        console.log('Erreur chargement image:', e)
                        const target = e.target as HTMLImageElement
                        target.src = '/api/placeholder/400/400'
                      }}
                    />
                  )}

                  {/* Overlay pour médias premium */}
                  {shouldBlur && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <Diamond className="w-6 h-6 text-amber-400 mb-2 mx-auto" />
                        <div className="text-white font-medium text-sm">{media.price} 💎</div>
                        <button
                          onClick={() => media.price && unlockPremiumMedia(media.id, media.price)}
                          className="mt-2 px-3 py-1 bg-white text-black rounded-lg text-xs hover:bg-gray-100 transition-colors font-medium"
                        >
                          Débloquer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Badge visibilité */}
                  <div className="absolute top-2 left-2">
                    {media.visibility === 'PUBLIC' && (
                      <div className="bg-emerald-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Public
                      </div>
                    )}
                    {media.visibility === 'PREMIUM' && (
                      <div className="bg-amber-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Diamond className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    {media.visibility === 'ARCHIVED' && (
                      <div className="bg-gray-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        Archivé
                      </div>
                    )}
                  </div>

                  {/* Type de média */}
                  {media.type === 'VIDEO' && (
                    <div className="absolute bottom-2 left-2">
                      <Play className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  )}

                  {/* Menu actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button className="bg-black/60 backdrop-blur-sm text-white p-1.5 rounded-lg hover:bg-black/80 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Menu déroulant */}
                      <div className="absolute right-0 top-full mt-1 bg-black/90 backdrop-blur-xl border border-white/[0.08] rounded-lg shadow-xl min-w-32 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {isArchived ? (
                          <button
                            onClick={() => publishMedia(media.id)}
                            className="w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-white/[0.05] flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Publier
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveMedia(media.id)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-400 hover:bg-white/[0.05] flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Archiver
                          </button>
                        )}
                        <button
                          onClick={() => deleteMedia(media.id)}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/[0.05] flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Infos média (mode liste) */}
                {viewMode === 'list' && (
                  <div className="flex-1 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">
                        {media.type} • {new Date(media.createdAt).toLocaleDateString()}
                      </span>
                      {media.price && (
                        <span className="text-amber-400 text-sm font-medium">
                          {media.price} 💎
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{media.views || 0} vues</span>
                      {media.earnings && <span>{media.earnings} 💎 gagnés</span>}
                    </div>
                  </div>
                )}

                {/* Prix (mode grille) */}
                {viewMode === 'grid' && media.price && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center justify-center gap-1 text-amber-400">
                      <Diamond className="w-3 h-3" />
                      <span className="text-xs font-medium">{media.price} diamants</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-black/20 backdrop-blur-xl border border-white/[0.05] rounded-2xl">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {activeTab === 'all' ? 'Aucun média' : `Aucun média ${activeTab}`}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Commencez par ajouter des photos ou vidéos
          </p>
          {activeTab === 'all' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un média
            </button>
          )}
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl w-full max-w-lg">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <h2 className="text-xl font-semibold text-white">Ajouter un média</h2>
              <button
                onClick={cancelUpload}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Upload Select */}
              {uploadStep === 'select' && (
                <div
                  className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group"
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileSelect(e.dataTransfer.files)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('upload-input')?.click()}
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Sélectionner un fichier
                  </h3>
                  <p className="text-gray-400 mb-2">
                    Glissez vos fichiers ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-gray-500">
                    Images et vidéos • Max 50MB • JPG, PNG, MP4, MOV
                  </p>

                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    id="upload-input"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  />
                </div>
              )}

              {/* Configuration Upload */}
              {uploadStep === 'configure' && selectedFile && (
                <div className="space-y-6">
                  {/* Preview */}
                  {filePreviewUrl && (
                    <div className="bg-black/40 rounded-xl p-4">
                      <p className="text-gray-300 text-sm mb-3">
                        📁 {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </p>
                      <div className="relative w-full max-w-sm mx-auto">
                        {selectedFile.type.startsWith('video/') ? (
                          <video
                            src={filePreviewUrl}
                            className="w-full h-48 object-cover rounded-lg border border-white/[0.08]"
                            controls
                            muted
                          />
                        ) : (
                          <img
                            src={filePreviewUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border border-white/[0.08]"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                          {selectedFile.type.startsWith('video/') ? '🎥 Vidéo' : '🖼️ Image'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Type de publication */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Type de publication
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setUploadVisibility('PUBLIC')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          uploadVisibility === 'PUBLIC'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/[0.08] bg-black/20 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <Eye className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">PUBLIC</div>
                        <div className="text-xs opacity-75 mt-1">Visible par tous • Gratuit</div>
                      </button>

                      <button
                        onClick={() => setUploadVisibility('PREMIUM')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          uploadVisibility === 'PREMIUM'
                            ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                            : 'border-white/[0.08] bg-black/20 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <Diamond className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">PREMIUM</div>
                        <div className="text-xs opacity-75 mt-1">Payant en diamants</div>
                      </button>
                    </div>
                  </div>

                  {/* Prix pour premium */}
                  {uploadVisibility === 'PREMIUM' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <label className="block text-sm font-medium text-amber-300 mb-2">
                        Prix en diamants
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={uploadPrice}
                          onChange={(e) => setUploadPrice(parseInt(e.target.value) || 10)}
                          className="bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/20 w-24"
                        />
                        <div className="flex items-center gap-1 text-amber-400">
                          <Diamond className="w-4 h-4" />
                          <span className="text-sm">diamants</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={cancelUpload}
                      className="flex-1 px-4 py-3 bg-black/40 hover:bg-black/60 text-white rounded-xl transition-colors border border-white/[0.08]"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={confirmUpload}
                      className="flex-1 px-4 py-3 bg-white text-black rounded-xl transition-colors font-medium hover:bg-gray-100"
                    >
                      Publier {uploadVisibility === 'PREMIUM' ? `(${uploadPrice}💎)` : ''}
                    </button>
                  </div>
                </div>
              )}

              {/* Upload en cours */}
              {uploadStep === 'uploading' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload en cours...</h3>
                  <p className="text-gray-400 text-sm">Veuillez patienter</p>
                </div>
              )}

              {/* Upload réussi */}
              {uploadStep === 'success' && (
                <div className="text-center py-8">
                  <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-emerald-300 mb-2">Média publié !</h3>
                  <p className="text-emerald-400 text-sm">Votre contenu est maintenant disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}