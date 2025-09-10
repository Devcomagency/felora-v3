'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Download, Wallet, CreditCard, Gift, MessageCircle, Home } from 'lucide-react'

interface WalletTransaction {
  id: string
  amount: number
  type: string
  meta?: any
  createdAt: string
}

function WalletContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [from, setFrom] = useState<string | null>(null)
  const [need, setNeed] = useState<number | null>(null)
  const [returnTo, setReturnTo] = useState<string | null>(null)

  const userId = (session as any)?.user?.id

  // Charger balance et transactions
  useEffect(() => {
    if (userId) {
      loadWalletData()
    }
  }, [userId])

  // Lire les paramètres de retour
  useEffect(() => {
    if (!searchParams) return
    setFrom(searchParams.get('from'))
    const needParam = searchParams.get('need')
    setNeed(needParam ? Number(needParam) : null)
    setReturnTo(searchParams.get('returnTo'))
  }, [searchParams])

  const loadWalletData = async () => {
    if (!userId) return
    
    setLoadingBalance(true)
    try {
      const response = await fetch(`/api/wallet-v2/balance?userId=${userId}`)
      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
        return
      }
      
      setBalance(data.balance || 0)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Erreur chargement wallet:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoadingBalance(false)
    }
  }

  const simulateFunding = async (amount: number) => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/wallet-v2/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount })
      })

      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
        return
      }
      
      toast.success('Félicitations, votre compte a été rechargé !')
      setBalance(data.balance)
      
      // Recharger les transactions
      await loadWalletData()
      // Si on vient d'un achat cadeau, revenir à la page d'origine pour dépenser
      if (from === 'gift' && returnTo) {
        setTimeout(() => {
          router.push(returnTo)
        }, 800)
      }
    } catch (error) {
      console.error('Erreur funding:', error)
      toast.error('Erreur lors de l\'ajout de diamants')
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
    if (type === 'PURCHASE_GIFT') return 'text-pink-400'
    return 'text-red-400'
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'FUND': return 'Achat diamants'
      case 'PURCHASE_GIFT': return 'Cadeau envoyé'
      case 'TRANSFER': return 'Transfert'
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
            <Link href="/login">
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                Se connecter
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (returnTo) router.push(returnTo)
                else if (typeof window !== 'undefined' && document.referrer) window.history.back()
                else router.push('/marketplace-test/gifts')
              }}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Retour</span>
            </button>
            {need && (
              <div className="text-purple-400 text-xs">Montant suggéré: +{need} 💎</div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              💎 Wallet Diamants
            </h1>
            <p className="text-white/70">Gérez votre solde de diamants virtuels</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Solde principal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-white flex items-center justify-center space-x-2 mb-4">
                  <Wallet className="w-6 h-6" />
                  <span className="text-lg font-semibold">Solde actuel</span>
                </div>
                {loadingBalance ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                ) : (
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    {balance.toLocaleString()} diamants
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Actions rapides</h3>
                <p className="text-white/70 text-sm">
                  Acheter des diamants ou tester le système
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Packs de diamants */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium">Acheter des diamants</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => simulateFunding(100)}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm hover:shadow-lg transition-shadow"
                    >
                      100 💎 - 5€
                    </button>
                    <button
                      onClick={() => simulateFunding(500)}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm hover:shadow-lg transition-shadow"
                    >
                      500 💎 - 20€
                    </button>
                    <button
                      onClick={() => simulateFunding(1000)}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm hover:shadow-lg transition-shadow"
                    >
                      1000 💎 - 35€
                    </button>
                  </div>
                </div>

                {/* Mode développement */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Mode Dev</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => simulateFunding(100)}
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 disabled:opacity-50"
                      >
                        +100 💎 (test)
                      </button>
                      <button
                        onClick={() => simulateFunding(500)}
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 disabled:opacity-50"
                      >
                        +500 💎 (test)
                      </button>
                      <button
                        onClick={() => simulateFunding(1000)}
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 disabled:opacity-50"
                      >
                        +1000 💎 (test)
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium">Navigation</h3>
                  <div className="space-y-2">
                    <Link href="/marketplace-test/gifts">
                      <button className="w-full px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Catalogue cadeaux
                      </button>
                    </Link>
                    <Link href="/messages">
                      <button className="w-full px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Messagerie
                      </button>
                    </Link>
                    <Link href="/">
                      <button className="w-full px-4 py-2 rounded-lg border border-white/20 text-white text-sm hover:bg-white/10 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Accueil
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Historique des transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-gray-900/50 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Historique des transactions</h3>
              <p className="text-white/70 text-sm">
                Dernières opérations sur votre wallet
              </p>
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
                        {tx.meta?.giftCode && (
                          <div className="text-white/70 text-xs">
                            Cadeau: {tx.meta.giftCode}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`font-semibold ${getTransactionColor(tx.type, tx.amount)}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} 💎
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

export default function WalletTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <WalletContent />
    </Suspense>
  )
}