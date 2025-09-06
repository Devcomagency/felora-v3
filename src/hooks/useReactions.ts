'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ReactionType = 'LIKE'|'LOVE'|'FIRE'|'WOW'|'SMILE'
type Stats = { reactions: Record<string,number>; total: number }

// Cache simple en mémoire pour éviter les re-fetch inutiles
const reactionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 secondes

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

    // Vérifier le cache d'abord
    const cacheKey = `${mediaId}_${userId ?? 'anonymous'}`
    const cached = reactionCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Utiliser les données du cache
      const d = cached.data
      if (d?.stats) setStats(d.stats)
      if (typeof d?.userHasLiked === 'boolean') setUserHasLiked(d.userHasLiked)
      if (Array.isArray(d?.userReactions)) setUserReactions(d.userReactions)
      return
    }

    // Exécution immédiate pour une meilleure réactivité
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
        
        // Mettre à jour le cache
        reactionCache.set(cacheKey, { data: d, timestamp: Date.now() })
        
        if (d?.stats) setStats(d.stats)
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
    if (!mediaId) return
    if (!userId) { setError('Connexion requise'); return }
    if (postingRef.current) return
    postingRef.current = true
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
      // Exclusivité stricte et idempotence: 1 seule réaction non-LIKE; recliquer la même ne change rien
      const had = userReactions.includes(type)
      if (had) {
        // Rien à changer côté client ni serveur
        postingRef.current = false
        return
      }
      setStats(s => {
        const n = { ...s, reactions: { ...s.reactions } }
        // Si on avait une autre réaction, la retirer
        if (!had && userReactions.length) {
          for (const t of userReactions) {
            if (t !== 'LIKE') n.reactions[t] = Math.max(0, (n.reactions[t] ?? 0) - 1)
          }
        }
        // Appliquer toggle sur la réaction cible
        n.reactions[type] = Math.max(0, (n.reactions[type] ?? 0) + 1)
        n.total = Object.values(n.reactions).reduce((a,b)=>a+b,0)
        return n
      })
      // Mettre à jour l'état utilisateur (exactement 1 réaction non-LIKE)
      setUserReactions([type])
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

      // Invalider le cache pour forcer une mise à jour fraîche
      const cacheKey = `${mediaId}_${userId ?? 'anonymous'}`
      reactionCache.delete(cacheKey)
      
      if (data.stats) setStats(data.stats)
      if (typeof data.userHasLiked === 'boolean') setUserHasLiked(data.userHasLiked)
      if (Array.isArray(data.userReactions)) setUserReactions(data.userReactions)
    } catch (e:any) {
      setStats(prev.stats)
      setUserHasLiked(prev.userHasLiked)
      setUserReactions(prev.userReactions)
      setError(e?.message || 'Erreur')
    } finally {
      postingRef.current = false
      setLoading(false)
    }
  }, [mediaId, userId, stats, userHasLiked, userReactions])

  return { stats, userHasLiked, userReactions, loading, error, toggleReaction }
}

export default useReactions
export { useReactions }
export type { ReactionType }
