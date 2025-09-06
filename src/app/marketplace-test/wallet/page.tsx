'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface WalletTransaction {
  id: string
  amount: number
  type: string
  meta?: any
  createdAt: string
}

function WalletTestContent() {
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
    if (type === 'PURCHASE_GIFT') return 'text-felora-aurora'
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
      <div className="min-h-screen bg-felora-void flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-felora-aurora"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-felora-void flex items-center justify-center">
        <Card className="glass-card max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-felora-silver mb-4">Vous devez être connecté pour accéder au wallet</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-felora-aurora to-felora-plasma">
                Se connecter
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-felora-void">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-felora-void via-felora-obsidian to-felora-void">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                if (returnTo) router.push(returnTo)
                else if (typeof window !== 'undefined' && document.referrer) window.history.back()
                else router.push('/marketplace-test/gifts')
              }}
              className="inline-flex items-center gap-2 text-felora-silver/80 hover:text-felora-silver transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Retour</span>
            </button>
            {need && (
              <div className="text-felora-aurora text-xs">Montant suggéré: +{need} 💎</div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-felora-silver mb-2">
              💎 Wallet Diamants
            </h1>
            <p className="text-felora-silver/70">Gérez votre solde de diamants virtuels</p>
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
            <Card className="glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-felora-silver flex items-center justify-center space-x-2">
                  <span>💎</span>
                  <span>Solde actuel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {loadingBalance ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-felora-aurora mx-auto"></div>
                ) : (
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-felora-aurora to-felora-plasma">
                    {balance.toLocaleString()} diamants
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-felora-silver">Actions rapides</CardTitle>
                <CardDescription className="text-felora-silver/70">
                  Acheter des diamants ou tester le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Packs de diamants */}
                  <div className="space-y-3">
                    <h3 className="text-felora-silver font-medium">Acheter des diamants</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => simulateFunding(100)}
                        className="w-full bg-gradient-to-r from-felora-aurora to-felora-plasma text-sm"
                        size="sm"
                      >
                        100 💎 - 5€
                      </Button>
                      <Button
                        onClick={() => simulateFunding(500)}
                        className="w-full bg-gradient-to-r from-felora-plasma to-felora-quantum text-sm"
                        size="sm"
                      >
                        500 💎 - 20€
                      </Button>
                      <Button
                        onClick={() => simulateFunding(1000)}
                        className="w-full bg-gradient-to-r from-felora-quantum to-felora-neural text-sm"
                        size="sm"
                      >
                        1000 💎 - 35€
                      </Button>
                    </div>
                  </div>

                  {/* Mode développement */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="space-y-3">
                      <h3 className="text-felora-silver font-medium">Mode Dev</h3>
                      <div className="space-y-2">
                        <Button
                          onClick={() => simulateFunding(100)}
                          disabled={loading}
                          variant="outline"
                          className="w-full text-sm"
                          size="sm"
                        >
                          +100 💎 (test)
                        </Button>
                        <Button
                          onClick={() => simulateFunding(500)}
                          disabled={loading}
                          variant="outline"
                          className="w-full text-sm"
                          size="sm"
                        >
                          +500 💎 (test)
                        </Button>
                        <Button
                          onClick={() => simulateFunding(1000)}
                          disabled={loading}
                          variant="outline"
                          className="w-full text-sm"
                          size="sm"
                        >
                          +1000 💎 (test)
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="space-y-3">
                    <h3 className="text-felora-silver font-medium">Navigation</h3>
                    <div className="space-y-2">
                      <Link href="/marketplace-test/gifts">
                        <Button variant="outline" className="w-full text-sm" size="sm">
                          🎁 Catalogue cadeaux
                        </Button>
                      </Link>
                      <Link href="/messages">
                        <Button variant="outline" className="w-full text-sm" size="sm">
                          💬 Messagerie
                        </Button>
                      </Link>
                      <Link href="/">
                        <Button variant="outline" className="w-full text-sm" size="sm">
                          🏠 Accueil
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Historique des transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-felora-silver">Historique des transactions</CardTitle>
              <CardDescription className="text-felora-silver/70">
                Dernières opérations sur votre wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBalance ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-felora-aurora mx-auto"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-felora-silver/50">
                  Aucune transaction pour le moment
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="text-xs">
                          {getTransactionLabel(tx.type)}
                        </Badge>
                        <div>
                          <div className="text-felora-silver text-sm">
                            {formatDate(tx.createdAt)}
                          </div>
                          {tx.meta?.giftCode && (
                            <div className="text-felora-silver/70 text-xs">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function WalletTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-felora-void flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-felora-aurora"></div>
      </div>
    }>
      <WalletTestContent />
    </Suspense>
  )
}
