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
    <div className="fel-v2 min-h-screen text-white relative selection:bg-purple-500/30 selection:text-purple-200 pb-24 sm:pb-12" style={{ backgroundColor: '#050505' }}>
      {/* Background Glow */}
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <EscortDashboardProvider>
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* En-tête fixe (statut + progression + actions) */}
          <HeaderFixed />
          <div className="mt-3">
            <EscortQuickActionsBar />
          </div>
          <div className="mt-8">{children}</div>
        </div>
        <MobileBottomNav />
      </EscortDashboardProvider>
    </div>
  )
}