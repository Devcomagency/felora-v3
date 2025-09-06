"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'

type Club = {
  name?: string
  description?: string
  address?: string
  openingHours?: string
  isActive?: boolean
}

export default function ClubHeader() {
  const [loading, setLoading] = useState(true)
  const [club, setClub] = useState<Club>({})
  const [mediaCount, setMediaCount] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [saving, startSaving] = useTransition()

  const requiredInfo = useMemo(() => {
    const fields = [club.name, club.description, club.address, club.openingHours]
    const done = fields.filter(v => String(v||'').trim().length>0).length
    const missing: string[] = []
    if (!club.name) missing.push('Nom')
    if (!club.description) missing.push('Description')
    if (!club.address) missing.push('Adresse')
    if (!club.openingHours) missing.push('Horaires')
    return { done, missing }
  }, [club])

  const requiredMedia = useMemo(() => ({
    // We compute from /api/clubs/media/my summary via positions
    // Expect pos 0=image, 1=video, 2=image, 3=image
    ok: mediaCount >= 4,
    done: Math.min(4, mediaCount),
  }), [mediaCount])

  const pct = useMemo(() => {
    // 50% infos + 50% médias
    const infoPct = (requiredInfo.done/4) * 50
    const mediaPct = (requiredMedia.done/4) * 50
    return Math.round(infoPct + mediaPct)
  }, [requiredInfo.done, requiredMedia.done])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const r = await fetch('/api/clubs/profile/me', { cache:'no-store' })
        const d = await r.json()
        if (!cancelled && d?.club) {
          setClub(d.club)
          setIsActive(!!d.club.isActive)
        }
        const rm = await fetch('/api/clubs/media/my?page=1&pageSize=50', { cache:'no-store' })
        const dm = await rm.json()
        const items: Array<{ pos?: number|null; type:'IMAGE'|'VIDEO' }> = Array.isArray(dm?.items) ? dm.items : []
        const byPos = new Map<number, { type:'IMAGE'|'VIDEO' }>()
        for (const m of items) if (typeof m.pos === 'number') byPos.set(m.pos!, { type: (m as any).type })
        const okProfile = byPos.get(0)?.type === 'IMAGE'
        const okVideo = byPos.get(1)?.type === 'VIDEO'
        const okPhoto1 = byPos.get(2)?.type === 'IMAGE'
        const okPhoto2 = byPos.get(3)?.type === 'IMAGE'
        const count = [okProfile, okVideo, okPhoto1, okPhoto2].filter(Boolean).length
        if (!cancelled) setMediaCount(count)
      } finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [])

  const toggleActive = () => {
    startSaving(async () => {
      try {
        const res = await fetch('/api/clubs/profile/update', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ isActive: !isActive }) })
        const j = await res.json()
        if (!res.ok || !j?.ok) throw new Error('update_failed')
        setIsActive(v => !v)
      } catch {}
    })
  }

  const requestSave = () => {
    try { window.dispatchEvent(new CustomEvent('club:save')) } catch {}
  }

  return (
    <div className="sticky top-[52px] z-30 bg-black/70 backdrop-blur border border-white/10 rounded-xl px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${isActive ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-gray-500/15 text-gray-300 border-gray-500/30'}`}>
            {loading ? '…' : isActive ? 'Actif' : 'Inactif'}
          </div>
          {/* Progress bar */}
          <div className="w-40 sm:w-48 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-white/70 text-xs">{pct}%</div>
          {/* Pills des manquants (infos) */}
          {requiredInfo.missing.map((m) => (
            <span key={m} className="px-2 py-1 rounded-lg text-xs bg-yellow-500/15 text-yellow-200 border border-yellow-500/30">{m}</span>
          ))}
          {requiredMedia.done < 4 && (
            <span className="px-2 py-1 rounded-lg text-xs bg-yellow-500/15 text-yellow-200 border border-yellow-500/30">Médias {requiredMedia.done}/4</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <>
              <button
                onClick={toggleActive}
                disabled={saving}
                className="px-3 py-2 rounded-lg border border-white/12 text-white/90 hover:bg-white/10"
              >
                {saving ? '…' : 'Mettre en pause'}
              </button>
              <button
                onClick={requestSave}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg"
              >
                Enregistrer
              </button>
            </>
          ) : (
            <button onClick={toggleActive} disabled={saving} className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg">
              {saving ? '…' : 'Activer mon compte'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
