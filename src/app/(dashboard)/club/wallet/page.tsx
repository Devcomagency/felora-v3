"use client"

import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'

export default function ClubWalletPage() {
  const balance = 12450
  const txs = [
    { id: 'tx1', type: 'CREDIT', amount: 2500, date: '2025-08-28', desc: 'Pack Diamants' },
    { id: 'tx2', type: 'DEBIT', amount: -600, date: '2025-08-27', desc: 'Boost profil 24h' },
    { id: 'tx3', type: 'CREDIT', amount: 8000, date: '2025-08-20', desc: 'Pack Diamants' },
    { id: 'tx4', type: 'DEBIT', amount: -1450, date: '2025-08-18', desc: 'Mise en avant semaine' },
  ]

  return (
    <DashboardLayout title="Wallet" subtitle="Diamants et paiements (exemple)">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="text-gray-400 text-sm">Solde actuel</div>
          <div className="text-white text-3xl font-semibold mt-1">{balance.toLocaleString()} 💎</div>
        </div>
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
          <div className="text-white font-medium mb-3">Historique</div>
          <div className="divide-y divide-gray-800">
            {txs.map(t => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">{t.desc}</div>
                  <div className="text-gray-500 text-xs">{t.date}</div>
                </div>
                <div className={`text-sm font-medium ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} 💎</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
