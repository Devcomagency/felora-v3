"use client"
import { useEffect, useState } from 'react'

type Entry = { t: string; label: string; data?: any }

export default function DebugBanner() {
  const [enabled, setEnabled] = useState(false)
  const [logs, setLogs] = useState<Entry[]>([])
  const add = (label: string, data?: any) => setLogs(prev => [...prev.slice(-49), { t: new Date().toISOString(), label, data }])

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('debug') === '1') setEnabled(true)
    } catch {}
  }, [])

  useEffect(() => {
    if (!enabled) return
    ;(async () => {
      try {
        const r1 = await fetch('/api/escort/profile/health', { credentials: 'include', cache: 'no-store' })
        const j1 = await r1.json().catch(()=>({}))
        add('GET /api/escort/profile/health', { ok: r1.ok, status: r1.status, body: j1 })
      } catch (e:any) {
        add('GET /api/escort/profile/health error', { message: e?.message })
      }
      try {
        const r2 = await fetch('/api/escort/profile/status', { credentials: 'include', cache: 'no-store' })
        const j2 = await r2.json().catch(()=>({}))
        add('GET /api/escort/profile/status', { ok: r2.ok, status: r2.status, body: j2 })
      } catch (e:any) {
        add('GET /api/escort/profile/status error', { message: e?.message })
      }
    })()
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="sticky top-0 z-[60]">
      <div className="mx-auto max-w-6xl px-4 py-2 my-2 rounded-xl border border-amber-400 bg-amber-900/30 text-amber-100 text-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="font-semibold">DEBUG (temporaire) — ajouter ?debug=1 à l’URL</div>
          <div className="space-x-2">
            <a href="/api/escort/profile/health" target="_blank" rel="noreferrer" className="underline">health</a>
            <button onClick={()=>setLogs([])} className="px-2 py-0.5 border border-amber-300/50 rounded">Clear</button>
          </div>
        </div>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap">{JSON.stringify(logs, null, 2)}</pre>
      </div>
    </div>
  )
}

