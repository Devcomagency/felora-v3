"use client"
import React, { memo, useState } from 'react'
import { Flame } from 'lucide-react'
import useReactions from '@/hooks/useReactions'

type Props = { mediaId: string; userId?: string|null; onChange?: () => void }

function ReactionBarBase({ mediaId, userId, onChange }: Props) {
  const res = useReactions(mediaId, userId ?? null)
  const stats = res?.stats || { reactions: {}, total: 0 }
  const loading = res?.loading || false
  const error = res?.error || null
  const toggleReaction = res?.toggleReaction || (async () => {})
  const [open, setOpen] = useState(false)

  const total = stats?.total ?? 0

  const react = async (type: 'LOVE'|'FIRE'|'WOW'|'SMILE') => {
    await toggleReaction(type)
    try { onChange && onChange() } catch {}
    setOpen(false)
  }

  return (
    <div className="relative z-50 pointer-events-auto">
      <button
        aria-label="Réagir"
        disabled={loading || !userId || !mediaId}
        onClick={(e)=>{ e.stopPropagation(); e.preventDefault(); setOpen(v=>!v) }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition backdrop-blur-sm ${open ? 'bg-violet-500/15 text-white border-white/15' : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/15'}`}
        title="Réagir"
      >
        <Flame className="w-4 h-4" />
        <span className="text-xs font-medium">{total}</span>
      </button>
      {error && <span className="ml-2 text-xs text-rose-400">{error}</span>}

      {open && (
        <div className="absolute left-10 -top-1 flex gap-1.5 p-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 shadow-xl">
          {[
            { e:'💖', t:'LOVE' },
            { e:'🔥', t:'FIRE' },
            { e:'😮', t:'WOW' },
            { e:'🙂', t:'SMILE' },
          ].map(x => (
            <button
              key={x.t}
              onClick={async (e)=>{ e.stopPropagation(); e.preventDefault(); await react(x.t as any) }}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-base"
              aria-label={`Réagir ${x.t}`}
            >
              {x.e}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ReactionBar = memo(ReactionBarBase)
export default ReactionBar
