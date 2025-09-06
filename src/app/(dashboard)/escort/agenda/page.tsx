"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

const ModernProfileEditor = dynamic(() => import('../../../../components/dashboard/ModernProfileEditor'), { ssr: false, loading: () => <div className="h-40 bg-white/5 rounded-xl animate-pulse"/> })

export default function EscortAgendaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab !== 'agenda') {
      // Force agenda tab param for the editor
      router.replace('/escort/agenda?tab=agenda')
    }
  }, [router, searchParams])

  return (
    <DashboardLayout title="Agenda" subtitle="Configurez vos disponibilités et absences">
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <ModernProfileEditor agendaOnly />
      </div>
    </DashboardLayout>
  )
}
