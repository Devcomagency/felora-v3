'use client'

import { useEffect, useState } from 'react'

type ChatReport = {
  id: string
  reporterUserId: string
  targetUserId: string
  conversationId?: string
  messageId?: string
  reason: string
  details?: string
  status: 'PENDING'|'REVIEWED'|'RESOLVED'
  createdAt: string
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ChatReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/reports/chat')
        if (!res.ok) throw new Error('load_failed')
        const data = await res.json()
        setReports(data.reports || [])
      } catch (e:any) {
        setError(e?.message || 'Erreur de chargement')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const updateStatus = async (id: string, status: 'PENDING'|'REVIEWED'|'RESOLVED') => {
    try {
      const res = await fetch('/api/admin/reports/chat/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      if (!res.ok) throw new Error('update_failed')
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {}
  }

  if (loading) return <div className="p-6 text-white">Chargement…</div>
  if (error) return <div className="p-6 text-red-400">{error}</div>

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Signalements (Chat)</h1>
      <div className="overflow-auto border border-white/10 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Reporter</th>
              <th className="text-left p-2">Ciblé</th>
              <th className="text-left p-2">Raison</th>
              <th className="text-left p-2">Détails</th>
              <th className="text-left p-2">Statut</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="p-2 text-white/80">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2 font-mono text-white/80">{r.reporterUserId}</td>
                <td className="p-2 font-mono text-white/80">{r.targetUserId}</td>
                <td className="p-2 text-white">{r.reason}</td>
                <td className="p-2 text-white/70 max-w-xs truncate" title={r.details}>{r.details}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${r.status==='PENDING'?'bg-yellow-500/20 text-yellow-300': r.status==='REVIEWED'?'bg-blue-500/20 text-blue-300':'bg-green-500/20 text-green-300'}`}>{r.status}</span>
                </td>
                <td className="p-2 space-x-2">
                  <button onClick={() => updateStatus(r.id, 'REVIEWED')} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15">Marquer reçu</button>
                  <button onClick={() => updateStatus(r.id, 'RESOLVED')} className="px-2 py-1 rounded bg-white/10 hover:bg-white/15">Résolu</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

