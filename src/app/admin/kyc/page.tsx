"use client"
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Download, Lock } from 'lucide-react'

interface KYCSubmission {
  id: string
  userId: string
  role: string
  status: string
  docFrontUrl?: string
  docBackUrl?: string
  selfieSignUrl?: string
  livenessVideoUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)

  // Filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('ALL')

  useEffect(() => {
    // Vérifier si déjà authentifié
    const auth = localStorage.getItem('felora-admin-auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchSubmissions()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    try {
      // 🔐 Appeler l'API d'authentification sécurisée
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('🔍 Login response:', data)

      if (data.success) {
        setIsAuthenticated(true)
        localStorage.setItem('felora-admin-auth', 'true')
        fetchSubmissions()
      } else {
        setAuthError(data.error || 'Email ou mot de passe incorrect')
      }
    } catch (error) {
      console.error('🚨 Login error:', error)
      setAuthError('Erreur de connexion au serveur')
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/kyc')
      const data = await response.json()
      
      if (data.success) {
        setSubmissions(data.submissions)
      } else {
        setError(data.error || 'Erreur lors du chargement')
      }
    } catch (e) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="text-green-500" size={20} />
      case 'REJECTED': return <XCircle className="text-red-500" size={20} />
      case 'PENDING': return <Clock className="text-yellow-500" size={20} />
      default: return <Clock className="text-gray-500" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/20 text-green-400'
      case 'REJECTED': return 'bg-red-500/20 text-red-400'
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  // Page de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <div className="text-center mb-8">
              <Lock className="mx-auto mb-4 text-purple-400" size={48} />
              <h1 className="text-2xl font-bold text-white mb-2">Administration KYC</h1>
              <p className="text-white/60">Accès protégé - Entrez le mot de passe</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="info@devcom.ch"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Entrez le mot de passe"
                  required
                />
              </div>
              
              {authError && (
                <div className="text-red-400 text-sm text-center">
                  {authError}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Se connecter
              </button>
            </form>
            
            <div className="mt-6 text-center text-xs text-white/40">
              <p>Identifiants admin :</p>
              <p>Email: <code className="bg-white/10 px-2 py-1 rounded">info@devcom.ch</code></p>
              <p>Mot de passe: <code className="bg-white/10 px-2 py-1 rounded">Devcom20!</code></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-center">
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p>{error}</p>
          <button 
            onClick={fetchSubmissions}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // Filtrer les soumissions selon recherche et rôle
  const filteredSubmissions = submissions.filter(s => {
    // Filtre par recherche (userId ou email)
    const matchesSearch = searchQuery === '' ||
      s.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())

    // Filtre par rôle
    const matchesRole = filterRole === 'ALL' || s.role === filterRole

    return matchesSearch && matchesRole
  })

  // Séparer et trier les soumissions par statut
  const pendingSubmissions = filteredSubmissions
    .filter(s => s.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const approvedSubmissions = filteredSubmissions
    .filter(s => s.status === 'APPROVED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const rejectedSubmissions = filteredSubmissions
    .filter(s => s.status === 'REJECTED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const renderSubmission = (submission: KYCSubmission) => (
    <div key={submission.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">Soumission #{submission.id.slice(0, 8)}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
            {getStatusIcon(submission.status)} {submission.status}
          </span>
        </div>
        <div className="text-sm text-white/60">
          {new Date(submission.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium mb-2">Informations</h4>
          <div className="space-y-1 text-sm text-white/80">
            <p><strong>User ID:</strong> {submission.userId}</p>
            <p><strong>Rôle:</strong> {submission.role}</p>
            <p><strong>Créé:</strong> {new Date(submission.createdAt).toLocaleString('fr-FR')}</p>
            <p><strong>Modifié:</strong> {new Date(submission.updatedAt).toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Documents</h4>
          <div className="space-y-2">
            {submission.docFrontUrl && (
              <div className="flex items-center gap-2">
                <span className="text-sm">📄 Recto:</span>
                <a
                  href={submission.docFrontUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Eye size={14} /> Voir
                </a>
              </div>
            )}
            {submission.docBackUrl && (
              <div className="flex items-center gap-2">
                <span className="text-sm">📄 Verso:</span>
                <a
                  href={submission.docBackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Eye size={14} /> Voir
                </a>
              </div>
            )}
            {submission.selfieSignUrl && (
              <div className="flex items-center gap-2">
                <span className="text-sm">🤳 Selfie:</span>
                <a
                  href={submission.selfieSignUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Eye size={14} /> Voir
                </a>
              </div>
            )}
            {submission.livenessVideoUrl && (
              <div className="flex items-center gap-2">
                <span className="text-sm">🎥 Vidéo:</span>
                <a
                  href={submission.livenessVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Eye size={14} /> Voir
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes masquées (contient uniquement des données techniques JSON) */}

      {/* Bouton pour voir les détails */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <a
          href={`/admin/kyc/${submission.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <Eye size={16} />
          Voir détail
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Administration KYC</h1>
            <p className="text-white/60 mt-2">
              {pendingSubmissions.length} en attente · {approvedSubmissions.length} approuvées · {rejectedSubmissions.length} rejetées
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Actualiser
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher par User ID ou Submission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[300px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ESCORT">Escort</option>
            <option value="CLUB">Club</option>
          </select>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Aucune soumission KYC</h2>
            <p className="text-white/60">Aucun document de vérification n'a été soumis.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Soumissions en attente */}
            {pendingSubmissions.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-yellow-500" size={24} />
                  <h2 className="text-2xl font-bold">En attente ({pendingSubmissions.length})</h2>
                </div>
                <div className="grid gap-6">
                  {pendingSubmissions.map(renderSubmission)}
                </div>
              </div>
            )}

            {/* Soumissions approuvées */}
            {approvedSubmissions.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-500" size={24} />
                  <h2 className="text-2xl font-bold">Approuvées ({approvedSubmissions.length})</h2>
                </div>
                <div className="grid gap-6">
                  {approvedSubmissions.map(renderSubmission)}
                </div>
              </div>
            )}

            {/* Soumissions rejetées */}
            {rejectedSubmissions.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="text-red-500" size={24} />
                  <h2 className="text-2xl font-bold">Rejetées ({rejectedSubmissions.length})</h2>
                </div>
                <div className="grid gap-6">
                  {rejectedSubmissions.map(renderSubmission)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}