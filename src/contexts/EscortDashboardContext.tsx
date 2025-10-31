"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'

type Status = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'VERIFIED'

interface EscortDashboardState {
  status: Status
  isVerified: boolean
  loading: boolean
  error: string | null
  missingFields: string[]
  activate: () => Promise<void>
  pause: () => Promise<void>
  refresh: () => Promise<void>
}

const EscortDashboardContext = createContext<EscortDashboardState | undefined>(undefined)

export function EscortDashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [status, setStatus] = useState<Status>('PENDING')
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/escort/profile/status', { cache: 'no-store', credentials: 'include' })
      const d = await r.json().catch(() => null)
      if (d?.status) setStatus(d.status)
      if (typeof d?.isVerifiedBadge === 'boolean') setIsVerified(!!d.isVerifiedBadge)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh, session?.user?.id])

  const activate = useCallback(async () => {
    setError(null)
    setMissingFields([])
    
    try {
      const res = await fetch('/api/escort/profile/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'activate' }) })
      
      console.log('🔍 [CONTEXT] Activate response status:', res.status)
      
      // Vérifier que la réponse est bien JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ [CONTEXT] Réponse non-JSON:', contentType)
        setError('Erreur de communication avec le serveur')
        return
      }
      
      const data = await res.json().catch((e) => {
        console.error('❌ [CONTEXT] Erreur parsing JSON:', e)
        setError('Erreur lors du traitement de la réponse')
        return { ok: false }
      })
      
      console.log('🔍 [CONTEXT] Activate response data:', data)
      
      if (data.ok) {
        setStatus(data.status || 'ACTIVE')
        await refresh() // Recharger depuis le serveur
        setError(null)
        setMissingFields([])
      } else if (data.error === 'profile_incomplete') {
        // Profil incomplet - afficher les champs manquants
        const missing = data.missing || []
        setError(`Profil incomplet (${data.completion || 0}%)`)
        setMissingFields(missing)
      } else {
        setError(data.message || 'Erreur lors de l\'activation')
        setMissingFields([])
      }
      try { window.dispatchEvent(new CustomEvent('profile:status-changed')) } catch {}
    } catch (error) {
      console.error('❌ [CONTEXT] Erreur lors de l\'activation:', error)
      setError('Une erreur est survenue lors de l\'activation')
      setMissingFields([])
    }
  }, [refresh])

  const pause = useCallback(async () => {
    setError(null)
    setMissingFields([])
    
    try {
      const res = await fetch('/api/escort/profile/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'pause' }) })
      
      console.log('🔍 [CONTEXT] Pause response status:', res.status)
      
      // Vérifier que la réponse est bien JSON
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ [CONTEXT] Réponse non-JSON:', contentType)
        setError('Erreur de communication avec le serveur')
        return
      }
      
      const data = await res.json().catch((e) => {
        console.error('❌ [CONTEXT] Erreur parsing JSON:', e)
        setError('Erreur lors du traitement de la réponse')
        return { ok: false }
      })
      
      console.log('🔍 [CONTEXT] Pause response data:', data)
      
      if (data.ok) {
        setStatus(data.status || 'PAUSED')
        await refresh() // Recharger depuis le serveur
        setError(null)
        setMissingFields([])
      } else {
        setError(data.message || 'Erreur lors de la pause')
      }
      try { window.dispatchEvent(new CustomEvent('profile:status-changed')) } catch {}
    } catch (error) {
      console.error('❌ [CONTEXT] Erreur lors de la pause:', error)
      setError('Une erreur est survenue lors de la pause')
    }
  }, [refresh])

  const value = useMemo(() => ({ 
    status, 
    isVerified, 
    loading, 
    error, 
    missingFields, 
    activate, 
    pause, 
    refresh 
  }), [status, isVerified, loading, error, missingFields, activate, pause, refresh])

  return <EscortDashboardContext.Provider value={value}>{children}</EscortDashboardContext.Provider>
}

export function useEscortDashboard() {
  const ctx = useContext(EscortDashboardContext)
  if (!ctx) throw new Error('useEscortDashboard must be used within EscortDashboardProvider')
  return ctx
}

