'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ReactionType = 'LIKE'|'LOVE'|'FIRE'|'WOW'|'SMILE'
type Stats = { reactions: Record<string,number>; total: number }

function useReactions(mediaIdRaw: string, userIdRaw?: string|null, refreshTrigger?: number) {
  const mediaId = useMemo(() => String(mediaIdRaw || ''), [mediaIdRaw])
  const userId = useMemo(() => userIdRaw ? String(userIdRaw) : null, [userIdRaw])

  const [stats, setStats] = useState<Stats>({ reactions:{LIKE:0,LOVE:0,FIRE:0,WOW:0,SMILE:0}, total:0 })
  const [userHasLiked, setUserHasLiked] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const lastGetKeyRef = useRef<string>('')
  const inflightGet = useRef<AbortController|null>(null)
  const postingRef = useRef(false)

  useEffect(() => {
    if (!mediaId) return
    const key = `${mediaId}::${userId ?? ''}::${refreshTrigger ?? 0}`
    if (key === lastGetKeyRef.current) return
    lastGetKeyRef.current = key

    console.log(`[useReactions] Effect triggered for mediaId=${mediaId}, userId=${userId}`)

    // Fetch immédiat pour éviter les problèmes de timing avec le démontage du composant
    console.log(`[useReactions] Starting fetch for mediaId=${mediaId}`)
    inflightGet.current?.abort()
    const ctrl = new AbortController()
    inflightGet.current = ctrl

    const qs = new URLSearchParams({ mediaId, ...(userId ? { userId } : {}) })

    fetch(`/api/reactions?${qs}`, { cache: 'no-store', signal: ctrl.signal })
      .then(r => {
        if (ctrl.signal.aborted) return
        return r.json()
      })
      .then(d => {
        if (!d || ctrl.signal.aborted) return
        console.log(`[useReactions] Received data for ${mediaId}:`, d)
        if (d?.stats) {
          console.log(`[useReactions] Setting stats:`, d.stats)
          // Force new object reference to trigger React re-render
          setStats({ ...d.stats, reactions: { ...d.stats.reactions } })
        }
        if (typeof d?.userHasLiked === 'boolean') setUserHasLiked(d.userHasLiked)
        if (Array.isArray(d?.userReactions)) setUserReactions(d.userReactions)
      })
      .catch(err => {
        if (!ctrl.signal.aborted) {
          console.warn('Reaction fetch failed:', err?.message)
        }
      })

    return () => {
      inflightGet.current?.abort()
    }
  }, [mediaId, userId, refreshTrigger])

  const toggleReaction = useCallback(async (type: ReactionType) => {
    console.log('[REACTION HOOK] toggleReaction called', { mediaId, userId, type })
    if (!mediaId) {
      console.log('[REACTION HOOK] ❌ No mediaId, aborting')
      return
    }
    if (!userId) {
      console.log('[REACTION HOOK] ❌ No userId, aborting')
      setError('Connexion requise');
      return
    }
    if (postingRef.current) {
      console.log('[REACTION HOOK] ❌ Already posting, aborting')
      return
    }
    postingRef.current = true
    
    // Timeout de sécurité pour débloquer postingRef
    const timeoutId = setTimeout(() => {
      if (postingRef.current) {
        console.log('[REACTION HOOK] ⚠️ Timeout: déblocage postingRef')
        postingRef.current = false
      }
    }, 5000) // 5 secondes max
    setError(null)

    const prev = { stats, userHasLiked, userReactions }
    if (type === 'LIKE') {
      const nextLiked = !userHasLiked
      setUserHasLiked(nextLiked)
      setStats(s => {
        const n = { ...s, reactions: { ...s.reactions } }
        n.reactions.LIKE = Math.max(0, (n.reactions.LIKE ?? 0) + (nextLiked ? 1 : -1))
        n.total = Object.values(n.reactions).reduce((a,b)=>a+b,0)
        return n
      })
    } else {
      // Toggle des réactions : si déjà active, on la supprime, sinon on la remplace
      const had = userReactions.includes(type)

      setStats(s => {
        const n = { ...s, reactions: { ...s.reactions } }

        if (had) {
          // Toggle OFF : retirer la réaction
          n.reactions[type] = Math.max(0, (n.reactions[type] ?? 0) - 1)
          setUserReactions([]) // Plus de réaction
        } else {
          // Toggle ON ou remplacement : retirer l'ancienne et ajouter la nouvelle
          if (userReactions.length) {
            for (const t of userReactions) {
              if (t !== 'LIKE') n.reactions[t] = Math.max(0, (n.reactions[t] ?? 0) - 1)
            }
          }
          n.reactions[type] = Math.max(0, (n.reactions[type] ?? 0) + 1)
          setUserReactions([type])
        }

        n.total = Object.values(n.reactions).reduce((a,b)=>a+b,0)
        return n
      })
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ mediaId, userId, type: type.toUpperCase() })
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'toggle_failed')

      if (data.stats) setStats(data.stats)
      if (typeof data.userHasLiked === 'boolean') setUserHasLiked(data.userHasLiked)
      if (Array.isArray(data.userReactions)) setUserReactions(data.userReactions)
    } catch (e:any) {
      setStats(prev.stats)
      setUserHasLiked(prev.userHasLiked)
      setUserReactions(prev.userReactions)
      setError(e?.message || 'Erreur')
    } finally {
      clearTimeout(timeoutId)
      postingRef.current = false
      setLoading(false)
    }
  }, [mediaId, userId, stats, userHasLiked, userReactions])

  return { stats, userHasLiked, userReactions, loading, error, toggleReaction }
}

export default useReactions
export { useReactions }
export type { ReactionType }