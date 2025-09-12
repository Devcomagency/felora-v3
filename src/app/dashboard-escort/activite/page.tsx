"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

const TYPES = [
  { key: 'all', label: 'Tout' },
  { key: 'view', label: 'Vues' },
  { key: 'like', label: 'Réactions' },
  { key: 'message', label: 'Messages' },
  { key: 'reservation', label: 'Réservations' },
]

// Old activity page (V3 original)
function OldActivitePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Activité (Version Originale)</h1>
        <p className="text-gray-400">Cette page utilise l'ancienne interface V3</p>
      </div>
    </div>
  )
}

// New activity page (V2 design)
function NewActivitePage() {
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
    <div 
      className="space-y-4 rounded-2xl p-6"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div>
        <h1 
          className="text-2xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Activité
        </h1>
        <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
          Flux des interactions récentes
        </p>
      </div>
      <div 
        className="flex items-center gap-2 rounded-xl p-1 w-full md:w-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {TYPES.map(t => (
          <button 
            key={t.key}
            onClick={() => { setType(t.key as any); setPage(1) }}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              type===t.key ? 'text-white' : 'text-white/70 hover:bg-white/5'
            }`}
            style={type===t.key ? {
              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
              boxShadow: '0 2px 8px rgba(255, 107, 157, 0.3)'
            } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div 
        className="rounded-2xl divide-y"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {items.map((a,i) => (
          <div 
            key={i} 
            className="p-3 text-sm flex items-center justify-between hover:bg-white/5 transition-colors"
            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            <span style={{ color: 'var(--felora-silver-90)' }}>{a.text}</span>
            <span className="text-xs" style={{ color: 'var(--felora-silver-60)' }}>
              {new Date(a.at).toLocaleString('fr-CH')}
            </span>
          </div>
        ))}
        {!items.length && !q.isLoading && (
          <div className="p-6 text-center" style={{ color: 'var(--felora-silver-60)' }}>
            Aucune activité
          </div>
        )}
        {q.isLoading && (
          <div className="p-6 text-center" style={{ color: 'var(--felora-silver-60)' }}>
            Chargement…
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-2">
        <button 
          disabled={page<=1} 
          onClick={()=> setPage(p=> Math.max(1, p-1))} 
          className={`px-3 py-1.5 rounded-lg text-white/80 hover:bg-white/10 transition-colors ${
            page<=1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: page<=1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Précédent
        </button>
        <button 
          disabled={!q.data?.hasMore} 
          onClick={()=> setPage(p=> p+1)} 
          className={`px-3 py-1.5 rounded-lg text-white/80 hover:bg-white/10 transition-colors ${
            !q.data?.hasMore ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: !q.data?.hasMore ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}

export default function ActivitePage() {
  const isNewActiviteEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_DASHBOARD_ESCORT_ACTIVITE')
  
  if (isNewActiviteEnabled) {
    return <NewActivitePage />
  }
  
  return <OldActivitePage />
}