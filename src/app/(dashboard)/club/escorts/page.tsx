"use client"

import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

type EscortCard = { id: string; name: string; city?: string; avatar?: string }

export default function ClubEscortsPage() {
  const [clubHandle, setClubHandle] = useState<string>('')
  const [escorts, setEscorts] = useState<EscortCard[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const me = await fetch('/api/clubs/profile/me').then(r => r.json()).catch(() => ({}))
        const handle = me?.club?.handle || 'club-luxe-geneva'
        setClubHandle(handle)
        const list = await fetch(`/api/profile-test/club/${handle}/escorts`).then(r => r.json()).catch(() => ({ escorts: [] }))
        setEscorts(Array.isArray(list?.escorts) ? list.escorts : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return escorts
    return escorts.filter(e => e.name.toLowerCase().includes(term) || (e.city||'').toLowerCase().includes(term))
  }, [escorts, q])

  return (
    <DashboardLayout title="Mes Escorts" subtitle="Gestion des profils rattachés au club">
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="flex items-center justify-between gap-3 mb-4">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Rechercher par nom ou ville…"
            className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <div className="text-sm text-gray-400">Club: <span className="text-gray-200">{clubHandle || '—'}</span></div>
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm">Chargement…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filtered.map(e => (
              <div key={e.id} className="rounded-xl overflow-hidden bg-gray-900/60 border border-gray-800">
                <div className="aspect-square bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.avatar || 'https://placehold.co/400x400?text=Escort'} alt={e.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3">
                  <div className="text-white font-medium text-sm">{e.name}</div>
                  <div className="text-gray-400 text-xs">{e.city || '—'}</div>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <div className="col-span-full text-center text-gray-400 text-sm">Aucune escorte trouvée</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
