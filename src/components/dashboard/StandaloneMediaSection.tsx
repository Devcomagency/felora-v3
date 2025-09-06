'use client'
import { useEffect, useRef, useState } from 'react'

type SlotIndex = 0|1|2|3|4|5
type SlotItem = { slot: SlotIndex, url: string, type: 'image'|'video', isPrivate?: boolean }

const SLOT_LABELS = ['Photo profil', 'Vidéo 1', 'Image 1', 'Vidéo 2', 'Image 2', 'Image 3']

function ensureSix(slots: any): SlotItem[] {
  // Le backend renvoie déjà 6, mais on sécurise
  const defaults: SlotItem[] = [
    { slot:0, url:'', type:'image' },
    { slot:1, url:'', type:'video' },
    { slot:2, url:'', type:'image' },
    { slot:3, url:'', type:'video' },
    { slot:4, url:'', type:'image' },
    { slot:5, url:'', type:'image' },
  ]
  try {
    const arr = Array.isArray(slots) ? slots : JSON.parse(slots || '[]')
    for (const it of arr) {
      const i = Number(it?.slot)
      if (i>=0 && i<=5) defaults[i] = {
        slot: i as SlotIndex,
        url: String(it?.url||''),
        type: it?.type === 'video' ? 'video' : 'image',
        isPrivate: Boolean(it?.isPrivate),
      }
    }
  } catch {/* ignore */}
  return defaults
}

interface StandaloneMediaSectionProps {
  userId?: string
  initialData?: any
}

export default function StandaloneMediaSection({ userId, initialData }: StandaloneMediaSectionProps) {
  const [slots, setSlots] = useState<SlotItem[]>(() => ensureSix(null))
  const [loading, setLoading] = useState(true)
  const [savingSlot, setSavingSlot] = useState<number|null>(null)
  const fileInputs = useRef<(HTMLInputElement|null)[]>([])

  // Chargement serveur
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        // On utilise le profil qui contient galleryPhotos
        const res = await fetch('/api/escort/profile', { cache:'no-store' })
        const json = await res.json()
        const profile = json?.success ? json.profile : json
        const normalized = ensureSix(profile?.galleryPhotos)
        if (!cancelled) setSlots(normalized)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [userId])

  const pickFor = (i: SlotIndex) => fileInputs.current[i]?.click()

  const onFileChange = async (i: SlotIndex, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset input pour pouvoir re-sélectionner le même fichier après
    if (!file) return
    setSavingSlot(i)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('slot', String(i))
      // Tu peux aussi exposer un toggle "privé/public" dans l'UI:
      form.append('isPrivate', 'false')

      const res = await fetch('/api/escort/media/upload', {
        method: 'POST',
        body: form,
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        alert(json?.error || 'Échec upload')
        return
      }
      // MAJ immédiate depuis la réponse (pas de refetch, pas de localStorage)
      if (Array.isArray(json.slots)) {
        setSlots(ensureSix(json.slots))
      } else {
        // fallback local si jamais
        setSlots(prev => {
          const next = [...prev]
          next[i] = {
            slot: i,
            url: String(json.url || ''),
            type: json.type === 'video' ? 'video' : 'image',
          }
          return next
        })
      }
    } finally {
      setSavingSlot(null)
    }
  }

  const SlotCard = ({ i }: { i: SlotIndex }) => {
    const it = slots[i]
    const wantVideo = (i === 1 || i === 3)
    return (
      <div className="rounded-xl border border-gray-700 p-3 space-y-2">
        <div className="text-xs text-gray-400">{SLOT_LABELS[i]} (slot {i})</div>
        <div className="aspect-[4/3] bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
          {it.url ? (
            it.type === 'video' ? (
              <video src={it.url} controls className="w-full h-full object-cover" />
            ) : (
              <img src={it.url} alt={`slot-${i}`} className="w-full h-full object-cover" />
            )
          ) : (
            <div className="text-xs text-gray-400">Aucun média</div>
          )}
        </div>
        {wantVideo && it.url && it.type !== 'video' && (
          <div className="text-[11px] text-amber-300">
            ⚠️ Slot vidéo attendu, contenu actuel: {it.type} (accepté).
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => pickFor(i)}
            className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded"
            disabled={savingSlot !== null}
          >
            {savingSlot === i ? 'Envoi…' : it.url ? 'Remplacer' : 'Ajouter'}
          </button>
          <input
            ref={el => (fileInputs.current[i] = el)}
            type="file"
            accept={wantVideo ? 'video/*,image/*' : 'image/*,video/*'}
            className="hidden"
            onChange={(e) => onFileChange(i, e)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-3">Médias - 6 Positions Fixes</h2>
        <p className="text-gray-400 text-sm">
          Ces 6 positions correspondent aux 6 premières cases de votre profil public. Elles sont fixes et s'affichent toujours dans le feed.
        </p>
      </div>
      
      {loading ? (
        <div className="text-sm text-gray-400">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SlotCard i={0} />
          <SlotCard i={1} />
          <SlotCard i={2} />
          <SlotCard i={3} />
          <SlotCard i={4} />
          <SlotCard i={5} />
        </div>
      )}
      <div className="text-xs text-gray-500">
        Astuce: la sauvegarde des slots est **immédiate** après upload (appel API), il n'y a pas de bouton "Sauvegarder" ici — donc **pas de reset**.
      </div>
    </div>
  )
}