'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Calendar, Mail, Shield, AlertTriangle,
  CheckCircle, XCircle, Clock, Eye, FileText, TrendingUp
} from 'lucide-react'
import DocumentViewer from '@/components/admin/DocumentViewer'

interface KYCSubmission {
  id: string
  userId: string
  role: string
  status: string
  docFrontUrl: string | null
  docBackUrl: string | null
  selfieSignUrl: string | null
  livenessVideoUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  rejectionReason: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  user: {
    email: string
    name: string | null
    role: string
    createdAt: string
    escortProfile?: { stageName: string; city: string; verified: boolean } | null
    clubProfile?: { name: string; city: string; verified: boolean } | null
  }
}

interface KYCMetadata {
  previousAttempts: number
  userStats: {
    accountAge: number
    profileCompletion: number
    hasProfilePhoto: boolean
    totalSubmissions: number
    rejectedCount: number
  }
  comparativeStats: {
    approvalRate: number
    rejectionRate: number
    pendingCount: number
  }
  riskScore: number
  flags: {
    multipleRejections: boolean
    newAccount: boolean
    fastResubmission: boolean
    maxAttemptsReached: boolean
    incompleteProfile: boolean
  }
}

const REJECTION_REASONS = [
  "Document illisible ou de mauvaise qualité",
  "Document expiré",
  "Photo ne correspond pas au document",
  "Document falsifié ou modifié",
  "Âge insuffisant (18+)",
  "Document non accepté (pas d'ID/passeport)",
  "Selfie non conforme (pas de visage visible)",
  "Signe manuscrit manquant ou illisible",
  "Informations incohérentes",
  "Document déjà utilisé pour un autre compte",
  "Autre (préciser)"
]

