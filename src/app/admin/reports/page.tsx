'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Eye, User, MessageSquare, Image as ImageIcon, Ban, CheckCircle, XCircle, Clock } from 'lucide-react'
import { REPORT_TYPE_LABELS, REPORT_REASON_LABELS, REPORT_STATUS_LABELS, type ReportStatus, type ReportType } from '@/types/reports'
import ModerationActionsModal from '@/components/admin/reports/ModerationActionsModal'

interface ReportItem {
  id: string
  reportType: ReportType
  targetType: string
  targetId: string
  reason: string
  description?: string
  status: ReportStatus
  reporterEmail?: string
  reporterIp?: string
  createdAt: string
  target?: {
    name: string
    type: string
  }
}

interface ReportStats {
  total: number
  pending: number
  reviewing: number
  resolved: number
  dismissed: number
  escalated: number
}

interface AbusiveEntity {
  identifier: string
  type: 'email' | 'ip'
  count: number
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [abusiveEntities, setAbusiveEntities] = useState<AbusiveEntity[]>([])
  const [loading, setLoading] = useState(true)

  // Filtres
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'ALL'>('ALL')
  const [filterType, setFilterType] = useState<ReportType | 'ALL'>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Modal de modération
  const [moderationModal, setModerationModal] = useState<{ isOpen: boolean, report: ReportItem | null }>({ isOpen: false, report: null })

  useEffect(() => {
    fetchReports()
    fetchStats()
    fetchAbusiveEntities()
  }, [filterStatus, filterType])

