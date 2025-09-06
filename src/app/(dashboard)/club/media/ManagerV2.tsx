"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2, Video, Image as ImageIcon } from 'lucide-react'

type MediaItem = {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  visibility: 'PUBLIC' | 'PRIVATE'
  pos?: number | null
  createdAt?: string
}

export default function ClubMediaManagerV2(){
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clubs/media/my?page=1&pageSize=200', { cache:'no-store' })
      const d = await res.json()
      const all = Array.isArray(d?.items) ? d.items as MediaItem[] : []
      const onlyPublicBeyond = all
        .filter(m => (m.visibility || 'PUBLIC') === 'PUBLIC')
        .filter(m => (m.pos ?? 999) >= 4) // afficher uniquement à partir de la position 4
      setItems(onlyPublicBeyond)
      setSelection(new Set())
    } finally { setLoading(false) }
  }
  useEffect(()=>{ load() }, [])

  const onAddClick = () => inputRef.current?.click()
  const onFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
        // Comme Escort V2: on injecte une position haute par défaut pour ne pas toucher aux slots 0..3
        fd.append('position', '7')
        const r = await fetch('/api/clubs/media/upload', { method:'POST', body: fd })
        if (!r.ok) throw new Error('upload_failed')
      } catch {}
    }
    await load()
  }

  const toggleSelect = (id:string) => setSelection(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const remove = async (id:string) => {
    if (!confirm('Supprimer ce média ?')) return
    const r = await fetch(`/api/clubs/media/${id}`, { method:'DELETE' })
    if (r.ok) setItems(prev => prev.filter(x => x.id !== id))
  }

  const publicCount = items.length
  const sorted = useMemo(() => {
    return [...items].sort((a,b) => (a.pos ?? 999) - (b.pos ?? 999) || new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime())
  }, [items])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Gestion des Médias</h2>
          <p className="text-sm text-white/70">Organisez vos photos et vidéos publics</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">👁️ Publics: {publicCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAddClick} className="px-3 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white inline-flex items-center gap-2"><Plus size={16}/> Ajouter des médias</button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e=>onFilesPicked(e.target.files)} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map(m => (
          <div key={m.id} className="group rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <div className="relative aspect-square bg-black/40">
              {m.type==='VIDEO' ? (
                <video src={m.url} className="w-full h-full object-cover" muted playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="media" className="w-full h-full object-cover" />
              )}
              <div className="absolute top-2 left-2 flex items-center gap-1 text-xs">
                {m.type==='VIDEO' ? <Video size={16}/> : <ImageIcon size={16}/>} 
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={()=> remove(m.id)} className="px-2 py-1 rounded bg-black/50 hover:bg-black/60"><Trash2 size={14}/></button>
              </div>
              <label className="absolute bottom-2 left-2 inline-flex items-center gap-2 text-xs bg-black/40 px-2 py-1 rounded">
                <input type="checkbox" checked={selection.has(m.id)} onChange={()=> toggleSelect(m.id)} />
                <span>{new Date(m.createdAt||Date.now()).toLocaleDateString()}</span>
              </label>
            </div>
            <div className="p-2 text-xs text-white/70 flex items-center justify-between">
              <div>👁️ Public</div>
              <div className="text-white/40">{typeof m.pos==='number' ? `#${m.pos}` : ''}</div>
            </div>
          </div>
        ))}
        {sorted.length===0 && !loading && (
          <div className="col-span-full text-center text-white/60 py-10">Aucun média</div>
        )}
      </div>
    </div>
  )
}
