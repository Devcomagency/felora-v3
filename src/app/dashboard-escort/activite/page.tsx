"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

const TYPES = [
  { key: 'all', label: 'Tout' },
  { key: 'view', label: 'Vues' },
  { key: 'like', label: 'Réactions' },
  { key: 'message', label: 'Messages' },
  { key: 'reservation', label: 'Réservations' },
]

export default function ActivitePage() {
  const [type, setType] = useState<'all'|'view'|'like'|'message'|'reservation'>('all')
  const [page, setPage] = useState(1)
  const q = useQuery({
    queryKey: ['activity.list', type, page],
    queryFn: async () => {
      const r = await fetch(`/api/activity?type=${type}&page=${page}`, { cache: 'no-store' })
      if (!r.ok) throw new Error('activity_failed')
      return r.json() as Promise<{ items: Array<{ type:string, text:string, at:number }>, page:number, hasMore:boolean }>
    }
  })
  const items = q.data?.items || []

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Activité</h1>
        <p className="text-sm text-white/70">Flux des interactions récentes</p>
      </div>
      <div className="flex items-center gap-2 bg-gray-800/40 border border-gray-700/50 rounded-xl p-1 w-full md:w-auto">
        {TYPES.map(t => (
          <button key={t.key}
            onClick={() => { setType(t.key as any); setPage(1) }}
            className={`px-3 py-1.5 text-xs rounded-lg ${type===t.key?'bg-white/10 text-white':'text-white/70 hover:bg-white/5'}`}>{t.label}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10">
        {items.map((a,i) => (
          <div key={i} className="p-3 text-sm text-white/90 flex items-center justify-between">
            <span>{a.text}</span>
            <span className="text-xs text-white/60">{new Date(a.at).toLocaleString('fr-CH')}</span>
          </div>
        ))}
        {!items.length && !q.isLoading && (
          <div className="p-6 text-center text-white/60">Aucune activité</div>
        )}
        {q.isLoading && (
          <div className="p-6 text-center text-white/60">Chargement…</div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        <button disabled={page<=1} onClick={()=> setPage(p=> Math.max(1, p-1))} className={`px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 ${page<=1?'opacity-50 cursor-not-allowed':''}`}>Précédent</button>
        <button disabled={!q.data?.hasMore} onClick={()=> setPage(p=> p+1)} className={`px-3 py-1.5 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 ${!q.data?.hasMore?'opacity-50 cursor-not-allowed':''}`}>Suivant</button>
      </div>
    </div>
  )
}

