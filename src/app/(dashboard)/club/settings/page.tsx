"use client"

import { useState } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

export default function ClubSettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [showAddress, setShowAddress] = useState(false)

  return (
    <DashboardLayout title="Paramètres" subtitle="Notifications, confidentialité et préférences (exemple)">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="text-white font-medium mb-3">Notifications</div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <span className="text-sm text-gray-200">Email</span>
              <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <span className="text-sm text-gray-200">Notifications push</span>
              <input type="checkbox" checked={pushNotif} onChange={e => setPushNotif(e.target.checked)} />
            </label>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="text-white font-medium mb-3">Confidentialité</div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <span className="text-sm text-gray-200">Afficher l'adresse sur le profil</span>
              <input type="checkbox" checked={showAddress} onChange={e => setShowAddress(e.target.checked)} />
            </label>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
