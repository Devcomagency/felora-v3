"use client"

import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

export default function ClubMessagesPage() {
  return (
    <DashboardLayout title="Messages" subtitle="Fonctionnalité prochainement disponible pour les clubs">
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="text-gray-300 text-sm mb-2">La messagerie n&apos;est pas encore disponible pour les comptes Club.</div>
        <div className="text-gray-400 text-xs">Si besoin, contactez le support pour plus d&apos;informations.</div>
      </div>
    </DashboardLayout>
  )
}