  async function fetchReports() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filterStatus !== 'ALL' && { status: filterStatus }),
        ...(filterType !== 'ALL' && { type: filterType })
      })
      const res = await fetch(`/api/admin/reports?${params}`, {
        credentials: 'include' // ✅ Fix Chrome: transmettre les cookies httpOnly
      })
      const data = await res.json()
      if (data.success) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/reports/stats', {
        credentials: 'include' // ✅ Fix Chrome: transmettre les cookies httpOnly
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  async function fetchAbusiveEntities() {
    try {
      const res = await fetch('/api/admin/reports/abusive-entities', {
        credentials: 'include' // ✅ Fix Chrome: transmettre les cookies httpOnly
      })
      const data = await res.json()
      if (data.success) {
        setAbusiveEntities(data.entities)
      }
    } catch (error) {
      console.error('Error fetching abusive entities:', error)
    }
  }

  async function handleUpdateStatus(reportId: string, newStatus: ReportStatus) {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Fix Chrome: transmettre les cookies httpOnly
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        fetchReports()
        fetchStats()
        alert('Statut mis à jour')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  async function handleBlockEntity(identifier: string, type: 'email' | 'ip') {
    if (!confirm(`Voulez-vous bloquer ${type === 'email' ? "l'email" : "l'IP"} : ${identifier} ?`)) {
      return
    }

    try {
      const res = await fetch('/api/admin/reports/block-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Fix Chrome: transmettre les cookies httpOnly
        body: JSON.stringify({ identifier, type })
      })
      const data = await res.json()
      if (data.success) {
        alert(`${type === 'email' ? 'Email' : 'IP'} bloqué avec succès`)
        fetchAbusiveEntities()
      }
    } catch (error) {
      console.error('Error blocking entity:', error)
      alert('Erreur lors du blocage')
    }
  }

  // Pagination
  const totalPages = Math.ceil(reports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentReports = reports.slice(startIndex, startIndex + itemsPerPage)

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} className="text-yellow-400" />
      case 'REVIEWING': return <Eye size={16} className="text-blue-400" />
      case 'RESOLVED': return <CheckCircle size={16} className="text-green-400" />
      case 'DISMISSED': return <XCircle size={16} className="text-gray-400" />
      case 'ESCALATED': return <AlertTriangle size={16} className="text-red-400" />
      default: return <Clock size={16} className="text-gray-400" />
    }
  }

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'PROFILE': return <User size={16} />
      case 'MESSAGE': return <MessageSquare size={16} />
      case 'MEDIA': return <ImageIcon size={16} />
      case 'BEHAVIOR': return <AlertTriangle size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Signalements</h1>
        <p className="text-gray-400">
          {reports.length} signalement(s) · Page {currentPage} / {totalPages || 1}
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-5">
            <div className="text-blue-400 text-xs font-medium uppercase mb-2">Total</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-5">
            <div className="text-yellow-400 text-xs font-medium uppercase mb-2">En attente</div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-5">
            <div className="text-purple-400 text-xs font-medium uppercase mb-2">En cours</div>
            <div className="text-3xl font-bold text-white">{stats.reviewing}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-5">
            <div className="text-green-400 text-xs font-medium uppercase mb-2">Résolus</div>
            <div className="text-3xl font-bold text-white">{stats.resolved}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20 rounded-xl p-5">
            <div className="text-gray-400 text-xs font-medium uppercase mb-2">Rejetés</div>
            <div className="text-3xl font-bold text-white">{stats.dismissed}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-5">
            <div className="text-red-400 text-xs font-medium uppercase mb-2">Escaladés</div>
            <div className="text-3xl font-bold text-white">{stats.escalated}</div>
          </div>
        </div>
      )}

      {/* Abusive Entities */}
      {abusiveEntities.length > 0 && (
        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Comportements Suspects ({abusiveEntities.length})
          </h2>
          <div className="space-y-3">
            {abusiveEntities.slice(0, 5).map((entity) => (
              <div key={entity.identifier} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{entity.identifier}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                      {entity.count} signalement{entity.count > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Type: {entity.type === 'email' ? 'Email' : 'Adresse IP'}
                  </div>
                </div>
                <button
                  onClick={() => handleBlockEntity(entity.identifier, entity.type)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
                >
                  <Ban size={16} />
                  Bloquer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          {/* Filtre Statut */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === 'PENDING'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilterStatus('ESCALATED')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === 'ESCALATED'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Escaladés
            </button>
          </div>

          <div className="w-px bg-gray-700"></div>

          {/* Filtre Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterType === 'ALL'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Tous types
            </button>
            <button
              onClick={() => setFilterType('PROFILE')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterType === 'PROFILE'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Profils
            </button>
            <button
              onClick={() => setFilterType('MESSAGE')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterType === 'MESSAGE'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setFilterType('MEDIA')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterType === 'MEDIA'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Médias
            </button>
          </div>
        </div>
      </div>

      {/* Liste des signalements */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : currentReports.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucun signalement trouvé</div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {currentReports.map((report) => (
              <div key={report.id} className="p-6 hover:bg-gray-800/30 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icône du type */}
                  <div className={`p-3 rounded-lg ${
                    report.reportType === 'PROFILE' ? 'bg-blue-500/10 text-blue-400' :
                    report.reportType === 'MESSAGE' ? 'bg-green-500/10 text-green-400' :
                    report.reportType === 'MEDIA' ? 'bg-pink-500/10 text-pink-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {getTypeIcon(report.reportType)}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {REPORT_TYPE_LABELS[report.reportType]} signalé
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                            report.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            report.status === 'REVIEWING' ? 'bg-blue-500/20 text-blue-400' :
                            report.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                            report.status === 'DISMISSED' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {getStatusIcon(report.status)}
                            {REPORT_STATUS_LABELS[report.status]}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Raison: <span className="text-gray-300">{REPORT_REASON_LABELS[report.reason as keyof typeof REPORT_REASON_LABELS]}</span>
                        </div>
                        {report.description && (
                          <div className="mt-2 text-sm text-gray-400 italic">&quot;{report.description}&quot;</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Infos supplémentaires */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {report.reporterEmail && (
                        <span>Par: {report.reporterEmail}</span>
                      )}
                      {report.reporterIp && (
                        <span>IP: {report.reporterIp}</span>
                      )}
                      <span>Cible: {report.targetType} ({report.targetId.substring(0, 8)}...)</span>
                    </div>

                    {/* Actions */}
                    {report.status === 'PENDING' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setModerationModal({ isOpen: true, report })}
                          className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                        >
                          Examiner
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                          className="px-3 py-1.5 bg-gray-500/20 border border-gray-500/30 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all text-sm"
                        >
                          Rejeter
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'ESCALATED')}
                          className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                        >
                          Escalader
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === page
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Moderation Actions Modal */}
      {moderationModal.report && (
        <ModerationActionsModal
          isOpen={moderationModal.isOpen}
          onClose={() => setModerationModal({ isOpen: false, report: null })}
          report={{
            id: moderationModal.report.id,
            reportType: moderationModal.report.reportType,
            targetType: moderationModal.report.targetType,
            targetId: moderationModal.report.targetId,
            targetName: moderationModal.report.target?.name,
            reason: moderationModal.report.reason,
            description: moderationModal.report.description
          }}
          onActionComplete={() => {
            setModerationModal({ isOpen: false, report: null })
            fetchReports()
            fetchStats()
          }}
        />
      )}
    </div>
  )
}
