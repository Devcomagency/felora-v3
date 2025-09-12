"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

const ModernProfileEditor = dynamic(() => import('../../../../components/dashboard/ModernProfileEditor'), { ssr: false, loading: () => <div className="h-40 bg-white/5 rounded-xl animate-pulse"/> })

function EscortAgendaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab !== 'agenda') {
      // Force agenda tab param for the editor
      router.replace('/dashboard-escort/activite?tab=agenda')
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

export default function EscortAgendaPage() {
  return (
    <Suspense fallback={
      <DashboardLayout title="Agenda" subtitle="Configurez vos disponibilités et absences">
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="h-40 bg-white/5 rounded-xl animate-pulse"/>
        </div>
      </DashboardLayout>
    }>
      <EscortAgendaContent />
    </Suspense>
  )
}
