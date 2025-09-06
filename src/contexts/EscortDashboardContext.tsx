"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'

type Status = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'VERIFIED'

interface EscortDashboardState {
  status: Status
  isVerified: boolean
  loading: boolean
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
    await fetch('/api/escort/profile/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'activate' }) })
    setStatus('ACTIVE')
    try { window.dispatchEvent(new CustomEvent('profile:status-changed')) } catch {}
  }, [])

  const pause = useCallback(async () => {
    await fetch('/api/escort/profile/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'pause' }) })
    setStatus('PAUSED')
    try { window.dispatchEvent(new CustomEvent('profile:status-changed')) } catch {}
  }, [])

  const value = useMemo(() => ({ status, isVerified, loading, activate, pause, refresh }), [status, isVerified, loading, activate, pause, refresh])

  return <EscortDashboardContext.Provider value={value}>{children}</EscortDashboardContext.Provider>
}

export function useEscortDashboard() {
  const ctx = useContext(EscortDashboardContext)
  if (!ctx) throw new Error('useEscortDashboard must be used within EscortDashboardProvider')
  return ctx
}

