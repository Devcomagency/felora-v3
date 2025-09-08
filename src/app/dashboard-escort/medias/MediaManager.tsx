'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Edit3, Eye, Lock, Video, Image as ImageIcon, GripVertical, Loader } from 'lucide-react'
import { VideoCompressor } from '@/lib/video-compression'

type MediaItem = {
  id: string
  type: 'IMAGE' | 'VIDEO'
  url: string
  visibility: 'PUBLIC' | 'PRIVATE'
  position?: number
  createdAt?: string
}

export default function MediaManager() {
  const [active, setActive] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [counts, setCounts] = useState({ PUBLIC: 0, PRIVATE: 0 })
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [compressing, setCompressing] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      // Ensure escort profile exists for uploads
      try {
        const me = await fetch('/api/me/escort-profile', { cache:'no-store', credentials:'include' }).then(r=>r.json()).catch(()=>({hasEscortProfile:false}))
        if (!me?.hasEscortProfile) {
          await fetch('/api/escort/profile/init', { method:'POST', credentials:'include' })
        }
      } catch {}
      
      console.log(`🔍 Chargement des médias pour onglet: ${active}`)
      
      const [pub, pri] = await Promise.all([
        fetch('/api/media/my?visibility=PUBLIC', { cache:'no-store', credentials:'include' }).then(r=>r.json()).catch(()=>({items:[]})),
        fetch('/api/media/my?visibility=PRIVATE', { cache:'no-store', credentials:'include' }).then(r=>r.json()).catch(()=>({items:[]})),
      ])
      
      console.log(`📊 Médias reçus:`)
      console.log(`- PUBLIC: ${pub.items?.length||0} médias`, pub.items)
      console.log(`- PRIVATE: ${pri.items?.length||0} médias`, pri.items)
      
      setCounts({ PUBLIC: pub.items?.length||0, PRIVATE: pri.items?.length||0 })
      const current = active === 'PUBLIC' ? pub : pri
      
      console.log(`📋 Affichage onglet ${active}: ${current.items?.length||0} médias`, current.items)
      
      setItems(current.items || [])
      setSelection(new Set())
    } finally { setLoading(false) }
  }

  useEffect(()=>{ load() }, [active])

  const onAddClick = () => inputRef.current?.click()
  const onFilesPicked = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      console.log('❌ Aucun fichier sélectionné')
      return
    }
    
    console.log(`📁 ${files.length} fichier(s) sélectionné(s)`)
    
    for (const file of Array.from(files)) {
      console.log(`📤 Upload: ${file.name} (${file.type}, ${file.size} bytes)`)
      const fileId = `${file.name}-${Date.now()}`
      
      try {
        let processedFile = file
        
        // Compression vidéo si nécessaire
        if (file.type.startsWith('video/') && file.size > 4 * 1024 * 1024) {
          setCompressing(fileId)
          toast.info(`Compression de la vidéo ${file.name}...`)
          
          const compressor = new VideoCompressor()
          processedFile = await compressor.compress(file, {
            quality: 0.8,
            maxSizeMB: 3.5, // Laisser un peu de marge sous 4MB
            onProgress: (progress) => {
              setUploadProgress(prev => ({ ...prev, [fileId]: progress * 100 }))
            }
          })
          
          setCompressing(null)
          console.log(`🎥 Vidéo compressée: ${file.size} → ${processedFile.size} bytes`)
        }
        
        const fd = new FormData()
        fd.append('file', processedFile)
        fd.append('type', processedFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
        fd.append('visibility', active)
        if (active === 'PUBLIC') fd.append('position', '7')
        
        console.log(`🚀 Envoi vers /api/media/upload...`)
        console.log(`📤 Visibilité envoyée: ${active}`)
        console.log(`📝 FormData:`, {
          file: processedFile.name,
          type: processedFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          visibility: active,
          position: active === 'PUBLIC' ? '7' : undefined,
          size: processedFile.size
        })
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))
        
        const r = await fetch('/api/media/upload', { 
          method:'POST', 
          body: fd, 
          credentials:'include' 
        })
        
        console.log(`📥 Réponse: ${r.status} ${r.statusText}`)
        
        const d = await r.json().catch((e)=>{
          console.log('❌ Erreur parse JSON:', e)
          return {}
        })
        
        console.log('📋 Données reçues:', d)
        
        if (!r.ok || !d?.mediaId) {
          console.log('❌ Upload échoué:', d?.error || 'upload_failed')
          throw new Error(d?.error || 'upload_failed')
        }
        
        console.log('✅ Upload réussi:', d.mediaId)
        toast.success('Média ajouté avec succès')
      } catch (e:any) {
        console.log('💥 Erreur upload complète:', e)
        toast.error(`Erreur upload: ${e.message}`)
      } finally {
        // Nettoyer les états
        setUploadProgress(prev => {
          const next = { ...prev }
          delete next[fileId]
          return next
        })
        if (compressing === fileId) {
          setCompressing(null)
        }
      }
    }
    
    console.log('🔄 Rechargement des médias...')
    await load()
  }

  const toggleSelect = (id:string) => setSelection(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const batchChangeVisibility = async (visibility: 'PUBLIC'|'PRIVATE') => {
    try {
      await Promise.all(Array.from(selection).map(async id => {
        const r = await fetch(`/api/media/${id}/visibility`, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ visibility })})
        if (!r.ok) throw new Error()
      }))
      toast.success('Visibilité mise à jour')
      await load()
    } catch { toast.error('Action échouée') }
  }

  const remove = async (id:string) => {
    if (!confirm('Supprimer ce média ?')) return
    try {
      const r = await fetch(`/api/media/${id}/delete`, { method: 'DELETE', credentials:'include' })
      if (!r.ok) throw new Error()
      setItems(prev => prev.filter(x => x.id !== id))
      toast.success('Média supprimé')
    } catch { toast.error('Suppression échouée') }
  }

  const filtered = items

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-white">Gestion des Médias</h1>
          <p className="text-sm text-white/70">Organisez vos photos et vidéos selon leur visibilité</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">👁️ Publics: {counts.PUBLIC}</span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">🔒 Privés: {counts.PRIVATE}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80">Revenus ce mois: 2 840 ♦</div>
          <button 
            onClick={onAddClick} 
            disabled={!!compressing}
            className="px-3 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white inline-flex items-center gap-2"
          >
            {compressing ? (
              <>
                <Loader size={16} className="animate-spin" />
                Compression...
              </>
            ) : (
              <>
                <Plus size={16} />
                Ajouter des médias
              </>
            )}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e=>onFilesPicked(e.target.files)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 text-sm">
        {(['PUBLIC','PRIVATE'] as const).map(key => (
          <button key={key} onClick={()=> setActive(key)} className={`px-3 py-1.5 rounded-lg border ${active===key ? 'border-pink-500 text-pink-300 bg-pink-500/10' : 'border-white/10 text-white/70 hover:bg-white/5'}`}>
            {key==='PUBLIC' ? '👁️ Publics' : '🔒 Privés'} ({counts[key] as number})
          </button>
        ))}
      </div>

      {/* Batch bar */}
      {selection.size>0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className="text-sm text-white/80">{selection.size} sélectionné(s)</div>
          <button onClick={()=> batchChangeVisibility('PUBLIC')} className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/10">Rendre public</button>
          <button onClick={()=> batchChangeVisibility('PRIVATE')} className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/10">Mettre privé</button>
      </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="group rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <div className="relative aspect-square bg-black/40">
              {m.type==='VIDEO' ? (
                <video src={m.url} className="w-full h-full object-cover" muted playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="media" className="w-full h-full object-cover" loading="lazy" />
              )}
              <div className="absolute top-2 left-2 flex items-center gap-1 text-xs">
                {m.type==='VIDEO' ? <Video size={16}/> : <ImageIcon size={16}/>} 
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={()=> remove(m.id)} className="px-2 py-1 rounded bg-black/50 hover:bg-black/60"><Trash2 size={14}/></button>
              </div>
              <label className="absolute bottom-2 left-2 inline-flex items-center gap-2 text-xs bg-black/40 px-2 py-1 rounded">
                <input type="checkbox" checked={selection.has(m.id)} onChange={()=> toggleSelect(m.id)} />
                <span>{new Date(m.createdAt||Date.now()).toLocaleDateString()}</span>
              </label>
            </div>
            <div className="p-2 text-xs text-white/70 flex items-center justify-between">
              <div>{m.visibility==='PUBLIC' ? '👁️ Public' : '🔒 Privé'}</div>
              <div className="text-white/40">{m.position ? `#${m.position}` : ''}</div>
            </div>
          </div>
        ))}
        {filtered.length===0 && !loading && (
          <div className="col-span-full text-center text-white/60 py-10">Aucun média</div>
        )}
      </div>
    </div>
  )
}
