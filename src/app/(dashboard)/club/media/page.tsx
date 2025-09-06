"use client"

import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import ClubMediaManagerV2 from './ManagerV2'

export default function ClubMediaPage() {
  return (
    <DashboardLayout title="Médias Club" subtitle="Médias publics">
      <ClubMediaManagerV2 />
    </DashboardLayout>
  )
}
