"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

type MediaItem = {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  visibility: 'PUBLIC' | 'PRIVATE'
  pos?: number | null
  createdAt?: string
}

export default function ClubMediaManager() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [refreshing, startRefresh] = useTransition()

  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState<'IMAGE'|'VIDEO'>('IMAGE')
  const [newIsProfile, setNewIsProfile] = useState(false)
  // Suppression du toggle "Publier dans le feed" selon demande
  const [uploading, startUploading] = useTransition()
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [total, setTotal] = useState(0)
  const hasMore = (page * pageSize) < total
  const dragIdRef = useRef<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/clubs/media/my?page=1&pageSize=${pageSize}`)
      const data = await res.json()
      setTotal(Number(data?.total || 0))
      setItems(Array.isArray(data?.items) ? data.items : [])
      setPage(1)
    } catch (e) {
      setErr('Erreur de chargement des médias')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const doRefresh = () => startRefresh(async () => { await load() })

  const loadMore = async () => {
    try {
      const next = page + 1
      const res = await fetch(`/api/clubs/media/my?page=${next}&pageSize=${pageSize}`)
      const data = await res.json()
      const more = Array.isArray(data?.items) ? data.items : []
      setItems(prev => [...prev, ...more])
      setPage(next)
      setTotal(Number(data?.total || total))
    } catch {}
  }

  const onAdd = () => {
    if (!newUrl.trim()) return
    setErr(null)
    startUploading(async () => {
      try {
        const urls = newUrl.split(/\n|,|\s+/).map(u => u.trim()).filter(Boolean)
        const itemsPayload = urls.map((u, idx) => ({ type: newType, url: u, isProfile: newIsProfile && idx === 0 }))
        const res = await fetch('/api/clubs/media/commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsPayload })
        })
        const j = await res.json()
        if (!res.ok || !j?.ok) throw new Error(j?.error || 'upload_failed')
        setNewUrl('')
        setNewIsProfile(false)
        
        doRefresh()
      } catch (e) {
        setErr('Échec de l’ajout')
      }
    })
  }

  const patchMedia = async (id: string, body: any) => {
    const res = await fetch(`/api/clubs/media/${id}`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
    return res.ok
  }

  const onToggleVisibility = async (m: MediaItem) => {
    const ok = await patchMedia(m.id, { status: m.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC' })
    if (ok) doRefresh()
  }

  const onMove = async (m: MediaItem, dir: 'up'|'down') => {
    const current = typeof m.pos === 'number' ? m.pos : 999
    const next = Math.max(0, current + (dir === 'up' ? -1 : 1))
    const ok = await patchMedia(m.id, { position: next })
    if (ok) doRefresh()
  }

  const onMakeProfile = async (m: MediaItem) => {
    const ok = await patchMedia(m.id, { position: 0 })
    if (ok) doRefresh()
  }

  const sorted = useMemo(() => {
    return [...items].sort((a,b) => (a.pos ?? 999) - (b.pos ?? 999) || new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())
  }, [items])

  const eligibility = useMemo(() => {
    const byPos = new Map<number, MediaItem>()
    for (const m of sorted) if (typeof m.pos === 'number') byPos.set(m.pos, m)
    const profile = byPos.get(0)
    const video = byPos.get(1)
    const photo2 = byPos.get(2)
    const photo3 = byPos.get(3)
    const okProfile = !!profile && profile.type === 'IMAGE'
    const okVideo = !!video && video.type === 'VIDEO'
    const okPhoto2 = !!photo2 && photo2.type === 'IMAGE'
    const okPhoto3 = !!photo3 && photo3.type === 'IMAGE'
    const count = [okProfile, okVideo, okPhoto2, okPhoto3].filter(Boolean).length
    const missing: string[] = []
    if (!okProfile) missing.push('Photo de profil')
    if (!okVideo) missing.push('Vidéo')
    if (!okPhoto2) missing.push('Photo 1')
    if (!okPhoto3) missing.push('Photo 2')
    return { count, ok: count===4, missing, byPos }
  }, [sorted])

  // Ref vers la zone d'ajout pour "slots requis"
  const addBoxRef = useRef<HTMLTextAreaElement | null>(null)

  const focusAddBox = () => {
    try { addBoxRef.current?.focus() } catch {}
  }

  // Slots requis (mise en page type Escort obligatoire)
  const requiredSlots = useMemo(() => {
    const profile = eligibility.byPos.get(0)
    const video = eligibility.byPos.get(1)
    const photo1 = eligibility.byPos.get(2)
    const photo2 = eligibility.byPos.get(3)
    return [
      { key: 'profile', slotIndex: 0, title: 'Photo de profil', want: 'IMAGE', filled: !!profile, media: profile },
      { key: 'video', slotIndex: 1, title: 'Vidéo', want: 'VIDEO', filled: !!video, media: video },
      { key: 'photo1', slotIndex: 2, title: 'Photo 1', want: 'IMAGE', filled: !!photo1, media: photo1 },
      { key: 'photo2', slotIndex: 3, title: 'Photo 2', want: 'IMAGE', filled: !!photo2, media: photo2 },
    ] as Array<{ key:string; slotIndex:number; title:string; want:'IMAGE'|'VIDEO'; filled:boolean; media?: MediaItem }>
  }, [eligibility])

  return (
    <div className="grid gap-6">
      {/* Bloc requis: style identique Escort */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">Médias - 4 Positions Fixes</h2>
          <p className="text-gray-400 text-sm">Ordre requis: 1) Profil, 2) Vidéo, 3) Photo, 4) Photo. Sauvegarde immédiate après upload.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {requiredSlots.map((s) => (
            <div key={s.key} className="rounded-xl border border-gray-700 p-3 space-y-2 bg-gray-900/40">
              <div className="text-xs text-gray-400">{s.title}</div>
              <div className={`aspect-[4/3] rounded-lg overflow-hidden flex items-center justify-center ${s.filled ? 'bg-black/30' : 'bg-gray-800'}`}>
                {s.filled ? (
                  s.media!.type === 'VIDEO' ? (
                    <div className="p-3 text-center text-gray-300 text-xs">
                      Vidéo
                      <div className="mt-1 break-all opacity-70">{s.media!.url}</div>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.media!.url} alt={s.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="text-xs text-gray-400">Aucun média</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] ${s.filled ? 'text-emerald-300' : 'text-amber-300'}`}>{s.filled ? 'OK' : 'Requis'}</span>
                <label className="text-[11px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 cursor-pointer">
                  <input
                    type="file"
                    accept={s.want === 'VIDEO' ? 'video/*' : 'image/*'}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      e.currentTarget.value = ''
                      if (!file) return
                      const fd = new FormData()
                      fd.append('file', file)
                      fd.append('slot', s.key === 'profile' ? 'profile' : s.want === 'VIDEO' ? 'video' : 'photo')
                      fd.append('slotIndex', String(s.slotIndex))
                      try {
                        const res = await fetch('/api/clubs/media/upload', { method:'POST', body: fd })
                        if (res.ok) doRefresh()
                      } catch {}
                    }}
                  />
                  {s.filled ? 'Remplacer' : 'Ajouter'}
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">Astuce: la sauvegarde est immédiate, pas de bouton “Sauvegarder”.</div>
      </div>

      {/* (Section ajout par URL supprimée pour coller au UX Escort) */}

      {/* Liste des médias supprimée sur Mon Profil (gérée via /club/media) */}
    </div>
  )
}
