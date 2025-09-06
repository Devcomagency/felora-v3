"use client"

import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

export default function ClubStatsPage() {
  const kpis = [
    { label: 'Vues (30j)', value: 4821 },
    { label: 'Likes (30j)', value: 376 },
    { label: 'Réactions (30j)', value: 918 },
    { label: 'Taux clic -> profil', value: '4.8%' },
  ]

  const bars = [12, 18, 14, 22, 28, 26, 30, 24, 20, 18, 16, 21]

  return (
    <DashboardLayout title="Statistiques" subtitle="Performance et engagement (exemple)">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {kpis.map(k => (
          <div key={k.label} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
            <div className="text-gray-400 text-xs">{k.label}</div>
            <div className="text-white text-2xl font-semibold mt-1">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
        <div className="text-white font-medium mb-4">Évolution hebdomadaire des vues</div>
        <div className="h-36 flex items-end gap-2">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-pink-500/10 to-purple-500/30 rounded-t-md" style={{ height: `${h * 3}px` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>S1</span><span>S2</span><span>S3</span><span>S4</span><span>S5</span><span>S6</span>
        </div>
      </div>
    </DashboardLayout>
  )
}