export default function KYCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [submissionId, setSubmissionId] = useState<string>('')
  const [submission, setSubmission] = useState<KYCSubmission | null>(null)
  const [metadata, setMetadata] = useState<KYCMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    params.then(p => {
      setSubmissionId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (submissionId) {
      fetchSubmissionDetails()
    }
  }, [submissionId])

  const fetchSubmissionDetails = async () => {
    try {
      const response = await fetch(`/api/admin/kyc/${submissionId}`)
      const data = await response.json()

      if (data.success) {
        setSubmission(data.submission)
        setMetadata(data.metadata)
        setAdminNotes(data.submission.notes || '')
      }
    } catch (error) {
      console.error('Erreur chargement détails KYC:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !selectedReason) {
      alert('Veuillez sélectionner une raison de rejet')
      return
    }

    const finalReason = selectedReason === 'Autre (préciser)'
      ? customReason
      : selectedReason

    if (action === 'REJECT' && !finalReason) {
      alert('Veuillez préciser la raison')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir ${action === 'APPROVE' ? 'approuver' : 'rejeter'} cette soumission ?`)) {
      return
    }

    setActionLoading(true)

    try {
      const response = await fetch(`/api/admin/kyc/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: finalReason,
          notes: adminNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        router.push('/admin/kyc')
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      console.error('Erreur action KYC:', error)
      alert('Erreur lors de l\'action')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!submission || !metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Soumission non trouvée</h2>
          <button
            onClick={() => router.push('/admin/kyc')}
            className="text-purple-400 hover:text-purple-300"
          >
            ← Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  const documents = [
    { url: submission.docFrontUrl, label: 'Document Recto', type: 'front' as const },
    { url: submission.docBackUrl, label: 'Document Verso', type: 'back' as const },
    { url: submission.selfieSignUrl, label: 'Selfie + Signe', type: 'selfie' as const },
    { url: submission.livenessVideoUrl, label: 'Vidéo Liveness', type: 'video' as const }
  ]

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-400'
    if (score < 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      APPROVED: 'bg-green-500/20 text-green-400',
      REJECTED: 'bg-red-500/20 text-red-400'
    }
    return styles[status as keyof typeof styles] || styles.PENDING
  }

  const profileName = submission.user.escortProfile?.stageName ||
                      submission.user.clubProfile?.name ||
                      submission.user.name ||
                      'Utilisateur'

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/kyc')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Retour à la liste
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Vérification KYC #{submission.id.slice(0, 8)}
              </h1>
              <p className="text-gray-400">
                Soumis le {new Date(submission.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(submission.status)}`}>
                {submission.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Documents */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Eye size={20} />
                Documents soumis
              </h2>
              <DocumentViewer documents={documents} />
            </div>

            {/* Informations utilisateur */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User size={20} />
                Informations utilisateur
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Nom</div>
                  <div className="text-white font-medium">{profileName}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Email</div>
                  <div className="text-white font-medium">{submission.user.email}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Rôle</div>
                  <div className="text-white font-medium">{submission.role}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Ville</div>
                  <div className="text-white font-medium">
                    {submission.user.escortProfile?.city || submission.user.clubProfile?.city || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Compte créé le</div>
                  <div className="text-white font-medium">
                    {new Date(submission.user.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Âge du compte</div>
                  <div className="text-white font-medium">
                    {metadata.userStats.accountAge} jour(s)
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {submission.status === 'PENDING' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>

                {/* Notes admin */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notes administrateur (privées)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    placeholder="Ajoutez des notes internes..."
                  />
                </div>

                {/* Raisons de rejet */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Raison du rejet (si applicable)
                  </label>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Sélectionnez une raison --</option>
                    {REJECTION_REASONS.map((reason, i) => (
                      <option key={i} value={reason}>{reason}</option>
                    ))}
                  </select>

                  {selectedReason === 'Autre (préciser)' && (
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={2}
                      placeholder="Précisez la raison..."
                    />
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={20} />
                    Approuver
                  </button>

                  <button
                    onClick={() => handleAction('REJECT')}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={20} />
                    Rejeter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar droite */}
          <div className="space-y-6">
            {/* Risk Score */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={18} />
                Score de risque
              </h3>

              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${getRiskColor(metadata.riskScore)}`}>
                  {metadata.riskScore}
                </div>
                <div className="text-sm text-gray-400 mt-1">sur 100</div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metadata.riskScore < 30 ? 'bg-green-500' :
                    metadata.riskScore < 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${metadata.riskScore}%` }}
                />
              </div>
            </div>

            {/* Flags de sécurité */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={18} />
                Alertes
              </h3>

              <div className="space-y-2">
                {metadata.flags.maxAttemptsReached && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-300">
                      <strong>Max tentatives atteint</strong> - 5e tentative (dernière avant ban)
                    </div>
                  </div>
                )}

                {metadata.flags.multipleRejections && (
                  <div className="flex items-start gap-2 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <AlertTriangle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-300">
                      Plusieurs rejets précédents ({metadata.userStats.rejectedCount})
                    </div>
                  </div>
                )}

                {metadata.flags.fastResubmission && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <Clock size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-300">
                      Re-soumission rapide (&lt; 24h)
                    </div>
                  </div>
                )}

                {metadata.flags.newAccount && (
                  <div className="flex items-start gap-2 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <Calendar size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-300">
                      Compte récent (&lt; 7 jours)
                    </div>
                  </div>
                )}

                {metadata.flags.incompleteProfile && (
                  <div className="flex items-start gap-2 p-3 bg-gray-500/20 border border-gray-500/30 rounded-lg">
                    <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                      Profil incomplet ({metadata.userStats.profileCompletion}%)
                    </div>
                  </div>
                )}

                {!Object.values(metadata.flags).some(Boolean) && (
                  <div className="text-center text-gray-400 text-sm py-2">
                    Aucune alerte détectée ✅
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} />
                Statistiques
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Tentatives totales</span>
                  <span className="text-white font-medium">{metadata.previousAttempts + 1}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Rejets précédents</span>
                  <span className="text-white font-medium">{metadata.userStats.rejectedCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Profil complété</span>
                  <span className="text-white font-medium">{metadata.userStats.profileCompletion}%</span>
                </div>

                <div className="border-t border-white/10 pt-3 mt-3">
                  <div className="text-xs text-gray-500 mb-2">Moyennes globales</div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Taux approbation</span>
                    <span className="text-green-400 font-medium">{metadata.comparativeStats.approvalRate}%</span>
                  </div>

                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-400">En attente</span>
                    <span className="text-yellow-400 font-medium">{metadata.comparativeStats.pendingCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
