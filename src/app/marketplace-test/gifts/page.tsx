'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StaticGiftPlayer } from '@/components/gifts/StaticGiftPlayer'
import { GiftPicker } from '@/components/gifts/GiftPicker'
import { GiftToast } from '@/components/gifts/GiftToast'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Gift {
  code: string
  name: string
  price: number
  lottieUrl: string
}

// Mapping des codes de cadeaux vers les types
const getGiftType = (giftCode: string): 'heart' | 'diamond' | 'rose' | 'fireworks' | 'crown' => {
  const mapping: Record<string, 'heart' | 'diamond' | 'rose' | 'fireworks' | 'crown'> = {
    'heart': 'heart',
    'coeur': 'heart',
    'HEART': 'heart',
    'COEUR': 'heart',
    'diamond': 'diamond',
    'diamant': 'diamond',
    'DIAMOND': 'diamond',
    'DIAMANT': 'diamond',
    'rose': 'rose',
    'ROSE': 'rose',
    'fireworks': 'fireworks',
    'feux': 'fireworks',
    'FIREWORKS': 'fireworks',
    'FEUX': 'fireworks',
    'crown': 'crown',
    'couronne': 'crown',
    'CROWN': 'crown',
    'COURONNE': 'crown'
  }
  
  return mapping[giftCode] || 'heart' // fallback
}

// Utilisateurs de test pour les démos
const TEST_USERS = [
  { id: 'escort-1', name: 'Sophie (Escort Test)' },
  { id: 'escort-2', name: 'Emma (Escort Test)' },
  { id: 'escort-3', name: 'Lisa (Escort Test)' },
  { id: 'client-1', name: 'Marc (Client Test)' },
  { id: 'client-2', name: 'Pierre (Client Test)' },
]

