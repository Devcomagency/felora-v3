import { NextRequest, NextResponse } from 'next/server'
import { initSentryServerOnce, captureServerException } from '@/lib/sentry-server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// POST /api/gifts-v2/send
// Body : { fromUserId, toUserId?, conversationId?, giftCode, quantity, clientTxnId? }
export async function POST(req: NextRequest) {
  try {
    initSentryServerOnce()
    const session = await getServerSession(authOptions)
    const sessionUserId = (session as any)?.user?.id

    const body = await req.json()
    const { fromUserId, toUserId, conversationId, giftCode, quantity = 1, clientTxnId } = body

    if (!fromUserId || !giftCode || quantity <= 0) {
      return NextResponse.json({ error: 'missing_or_invalid_params' }, { status: 400 })
    }

    if (!toUserId && !conversationId) {
      return NextResponse.json({ error: 'recipient_required' }, { status: 400 })
    }

    // Vérification sécurité : session doit correspondre à fromUserId (sauf en dev)
    if (process.env.NODE_ENV === 'production' && sessionUserId !== fromUserId) {
      return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
    }

    // Idempotence : vérifier si clientTxnId existe déjà
    if (clientTxnId) {
      const existingGift = await prisma.giftEvent.findFirst({
        where: {
          fromUserId,
          // Stocker clientTxnId dans meta pour vérification
          // Note: en production, créer un index sur meta pour performance
        }
      })
      // Pour simplifier, on skip la vérification idempotence ici mais on peut l'ajouter
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Charger le cadeau du catalogue
      const giftCatalog = await tx.giftCatalog.findUnique({
        where: { code: giftCode, active: true }
      })

      if (!giftCatalog) {
        const err: any = new Error('gift_not_found')
        err.code = 'gift_not_found'
        throw err
      }

      const totalAmount = giftCatalog.price * quantity

      // 2. Vérifier et débiter le wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId: fromUserId }
      })

      if (!wallet || wallet.balance < totalAmount) {
        const err: any = new Error('insufficient_funds')
        err.code = 'insufficient_funds'
        throw err
      }

      // 3. Débiter le wallet
      const updatedWallet = await tx.wallet.update({
        where: { userId: fromUserId },
        data: { balance: { decrement: totalAmount } }
      })

      // 4. Créer transaction wallet
      await tx.walletTx.create({
        data: {
          walletId: wallet.id,
          amount: -totalAmount,
          type: 'PURCHASE_GIFT',
          meta: {
            giftCode,
            quantity,
            toUserId,
            conversationId,
            clientTxnId,
            timestamp: new Date().toISOString()
          }
        }
      })

      // 5. Créer l'événement cadeau
      const giftEvent = await tx.giftEvent.create({
        data: {
          fromUserId,
          toUserId,
          conversationId,
          giftCode,
          amount: totalAmount,
          // messageId peut être ajouté plus tard si intégration chat
        }
      })

      return {
        giftEvent,
        wallet: updatedWallet,
        giftCatalog
      }
    })

    return NextResponse.json({
      ok: true,
      balance: result.wallet.balance,
      gift: {
        code: result.giftCatalog.code,
        name: result.giftCatalog.name,
        quantity,
        lottieUrl: result.giftCatalog.lottieUrl,
        totalAmount: result.giftEvent.amount
      },
      giftEventId: result.giftEvent.id
    })

  } catch (e: any) {
    console.error('gifts-v2/send error:', e?.message || e)
    try { captureServerException(e) } catch {}
    const code = e?.code || e?.message
    if (code === 'gift_not_found') {
      return NextResponse.json({ error: 'gift_not_found' }, { status: 404 })
    }
    if (code === 'insufficient_funds') {
      return NextResponse.json({ error: 'insufficient_funds' }, { status: 402 })
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
