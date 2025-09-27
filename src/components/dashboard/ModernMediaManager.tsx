'use client'

import { useState, useEffect } from 'react'
import {
  Eye, Upload, X, Play, Image as ImageIcon, Diamond, Unlock,
  Archive, MoreVertical, Check, ArrowLeft, Edit3, Trash2,
  Grid, List, Filter, Search, Plus, Star, TrendingUp
} from 'lucide-react'
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession()
  const [medias, setMedias] = useState<Media[]>([])
  const [userDiamonds, setUserDiamonds] = useState<UserDiamonds>({ balance: 0, totalEarned: 0, totalSpent: 0 })
  const [loading, setLoading] = useState(true)
  const [unlockedMedias, setUnlockedMedias] = useState<Set<string>>(new Set())

  // Upload workflow states
  const [uploadStep, setUploadStep] = useState<UploadStep>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadVisibility, setUploadVisibility] = useState<'PUBLIC' | 'PREMIUM'>('PUBLIC')
  const [uploadPrice, setUploadPrice] = useState<number>(10)

  // UI states
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Charger les médias
  const loadMedias = async () => {
    try {
      const response = await fetch('/api/profile/unified/me')
      if (response.ok) {
        const data = await response.json()
        setMedias(data.medias || [])
      }
    } catch (error) {
      console.error('Erreur chargement médias:', error)
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

  // Nouveau workflow d'upload en étapes
  const handleFileSelect = (files: FileList) => {
    const file = files[0]
    if (!file) return

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
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

        // Reset après 2 secondes
        setTimeout(() => {
          setUploadStep('select')
          setSelectedFile(null)
          setUploadVisibility('PUBLIC')
          setUploadPrice(10)
        }, 2000)
      } else {
        const error = await response.json()
        alert(error.message || 'Erreur upload')
        setUploadStep('configure')
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      alert("Erreur lors de l'upload")
      setUploadStep('configure')
    }
  }

  const cancelUpload = () => {
    setUploadStep('select')
    setSelectedFile(null)
    setUploadVisibility('PUBLIC')
    setUploadPrice(10)
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
      alert("Erreur lors de l'archivage")
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Mobile-First */}
      <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
              Gestionnaire de Médias
            </h2>
            <p className="text-sm text-gray-400">
              {stats.total} médias • {stats.totalEarnings} 💎 gagnés
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-2 rounded-xl border border-purple-500/30 shrink-0">
            <Diamond className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-medium text-sm md:text-base">
              {userDiamonds.balance} diamants
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Public', value: stats.public, color: 'emerald', icon: Eye },
          { label: 'Premium', value: stats.premium, color: 'amber', icon: Diamond },
          { label: 'Archivés', value: stats.archived, color: 'slate', icon: Archive },
          { label: 'Revenus', value: `${stats.totalEarnings}💎`, color: 'purple', icon: TrendingUp }
        ].map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 backdrop-blur-sm border border-${stat.color}-500/20 rounded-xl p-3 md:p-4`}>
            <div className="flex items-center gap-2">
              <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
              <span className={`text-${stat.color}-400 text-xs md:text-sm font-medium`}>
                {stat.label}
              </span>
            </div>
            <div className={`text-${stat.color}-200 text-lg md:text-xl font-bold mt-1`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      {uploadStep === 'select' && (
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-6">
          <div
            className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl p-6 md:p-8 text-center transition-all duration-300 cursor-pointer group"
            onDrop={(e) => {
              e.preventDefault()
              handleFileSelect(e.dataTransfer.files)
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            <div className="group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Ajouter un nouveau média
            </h3>
            <p className="text-gray-300 mb-2 text-sm md:text-base">
              Glissez vos fichiers ici ou cliquez pour sélectionner
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Images et vidéos • Max 50MB • Formats : JPG, PNG, MP4, MOV
            </p>

            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="media-upload"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
          </div>
        </div>
      )}

      {/* Configuration Upload */}
      {uploadStep === 'configure' && selectedFile && (
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={cancelUpload} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-white">Configuration du média</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <p className="text-gray-300 text-sm">
                📁 {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Type de publication
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setUploadVisibility('PUBLIC')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    uploadVisibility === 'PUBLIC'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-emerald-500/50'
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
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-amber-500/50'
                  }`}
                >
                  <Diamond className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">PREMIUM</div>
                  <div className="text-xs opacity-75 mt-1">Payant en diamants</div>
                </button>
              </div>
            </div>

            {uploadVisibility === 'PREMIUM' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
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
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent w-24"
                  />
                  <div className="flex items-center gap-1 text-amber-400">
                    <Diamond className="w-4 h-4" />
                    <span className="text-sm">diamants</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelUpload}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmUpload}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-medium"
              >
                Publier {uploadVisibility === 'PREMIUM' ? `(${uploadPrice}💎)` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload en cours */}
      {uploadStep === 'uploading' && (
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload en cours...</h3>
            <p className="text-gray-400 text-sm">Veuillez patienter</p>
          </div>
        </div>
      )}

      {/* Upload réussi */}
      {uploadStep === 'success' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
          <div className="text-center">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-300 mb-2">Média publié !</h3>
            <p className="text-green-400 text-sm">Votre contenu est maintenant disponible</p>
          </div>
        </div>
      )}

      {/* Tabs et contrôles */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Tabs Mobile-First */}
          <div className="flex gap-1 bg-gray-700/50 rounded-lg p-1 overflow-x-auto">
            {[
              { key: 'all', label: 'Tous', count: stats.total },
              { key: 'public', label: 'Public', count: stats.public },
              { key: 'premium', label: 'Premium', count: stats.premium },
              { key: 'archived', label: 'Archivés', count: stats.archived }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as FilterTab)}
                className={`px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Contrôles */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-40"
              />
            </div>

            <div className="flex bg-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
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
        <div className={`grid gap-3 md:gap-4 ${
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
              <div key={media.id} className={`relative group rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}>

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
                    />
                  ) : (
                    <img
                      src={media.url}
                      alt=""
                      className={`w-full h-full object-cover ${shouldBlur ? 'blur-md' : ''}`}
                    />
                  )}

                  {/* Overlay pour médias premium */}
                  {shouldBlur && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center">
                        <Diamond className="w-8 h-8 text-amber-400 mb-2 mx-auto" />
                        <div className="text-white font-medium text-sm">{media.price} 💎</div>
                        <button
                          onClick={() => media.price && unlockPremiumMedia(media.id, media.price)}
                          className="mt-2 px-3 py-1 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg text-xs hover:scale-105 transition-transform"
                        >
                          Débloquer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Badge visibilité */}
                  <div className="absolute top-2 left-2">
                    {media.visibility === 'PUBLIC' && (
                      <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Public
                      </div>
                    )}
                    {media.visibility === 'PREMIUM' && (
                      <div className="bg-amber-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <Diamond className="w-3 h-3" />
                        Premium
                      </div>
                    )}
                    {media.visibility === 'ARCHIVED' && (
                      <div className="bg-slate-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
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

                      {/* Menu déroulant (simplifié pour l'exemple) */}
                      <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl min-w-32 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {isArchived ? (
                          <button
                            onClick={() => publishMedia(media.id)}
                            className="w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Publier
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveMedia(media.id)}
                            className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Archiver
                          </button>
                        )}
                        <button
                          onClick={() => deleteMedia(media.id)}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2"
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
        <div className="text-center py-12 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {activeTab === 'all' ? 'Aucun média' : `Aucun média ${activeTab}`}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Commencez par ajouter des photos ou vidéos
          </p>
          {activeTab === 'all' && (
            <button
              onClick={() => document.getElementById('media-upload')?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              Ajouter un média
            </button>
          )}
        </div>
      )}
    </div>
  )
}