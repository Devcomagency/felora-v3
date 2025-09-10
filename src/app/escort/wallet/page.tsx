'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Wallet, CreditCard, Gift, MessageCircle, Home, TrendingUp, DollarSign } from 'lucide-react'

interface WalletTransaction {
  id: string
  amount: number
  type: string
  meta?: any
  createdAt: string
}

export default function EscortWalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [stats, setStats] = useState({
    totalEarned: 0,
    thisMonth: 0,
    lastMonth: 0,
    pending: 0
  })

  const userId = (session as any)?.user?.id

  useEffect(() => {
    if (userId) {
      loadWalletData()
    }
  }, [userId])

  const loadWalletData = async () => {
    if (!userId) return
    
    setLoadingBalance(true)
    try {
      const response = await fetch(`/api/wallet-v2/balance?userId=${userId}`)
      const data = await response.json()
      
      if (data.error) {
        console.error('Erreur chargement wallet:', data.error)
        return
      }
      
      setBalance(data.balance || 0)
      setTransactions(data.transactions || [])
      setStats({
        totalEarned: data.totalEarned || 0,
        thisMonth: data.thisMonth || 0,
        lastMonth: data.lastMonth || 0,
        pending: data.pending || 0
      })
    } catch (error) {
      console.error('Erreur chargement wallet:', error)
    } finally {
      setLoadingBalance(false)
    }
  }

  const requestWithdrawal = async (amount: number) => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
      })

      const data = await response.json()
      
      if (data.error) {
        console.error('Erreur retrait:', data.error)
        return
      }
      
      // Recharger les données
      await loadWalletData()
    } catch (error) {
      console.error('Erreur retrait:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-400'
    if (type === 'WITHDRAWAL') return 'text-red-400'
    return 'text-yellow-400'
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'EARNED': return 'Gagné'
      case 'WITHDRAWAL': return 'Retrait'
      case 'BONUS': return 'Bonus'
      case 'REFUND': return 'Remboursement'
      default: return type
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl">
          <div className="text-center">
            <p className="text-white/70 mb-4">Vous devez être connecté pour accéder au wallet</p>
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Retour</span>
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              💎 Wallet Escorte
            </h1>
            <p className="text-white/70">Gérez vos gains et retraits</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Solde actuel</p>
                <p className="text-2xl font-bold text-white">{balance.toLocaleString()} ♦</p>
              </div>
              <Wallet className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total gagné</p>
                <p className="text-2xl font-bold text-white">{stats.totalEarned.toLocaleString()} ♦</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Ce mois</p>
                <p className="text-2xl font-bold text-white">{stats.thisMonth.toLocaleString()} ♦</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">En attente</p>
                <p className="text-2xl font-bold text-white">{stats.pending.toLocaleString()} ♦</p>
              </div>
              <CreditCard className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Retrait */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Demander un retrait</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Montant (diamants)</label>
                <input
                  type="number"
                  min="100"
                  step="10"
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="100"
                />
              </div>
              <div className="text-xs text-white/60">
                Montant minimum: 100 ♦ • Frais: 5% • Délai: 2-4 jours ouvrés
              </div>
              <button
                onClick={() => requestWithdrawal(100)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Traitement...' : 'Demander un retrait'}
              </button>
            </div>
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard-escort/statistiques')}
                className="w-full px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Voir les statistiques
              </button>
              <button
                onClick={() => router.push('/messages')}
                className="w-full px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Messagerie
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Accueil
              </button>
            </div>
          </motion.div>
        </div>

        {/* Historique des transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <div className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Historique des transactions</h3>
              <button className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            {loadingBalance ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                Aucune transaction pour le moment
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="px-2 py-1 rounded text-xs border border-white/20">
                        {getTransactionLabel(tx.type)}
                      </div>
                      <div>
                        <div className="text-white text-sm">
                          {formatDate(tx.createdAt)}
                        </div>
                        {tx.meta?.description && (
                          <div className="text-white/70 text-xs">
                            {tx.meta.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`font-semibold ${getTransactionColor(tx.type, tx.amount)}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} ♦
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
