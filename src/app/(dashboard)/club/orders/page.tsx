"use client"

import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

export default function ClubOrdersPage() {
  return (
    <DashboardLayout title="Commandes" subtitle="Demandes de médias privés">
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="text-gray-300 text-sm">Tableau PENDING / ACCEPTED / REJECTED / DELIVERED à brancher.</div>
        <div className="text-gray-400 text-sm mt-2">Actions: Accept / Reject / Deliver (upload + envoi message).</div>
      </div>
    </DashboardLayout>
  )
}

