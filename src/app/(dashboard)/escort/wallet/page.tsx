'use client'

import { useState } from 'react'
import DashboardLayout from '../../../../components/dashboard-v2/DashboardLayout'
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Banknote, TrendingUp, Gift, Download } from 'lucide-react'

export default function EscortWalletPage() {
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions' | 'withdraw'>('balance')

  // Données simulées
  const walletData = {
    balance: 3847,
    totalEarned: 28950,
    totalWithdrawn: 25103,
    pendingWithdrawal: 450
  }

  const transactions = [
    {
      id: '1',
      type: 'earning',
      description: 'Commande photo personnalisée - Marc_Geneva',
      amount: 150,
      date: '2024-01-20T14:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'earning',
      description: 'Cadeau reçu - Alex_Lausanne',
      amount: 80,
      date: '2024-01-19T16:45:00Z',
      status: 'completed'
    },
    {
      id: '3',
      type: 'withdrawal',
      description: 'Retrait vers compte bancaire',
      amount: -500,
      date: '2024-01-18T10:20:00Z',
      status: 'completed'
    },
    {
      id: '4',
      type: 'earning',
      description: 'Média payant débloqué - Thomas_Zurich',
      amount: 45,
      date: '2024-01-17T20:15:00Z',
      status: 'completed'
    },
    {
      id: '5',
      type: 'withdrawal',
      description: 'Retrait vers compte bancaire',
      amount: -300,
      date: '2024-01-15T14:30:00Z',
      status: 'pending'
    }
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return <ArrowDownLeft className="text-green-400" size={18} />
      case 'withdrawal': return <ArrowUpRight className="text-blue-400" size={18} />
      case 'gift': return <Gift className="text-purple-400" size={18} />
      default: return <Wallet className="text-gray-400" size={18} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <DashboardLayout 
      title="Portefeuille" 
      subtitle="Gérez vos revenus et retraits en toute sécurité"
    >
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="text-purple-400" size={24} />
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{walletData.balance.toLocaleString()} ♦</div>
          <div className="text-sm text-gray-400">Solde disponible</div>
        </div>

        <div className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <ArrowDownLeft className="text-green-400" size={24} />
            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">+12%</span>
          </div>
          <div className="text-2xl font-bold text-white">{walletData.totalEarned.toLocaleString()} ♦</div>
          <div className="text-sm text-gray-400">Total gagné</div>
        </div>

        <div className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <ArrowUpRight className="text-blue-400" size={24} />
            <span className="text-xs text-blue-400">Ce mois</span>
          </div>
          <div className="text-2xl font-bold text-white">{walletData.totalWithdrawn.toLocaleString()} ♦</div>
          <div className="text-sm text-gray-400">Total retiré</div>
        </div>

        <div className="p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="text-yellow-400" size={24} />
            <span className="text-xs text-yellow-400">En attente</span>
          </div>
          <div className="text-2xl font-bold text-white">{walletData.pendingWithdrawal} ♦</div>
          <div className="text-sm text-gray-400">Retrait en cours</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1">
          {[
            { key: 'balance', label: 'Vue d\'ensemble', icon: '💰' },
            { key: 'transactions', label: 'Transactions', icon: '📊' },
            { key: 'withdraw', label: 'Retirer', icon: '💳' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique des gains */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Évolution des revenus</h3>
            <div className="h-64 flex items-end justify-center space-x-3">
              {[120, 95, 180, 145, 220, 190, 250, 180, 200, 170, 240, 210].map((height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-gray-400 mb-2">{height}♦</div>
                  <div 
                    className="w-8 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                    style={{ height: `${(height / 250) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-1">
                    {['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sources de revenus */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Sources de revenus</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    📸
                  </div>
                  <div>
                    <div className="text-white font-medium">Commandes privées</div>
                    <div className="text-sm text-gray-400">54% du total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">2,080 ♦</div>
                  <div className="text-sm text-green-400">+15%</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    💎
                  </div>
                  <div>
                    <div className="text-white font-medium">Médias payants</div>
                    <div className="text-sm text-gray-400">29% du total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">1,115 ♦</div>
                  <div className="text-sm text-green-400">+8%</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    🎁
                  </div>
                  <div>
                    <div className="text-white font-medium">Cadeaux</div>
                    <div className="text-sm text-gray-400">17% du total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">652 ♦</div>
                  <div className="text-sm text-green-400">+22%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Historique des transactions</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-colors">
              <Download size={16} />
              <span>Exporter</span>
            </button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-600/50 rounded-lg">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(transaction.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-white'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} ♦
                  </div>
                  <div className={`text-sm ${getStatusColor(transaction.status)}`}>
                    {transaction.status === 'completed' ? 'Terminé' : 
                     transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Voir plus de transactions
            </button>
          </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Effectuer un retrait</h3>
            
            <div className="space-y-6">
              {/* Solde disponible */}
              <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">Solde disponible</div>
                    <div className="text-3xl font-bold text-white">{walletData.balance} ♦</div>
                  </div>
                  <Wallet className="text-purple-400" size={32} />
                </div>
              </div>

              {/* Formulaire de retrait */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Montant à retirer</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none pr-12"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 font-medium">♦</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                    <span>Minimum: 100 ♦</span>
                    <button className="text-purple-400 hover:text-purple-300">Montant max</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Méthode de retrait</label>
                  <div className="space-y-2">
                    <div className="flex items-center p-4 bg-gray-700/30 border border-gray-600/50 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors">
                      <input type="radio" name="method" value="bank" className="mr-3" defaultChecked />
                      <div className="flex items-center space-x-3">
                        <Banknote className="text-green-400" size={20} />
                        <div>
                          <div className="text-white font-medium">Virement bancaire</div>
                          <div className="text-sm text-gray-400">2-3 jours ouvrables • Gratuit</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-gray-700/30 border border-gray-600/50 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors opacity-50">
                      <input type="radio" name="method" value="crypto" className="mr-3" disabled />
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">₿</div>
                        <div>
                          <div className="text-white font-medium">Crypto (Bitcoin)</div>
                          <div className="text-sm text-gray-400">Instantané • Bientôt disponible</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Compte bancaire</label>
                  <div className="p-4 bg-gray-700/30 border border-gray-600/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">UBS •••• 1234</div>
                        <div className="text-sm text-gray-400">Compte principal</div>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 text-sm">Modifier</button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400">⚠️</span>
                    <div className="text-sm">
                      <div className="text-yellow-400 font-medium">Information importante</div>
                      <div className="text-gray-300 mt-1">
                        Les retraits sont traités sous 2-3 jours ouvrables. Une fois le retrait confirmé, il ne peut pas être annulé.
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Confirmer le retrait
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}