'use client'

import { useState, useEffect } from 'react'
import { StaticGiftPlayer } from './StaticGiftPlayer'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Gift {
  code: string
  name: string
  price: number
  lottieUrl: string
}

// Mapping des codes de cadeaux vers les nouveaux types
const getGiftType = (giftCode: string): 'heart' | 'rose' | 'bouquet' | 'diamond' | 'star' | 'flame' | 'confetti' | 'champagne' | 'cocktail' | 'wine' => {
  const mapping: Record<string, 'heart' | 'rose' | 'bouquet' | 'diamond' | 'star' | 'flame' | 'confetti' | 'champagne' | 'cocktail' | 'wine'> = {
    // Coeur
    'heart': 'heart', 'coeur': 'heart', 'HEART': 'heart', 'COEUR': 'heart',
    // Rose
    'rose': 'rose', 'ROSE': 'rose',
    // Bouquet
    'bouquet': 'bouquet', 'BOUQUET': 'bouquet', 'fleurs': 'bouquet', 'FLEURS': 'bouquet',
    // Diamant
    'diamond': 'diamond', 'diamant': 'diamond', 'DIAMOND': 'diamond', 'DIAMANT': 'diamond',
    // Étoile
    'star': 'star', 'etoile': 'star', 'STAR': 'star', 'ETOILE': 'star', 'brillante': 'star',
    // Flamme
    'flame': 'flame', 'flamme': 'flame', 'FLAME': 'flame', 'FLAMME': 'flame', 'fire': 'flame', 'feu': 'flame',
    // Confetti
    'confetti': 'confetti', 'CONFETTI': 'confetti', 'fete': 'confetti', 'party': 'confetti',
    // Champagne
    'champagne': 'champagne', 'CHAMPAGNE': 'champagne', 'verre': 'champagne', 'toast': 'champagne',
    // Cocktail
    'cocktail': 'cocktail', 'COCKTAIL': 'cocktail', 'drink': 'cocktail',
    // Vin
    'wine': 'wine', 'vin': 'wine', 'WINE': 'wine', 'VIN': 'wine', 'rouge': 'wine'
  }
  
  return mapping[giftCode] || 'heart' // fallback
}

interface GiftPickerProps {
  isOpen: boolean
  onClose: () => void
  fromUserId: string
  toUserId?: string
  conversationId?: string
  onGiftSent?: (gift: any) => void
}

export function GiftPicker({ isOpen, onClose, fromUserId, toUserId, conversationId, onGiftSent }: GiftPickerProps) {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [loadingCatalog, setLoadingCatalog] = useState(false)

  // Charger catalogue et balance
  useEffect(() => {
    if (isOpen) {
      loadCatalogAndBalance()
    }
  }, [isOpen, fromUserId])

  const loadCatalogAndBalance = async () => {
    setLoadingCatalog(true)
    try {
      // Charger catalogue
      const catalogResponse = await fetch('/api/gifts-v2/catalog')
      const catalogData = await catalogResponse.json()
      
      if (catalogData.error) {
        toast.error(catalogData.error)
        return
      }
      
      setGifts(catalogData.items || [])

      // Charger balance
      const balanceResponse = await fetch(`/api/wallet-v2/balance?userId=${fromUserId}`)
      const balanceData = await balanceResponse.json()
      
      if (!balanceData.error) {
        setBalance(balanceData.balance || 0)
      }

    } catch (error) {
      console.error('Erreur chargement catalogue/balance:', error)
      toast.error('Erreur lors du chargement')
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

  const handleSendGift = async () => {
    // Auth guard
    if (!fromUserId) {
      try {
        const q = new URLSearchParams({ redirect: window.location.href })
        window.location.href = `/login?${q.toString()}`
      } catch {
        toast.error('Vous devez être connecté')
      }
      return
    }
    if (!selectedGift) {
      toast.error('Veuillez sélectionner un cadeau')
      return
    }

    if (quantity <= 0) {
      toast.error('Quantité invalide')
      return
    }

    const totalCost = selectedGift.price * quantity
    if (totalCost > balance) {
      // Redirection directe vers la page de recharge
      redirectToTopUp(totalCost - balance)
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/gifts-v2/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId,
          toUserId,
          conversationId,
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

      // Succès
      toast.success(`${selectedGift.name} envoyé${quantity > 1 ? `s (x${quantity})` : ''} !`)
      
      // Mettre à jour le solde
      setBalance(data.balance)
      
      // Callback parent
      if (onGiftSent) {
        onGiftSent(data.gift)
      }

      // Fermer le picker
      onClose()
      
      // Reset form
      setSelectedGift(null)
      setQuantity(1)
      setMessage('')

    } catch (error) {
      console.error('Erreur envoi cadeau:', error)
      toast.error('Erreur lors de l\'envoi du cadeau')
    } finally {
      setLoading(false)
    }
  }

  const totalCost = selectedGift ? selectedGift.price * quantity : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-felora-silver flex items-center space-x-2">
            <span>🎁</span>
            <span>Envoyer un cadeau</span>
          </DialogTitle>
          <DialogDescription className="text-felora-silver/70">
            Solde actuel : {balance} 💎
          </DialogDescription>
        </DialogHeader>

        {loadingCatalog ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-felora-aurora"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Catalogue des cadeaux */}
            <div>
              <Label className="text-felora-silver">Choisir un cadeau</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {gifts.map((gift) => (
                  <div
                    key={gift.code}
                    onClick={() => {
                      if (!fromUserId) {
                        try {
                          const q = new URLSearchParams({ redirect: window.location.href })
                          window.location.href = `/login?${q.toString()}`
                        } catch {}
                        return
                      }
                      if (gift.price > balance) {
                        redirectToTopUp(gift.price - balance)
                      } else {
                        setSelectedGift(gift)
                      }
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedGift?.code === gift.code
                        ? 'border-felora-aurora bg-felora-aurora/10'
                        : 'border-white/10 bg-white/5 hover:border-felora-aurora/50'
                    }`}
                  >
                    <div className="text-center">
                      <StaticGiftPlayer 
                        giftType={getGiftType(gift.code)}
                        className="w-16 h-16 mx-auto"
                      />
                      <div className="mt-2 text-felora-silver font-medium">{gift.name}</div>
                      <div className="text-felora-aurora text-sm">{gift.price} 💎</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantité */}
            {selectedGift && (
              <div>
                <Label htmlFor="quantity" className="text-felora-silver">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="glass-input mt-1"
                />
              </div>
            )}

            {/* Message optionnel */}
            <div>
              <Label htmlFor="message" className="text-felora-silver">Message (optionnel)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ajouter un petit mot..."
                className="glass-input mt-1 resize-none h-20"
                maxLength={200}
              />
            </div>

            {/* Résumé et actions */}
            {selectedGift && (
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-felora-silver">
                    <div>Total : {totalCost} 💎</div>
                    <div className="text-sm text-felora-silver/70">
                      Nouveau solde : {balance - totalCost} 💎
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedGift && (
                      <StaticGiftPlayer 
                        giftType={getGiftType(selectedGift.code)}
                        className="w-12 h-12"
                      />
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSendGift} 
                    disabled={loading || totalCost > balance}
                    className="flex-1 bg-gradient-to-r from-felora-aurora to-felora-plasma hover:opacity-90"
                  >
                    {loading ? 'Envoi...' : `Envoyer ${selectedGift.name}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
