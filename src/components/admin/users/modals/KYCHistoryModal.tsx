'use client'

import { useState, useEffect } from 'react'
import { X, Clock, CheckCircle, XCircle, Eye, Download } from 'lucide-react'
import DocumentViewer from '@/components/admin/DocumentViewer'

interface KYCSubmission {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  docFrontUrl: string | null
  docBackUrl: string | null
  selfieSignUrl: string | null
  livenessVideoUrl: string | null
  notes: string | null
  rejectionReason: string | null
}

interface KYCHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  userEmail: string
}

export default function KYCHistoryModal({
  isOpen,
  onClose,
  userId,
  userEmail
}: KYCHistoryModalProps) {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchKYCHistory()
    }
  }, [isOpen, userId])

  if (!isOpen) return null

  const fetchKYCHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/users/${userId}/kyc-history`)
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
      case 'APPROVED': return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/20'
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock size={24} className="text-purple-400" />
              Historique KYC
            </h2>
            <p className="text-white/60 text-sm mt-1">{userEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white/60">Chargement de l'historique...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">{error}</div>
              <button
                onClick={fetchKYCHistory}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && submissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/60 mb-2">Aucune soumission KYC</div>
              <div className="text-white/40 text-sm">Cet utilisateur n'a jamais soumis de documents</div>
            </div>
          )}

          {!loading && !error && submissions.length > 0 && (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {submissions.map((submission, index) => (
                  <div key={submission.id} className="relative pl-8 pb-8">
                    {/* Timeline line */}
                    {index < submissions.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-white/10"></div>
                    )}

                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1 p-1 rounded-full border-2 ${
                      submission.status === 'APPROVED' ? 'bg-green-500/20 border-green-500'
                        : submission.status === 'REJECTED' ? 'bg-red-500/20 border-red-500'
                        : 'bg-yellow-500/20 border-yellow-500'
                    }`}>
                      {getStatusIcon(submission.status)}
                    </div>

                    {/* Submission card */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                          <span className="text-white/60 text-sm">
                            {new Date(submission.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors text-sm"
                        >
                          <Eye size={14} />
                          Détails
                        </button>
                      </div>

                      {/* Documents count */}
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                        {submission.docFrontUrl && <span>📄 Recto</span>}
                        {submission.docBackUrl && <span>📄 Verso</span>}
                        {submission.selfieSignUrl && <span>🤳 Selfie</span>}
                        {submission.livenessVideoUrl && <span>🎥 Vidéo</span>}
                      </div>

                      {/* Rejection reason */}
                      {submission.status === 'REJECTED' && submission.rejectionReason && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-3">
                          <div className="text-red-400 text-sm font-medium mb-1">Raison du rejet :</div>
                          <div className="text-white/80 text-sm">{submission.rejectionReason}</div>
                        </div>
                      )}

                      {/* ID */}
                      <div className="text-xs text-white/40 mt-2">
                        ID: {submission.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">
                  Détails de la soumission
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <DocumentViewer
                  documents={[
                    {
                      url: selectedSubmission.docFrontUrl,
                      label: 'Document Recto',
                      type: 'front'
                    },
                    {
                      url: selectedSubmission.docBackUrl,
                      label: 'Document Verso',
                      type: 'back'
                    },
                    {
                      url: selectedSubmission.selfieSignUrl,
                      label: 'Selfie avec signe',
                      type: 'selfie'
                    },
                    {
                      url: selectedSubmission.livenessVideoUrl,
                      label: 'Vidéo de vérification',
                      type: 'video'
                    }
                  ]}
                />

                {selectedSubmission.notes && (
                  <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-white/60 text-sm mb-2">Notes :</div>
                    <div className="text-white/80 text-sm">{selectedSubmission.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
