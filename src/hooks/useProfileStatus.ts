import { useState, useEffect } from 'react'

interface ProfileCompletion {
  isComplete: boolean
  percentage: number
  missing: string[]
}

interface ProfileStatus {
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'VERIFIED'
  completion: ProfileCompletion
  canActivate: boolean
  canPause: boolean
  isVerifiedBadge?: boolean
}

interface ToggleResult {
  success: boolean
  message: string
  error?: string
  missingRequirements?: string[]
}

export function useProfileStatus() {
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/escort/profile/status', { cache: 'no-store', credentials: 'include' })
        const j = await r.json()
        if (cancelled) return
        if (r.ok) {
          const ps: ProfileStatus = {
            status: j.status || 'PENDING',
            completion: j.completion || { isComplete:false, percentage:0, missing:[] },
            canActivate: !!j.canActivate,
            canPause: !!j.canPause,
            isVerifiedBadge: !!j.isVerifiedBadge,
          }
          setProfileStatus(ps)
        } else {
          setProfileStatus({ status: 'PENDING', completion: { isComplete:false, percentage:0, missing:[] }, canActivate:false, canPause:false })
        }
      } catch {
        if (!cancelled) setProfileStatus({ status: 'PENDING', completion: { isComplete:false, percentage:0, missing:[] }, canActivate:false, canPause:false })
      }
    })()
    return () => { cancelled = true }
  }, [])

  const toggleStatus = async (): Promise<ToggleResult | null> => {
    if (!profileStatus) return null

    setUpdating(true)
    
    try {
      const res = await fetch('/api/escort/profile/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: profileStatus.status === 'ACTIVE' ? 'pause' : 'activate' }) })
      const j = await res.json()
      if (!res.ok || !j?.ok) {
        setUpdating(false)
        return { success:false, error: j?.error || 'Action non disponible' }
      }
      // Refresh status
      try {
        const r = await fetch('/api/escort/profile/status', { cache: 'no-store', credentials: 'include' })
        const d = await r.json()
        if (r.ok) setProfileStatus({ status: d.status, completion: d.completion || { isComplete:false, percentage:0, missing:[] }, canActivate: !!d.canActivate, canPause: !!d.canPause, isVerifiedBadge: !!d.isVerifiedBadge })
      } catch {}
      setUpdating(false)
      return { success: true, message: j.status === 'ACTIVE' ? 'Profil activé avec succès !' : (j.status === 'PAUSED' ? 'Profil mis en pause' : 'Statut mis à jour') }
    } catch (error) {
      setUpdating(false)
      return { success:false, error: 'Une erreur est survenue' }
    }
  }

  return {
    profileStatus,
    updating,
    toggleStatus
  }
}