export default function GiftsTestPage() {
  const { data: session, status } = useSession()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [recipientId, setRecipientId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [balance, setBalance] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [lastSentGift, setLastSentGift] = useState<any>(null)

  const userId = (session as any)?.user?.id

  useEffect(() => {
    loadCatalogAndBalance()
  }, [])

  const loadCatalogAndBalance = async () => {
    setLoadingCatalog(true)
    try {
      // Charger catalogue
      const catalogResponse = await fetch('/api/gifts-v2/catalog')
      const catalogData = await catalogResponse.json()
      
      if (!catalogData.error) {
        setGifts(catalogData.items || [])
      }

      // Charger balance si connecté
      if (userId) {
        const balanceResponse = await fetch(`/api/wallet-v2/balance?userId=${userId}`)
        const balanceData = await balanceResponse.json()
        
        if (!balanceData.error) {
          setBalance(balanceData.balance || 0)
        }
      }

    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoadingCatalog(false)
    }
  }

  const redirectToTopUp = (need?: number) => {
    const q = new URLSearchParams()
    if (need) q.set('need', String(need))
    q.set('from', 'gift')
    try { q.set('returnTo', window.location.href) } catch {}
    window.location.href = `/marketplace-test/wallet?${q.toString()}`
  }

  const handleDirectSend = async () => {
    if (!userId) {
      toast.error('Vous devez être connecté')
      return
    }

    if (!selectedGift || !recipientId) {
      toast.error('Veuillez sélectionner un cadeau et un destinataire')
      return
    }

    if (quantity <= 0) {
      toast.error('Quantité invalide')
      return
    }

    const totalCost = selectedGift.price * quantity
    if (totalCost > balance) {
      redirectToTopUp(totalCost - balance)
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/gifts-v2/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: userId,
          toUserId: recipientId,
          giftCode: selectedGift.code,
          quantity,
          clientTxnId: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      // Succès - Afficher toast animé
      setLastSentGift({
        ...data.gift,
        senderName: 'Vous'
      })
      setShowToast(true)
      
      // Mettre à jour le solde
      setBalance(data.balance)
      
      // Reset form
      setSelectedGift(null)
      setRecipientId('')
      setQuantity(1)

    } catch (error) {
      console.error('Erreur envoi cadeau:', error)
      toast.error('Erreur lors de l\'envoi du cadeau')
    } finally {
      setLoading(false)
    }
  }

  const handleGiftSentFromPicker = (gift: any) => {
    setLastSentGift({
      ...gift,
      senderName: 'Vous'
    })
    setShowToast(true)
    setBalance(prev => prev - gift.totalAmount)
  }

  if (status === 'loading' || loadingCatalog) {
    return (
      <div className="min-h-screen bg-felora-void flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-felora-aurora"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-felora-void">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-felora-void via-felora-obsidian to-felora-void">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-felora-silver mb-2">
              🎁 Catalogue de Cadeaux
            </h1>
            <p className="text-felora-silver/70">Envoyez des cadeaux virtuels animés</p>
            {session && (
              <p className="text-felora-aurora mt-2">
                Solde: {balance} 💎
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Catalogue des cadeaux */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-felora-silver">Catalogue des cadeaux</CardTitle>
                <CardDescription className="text-felora-silver/70">
                  Cliquez sur un cadeau pour le prévisualiser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {gifts.map((gift) => (
                    <motion.div
                      key={gift.code}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        if (gift.price > balance) {
                          redirectToTopUp(gift.price - balance)
                        } else {
                          setSelectedGift(gift)
                        }
                      }}
                      className={`p-6 rounded-xl border cursor-pointer transition-all ${
                        selectedGift?.code === gift.code
                          ? 'border-felora-aurora bg-felora-aurora/10 shadow-lg shadow-felora-aurora/20'
                          : 'border-white/10 bg-white/5 hover:border-felora-aurora/50'
                      }`}
                    >
                      <div className="text-center">
                        <StaticGiftPlayer 
                          giftType={getGiftType(gift.code)}
                          className="w-20 h-20 mx-auto"
                        />
                        <div className="mt-3 text-felora-silver font-medium">
                          {gift.name}
                        </div>
                        <div className="text-felora-aurora font-semibold">
                          {gift.price} 💎
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel d'envoi */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Aperçu du cadeau sélectionné */}
            {selectedGift && (
              <Card className="glass-card">
                <CardHeader className="text-center">
                  <CardTitle className="text-felora-silver">Aperçu</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <StaticGiftPlayer 
                    giftType={getGiftType(selectedGift.code)}
                    className="w-24 h-24 mx-auto mb-4"
                  />
                  <div className="text-felora-silver font-medium">
                    {selectedGift.name}
                  </div>
                  <div className="text-felora-aurora font-semibold">
                    {selectedGift.price} 💎
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulaire d'envoi direct */}
            {session && selectedGift && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-felora-silver">Envoi direct</CardTitle>
                  <CardDescription className="text-felora-silver/70">
                    Test du système de cadeaux
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipient" className="text-felora-silver">
                      Destinataire (test)
                    </Label>
                    <Select value={recipientId} onValueChange={setRecipientId}>
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Choisir un destinataire" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_USERS.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="text-felora-silver">
                      Quantité
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="glass-input"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm text-felora-silver mb-3">
                      <span>Total:</span>
                      <span>{(selectedGift.price * quantity).toLocaleString()} 💎</span>
                    </div>
                    
                    <Button 
                      onClick={handleDirectSend}
                      disabled={loading || !recipientId || (selectedGift.price * quantity) > balance}
                      className="w-full bg-gradient-to-r from-felora-aurora to-felora-plasma"
                    >
                      {loading ? 'Envoi...' : `Envoyer ${selectedGift.name}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions rapides */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-felora-silver">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {session && (
                  <Button
                    onClick={() => setShowPicker(true)}
                    className="w-full bg-gradient-to-r from-felora-plasma to-felora-quantum"
                  >
                    🎁 Ouvrir le sélecteur
                  </Button>
                )}
                
                <Link href="/marketplace-test/wallet">
                  <Button variant="outline" className="w-full">
                    💎 Gérer le wallet
                  </Button>
                </Link>
                
                <Link href="/messages">
                  <Button variant="outline" className="w-full">
                    💬 Messagerie
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    🏠 Accueil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Info pour les non-connectés */}
            {!session && (
              <Card className="glass-card">
                <CardContent className="pt-6 text-center">
                  <p className="text-felora-silver/70 mb-4 text-sm">
                    Connectez-vous pour envoyer des cadeaux
                  </p>
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-felora-aurora to-felora-plasma">
                      Se connecter
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Gift Picker Modal */}
      {session && (
        <GiftPicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          fromUserId={userId}
          toUserId="escort-1" // Test user
          onGiftSent={handleGiftSentFromPicker}
        />
      )}

      {/* Gift Toast */}
      {lastSentGift && (
        <GiftToast
          gift={lastSentGift}
          isVisible={showToast}
          onComplete={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
