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
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

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

// Old marketplace gifts page (V3 original)
function OldGiftsTestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Marketplace Cadeaux (Version Originale)</h1>
        <p className="text-gray-400">Cette page utilise l'ancienne interface V3</p>
      </div>
    </div>
  )
}

// New marketplace gifts page (V2 design)
function NewGiftsTestPage() {
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
    try {
      setLoadingCatalog(true)
      
      // Charger le catalogue des cadeaux
      const catalogResponse = await fetch('/api/gifts/catalog')
      const catalogData = await catalogResponse.json()
      
      if (catalogData.success) {
        setGifts(catalogData.gifts)
      } else {
        // Fallback avec des cadeaux de test
        setGifts([
          { code: 'heart', name: 'Cœur', price: 10, lottieUrl: '/lottie/heart.json' },
          { code: 'diamond', name: 'Diamant', price: 25, lottieUrl: '/lottie/diamond.json' },
          { code: 'rose', name: 'Rose', price: 15, lottieUrl: '/lottie/rose.json' },
          { code: 'fireworks', name: 'Feux d\'artifice', price: 50, lottieUrl: '/lottie/fireworks.json' },
          { code: 'crown', name: 'Couronne', price: 100, lottieUrl: '/lottie/crown.json' }
        ])
      }

      // Charger le solde du portefeuille
      const balanceResponse = await fetch('/api/wallet/balance')
      const balanceData = await balanceResponse.json()
      
      if (balanceData.success) {
        setBalance(balanceData.balance)
      }
    } catch (error) {
      console.error('Error loading catalog and balance:', error)
      // Fallback avec des cadeaux de test
      setGifts([
        { code: 'heart', name: 'Cœur', price: 10, lottieUrl: '/lottie/heart.json' },
        { code: 'diamond', name: 'Diamant', price: 25, lottieUrl: '/lottie/diamond.json' },
        { code: 'rose', name: 'Rose', price: 15, lottieUrl: '/lottie/rose.json' },
        { code: 'fireworks', name: 'Feux d\'artifice', price: 50, lottieUrl: '/lottie/fireworks.json' },
        { code: 'crown', name: 'Couronne', price: 100, lottieUrl: '/lottie/crown.json' }
      ])
    } finally {
      setLoadingCatalog(false)
    }
  }

  const redirectToTopUp = () => {
    window.location.href = '/wallet/topup'
  }

  const handleDirectSend = async () => {
    if (!selectedGift || !recipientId) {
      toast.error('Veuillez sélectionner un cadeau et un destinataire')
      return
    }

    const totalCost = selectedGift.price * quantity
    
    if (balance < totalCost) {
      toast.error('Solde insuffisant')
      redirectToTopUp()
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/gifts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftCode: selectedGift.code,
          recipientId,
          quantity,
          fromUserId: userId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Cadeau envoyé avec succès!')
        setLastSentGift({
          ...selectedGift,
          quantity,
          recipientName: TEST_USERS.find(u => u.id === recipientId)?.name || 'Destinataire'
        })
        setShowToast(true)
        
        // Recharger le solde
        loadCatalogAndBalance()
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Error sending gift:', error)
      toast.error('Erreur lors de l\'envoi du cadeau')
    } finally {
      setLoading(false)
    }
  }

  const handleGiftSentFromPicker = (gift: any) => {
    setLastSentGift(gift)
    setShowToast(true)
    loadCatalogAndBalance()
  }

  if (status === 'loading' || loadingCatalog) {
    return (
      <div className="min-h-screen bg-felora-void flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full animate-spin mx-auto mb-4"
            style={{
              border: '4px solid var(--felora-aurora-20)',
              borderTop: '4px solid var(--felora-aurora)'
            }}
          />
          <p className="text-lg" style={{ color: 'var(--felora-silver)' }}>
            Chargement du marketplace...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-felora-void">
      {/* Header avec style V2 */}
      <div 
        className="sticky top-0 z-50 p-6"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Marketplace Cadeaux
          </h1>
          <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
            Envoyez des cadeaux virtuels à vos favoris
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Catalogue des cadeaux */}
          <div 
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h2 
              className="text-xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Catalogue des Cadeaux
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {gifts.map((gift) => (
                <motion.div
                  key={gift.code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedGift(gift)}
                >
                  <Card 
                    className={`transition-all ${
                      selectedGift?.code === gift.code 
                        ? 'ring-2 ring-var(--felora-aurora)' 
                        : 'hover:bg-white/5'
                    }`}
                    style={{
                      background: selectedGift?.code === gift.code 
                        ? 'rgba(255, 107, 157, 0.1)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-2">
                        <StaticGiftPlayer 
                          type={getGiftType(gift.code)} 
                          size={64}
                        />
                      </div>
                      <h3 className="font-semibold text-white">{gift.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
                        {gift.price} CHF
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Panneau d'envoi */}
          <div 
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h2 
              className="text-xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Envoyer un Cadeau
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white">Destinataire</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger 
                    className="bg-white/5 border-white/10 text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
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
                <Label className="text-white">Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="bg-white/5 border-white/10 text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>

              {selectedGift && (
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div className="flex items-center gap-3">
                    <StaticGiftPlayer type={getGiftType(selectedGift.code)} size={32} />
                    <div>
                      <p className="font-semibold text-white">{selectedGift.name}</p>
                      <p className="text-sm" style={{ color: 'var(--felora-silver-70)' }}>
                        {selectedGift.price * quantity} CHF total
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleDirectSend}
                disabled={!selectedGift || !recipientId || loading}
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, var(--felora-aurora) 0%, var(--felora-plasma) 100%)',
                  boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)'
                }}
              >
                {loading ? 'Envoi...' : 'Envoyer le Cadeau'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GiftPicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        fromUserId={userId || ''}
        toUserId={recipientId}
        onGiftSent={handleGiftSentFromPicker}
      />
      
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

export default function GiftsTestPage() {
  const isNewGiftsEnabled = useFeatureFlag('NEXT_PUBLIC_FEATURE_UI_MARKETPLACE_GIFTS')
  
  if (isNewGiftsEnabled) {
    return <NewGiftsTestPage />
  }
  
  return <OldGiftsTestPage />
}