import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import HeaderFixed from './HeaderClient'
import { EscortDashboardProvider } from '@/contexts/EscortDashboardContext'
import EscortQuickActionsBar from '@/components/dashboard-v2/EscortQuickActionsBar'
import MobileBottomNav from '@/components/dashboard-v2/MobileBottomNav'
import EscortTopNav from '@/components/dashboard-v2/escort/EscortTopNav'

export const metadata: Metadata = {
  title: 'Dashboard Escort (v2) — Felora',
  robots: { index: false, follow: false },
}

export default async function EscortV2Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role
  // Guard: accessible aux ESCORT et ADMIN uniquement
  if (!session || !role || (role !== 'ESCORT' && role !== 'ADMIN')) {
    redirect('/login?redirect=%2Fdashboard-escort')
  }

  console.info('[escort-v2] access', { userId: (session as any)?.user?.id, role })

  return (
    <div className="fel-v2 min-h-screen bg-black text-white">
      <div className="sticky top-0 z-40 bg-black/70 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-3 border-b border-white/5 flex items-center justify-between gap-3">
            <div className="text-sm text-white/60">Dashboard Escort v2 (sandbox)</div>
          </div>

          {/* Onglets de navigation */}
          <EscortTopNav />
        </div>
      </div>
      <EscortDashboardProvider>
        <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
          {/* En-tête fixe (statut + progression + actions) */}
          <HeaderFixed />
          <div className="mt-3">
            <EscortQuickActionsBar />
          </div>
          <div className="mt-6">{children}</div>
        </div>
        <MobileBottomNav />
      </EscortDashboardProvider>
    </div>
  )
}