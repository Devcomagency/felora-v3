"use client"
import { useEffect, useState } from 'react'

type Item = {
  id: string
  userId: string
  role: string
  status: string
  updatedAt: string
  keys?: {
    selfieKey?: string
    selfieSignKey?: string
    docFrontKey?: string
    docBackKey?: string
    livenessKey?: string
  }
}

export default function AdminKycPage(){
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|undefined>()

  useEffect(() => {
    let stop = false
    ;(async () => {
      try {
        setLoading(true)
        const r = await fetch('/api/admin/kyc/submissions', { cache: 'no-store' })
        const d = await r.json()
        if (!r.ok) throw new Error(d?.error || 'load_failed')
        if (!stop) setItems(Array.isArray(d.items) ? d.items : [])
      } catch(e:any) {
        if (!stop) setError(e?.message || 'Erreur chargement')
      } finally { if (!stop) setLoading(false) }
    })()
    return () => { stop = true }
  }, [])

  const sign = async (key?: string) => {
    if (!key) return alert('Aucune clé')
    try {
      const r = await fetch('/api/admin/kyc/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, expiresInSeconds: 1800 }) })
      const d = await r.json()
      if (!r.ok || !d?.url) throw new Error(d?.error || 'sign_failed')
      window.open(d.url, '_blank')
    } catch (e:any) {
      alert(e?.message || 'Signature échouée')
    }
  }
  const setStatus = async (id: string, status: 'PENDING'|'APPROVED'|'REJECTED') => {
    try {
      const r = await fetch('/api/admin/kyc/update', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id, status }) })
      const d = await r.json()
      if (!r.ok || !d?.ok) throw new Error(d?.error || 'update_failed')
      setItems(prev => prev.map(it => it.id === id ? { ...it, status } : it))
    } catch (e:any) {
      alert(e?.message || 'Mise à jour échouée')
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">KYC — Soumissions</h1>
      {loading && <div className="text-white/70">Chargement…</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !items.length && <div className="text-white/70">Aucune soumission</div>}
      {!!items.length && (
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/80">{it.id} · <span className="text-white/60">user:</span> {it.userId} · <span className="text-white/60">rôle:</span> {it.role} · <span className="text-white/60">statut:</span> {it.status}</div>
                <div className="text-xs text-white/60">{new Date(it.updatedAt).toLocaleString('fr-CH')}</div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-xs text-white/70">Actions:</div>
                <button onClick={()=> setStatus(it.id, 'APPROVED')} className="text-xs px-2 py-1 rounded bg-emerald-600/70 hover:bg-emerald-600">Approuver</button>
                <button onClick={()=> setStatus(it.id, 'REJECTED')} className="text-xs px-2 py-1 rounded bg-red-600/70 hover:bg-red-600">Refuser</button>
                <button onClick={()=> setStatus(it.id, 'PENDING')} className="text-xs px-2 py-1 rounded bg-yellow-600/70 hover:bg-yellow-600">Remettre en attente</button>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {([
                  ['Selfie', it.keys?.selfieKey],
                  ['Selfie signé', it.keys?.selfieSignKey],
                  ['Recto ID', it.keys?.docFrontKey],
                  ['Verso ID', it.keys?.docBackKey],
                  ['Liveness', it.keys?.livenessKey],
                ] as const).map(([label, key]) => (
                  <div key={label} className="p-2 rounded-lg bg-black/40 border border-white/10">
                    <div className="text-xs text-white/60">{label}</div>
                    <div className="text-xs break-all">{key || '—'}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <button disabled={!key} onClick={()=> sign(key)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15 disabled:opacity-50">Signer & ouvrir</button>
                      <button disabled={!key} onClick={()=> { try { navigator.clipboard.writeText(String(key)) } catch {} }} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15 disabled:opacity-50">Copier</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
