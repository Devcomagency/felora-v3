import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// POST /api/wallet-v2/fund
// Body : { userId, amount } — appelé par le même flux de paiement que pour l'inscription escort
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUserId = (session as any)?.user?.id

    const body = await req.json()
    const { userId, amount } = body

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
    }

    // Vérification sécurité : session doit correspondre à userId (sauf en dev)
    if (process.env.NODE_ENV === 'production' && sessionUserId !== userId) {
      return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
    }

    // Upsert wallet + transaction en une seule transaction atomique
    const result = await prisma.$transaction(async (tx) => {
      // Upsert wallet
      const wallet = await tx.wallet.upsert({
        where: { userId },
        update: { 
          balance: { increment: amount },
          updatedAt: new Date()
        },
        create: { 
          userId, 
          balance: amount 
        }
      })

      // Créer transaction FUND
      await tx.walletTx.create({
        data: {
          walletId: wallet.id,
          amount: amount,
          type: 'FUND',
          meta: {
            source: 'payment_flow',
            timestamp: new Date().toISOString()
          }
        }
      })

      return wallet
    })

    return NextResponse.json({ 
      ok: true,
      balance: result.balance,
      message: `${amount} diamants ajoutés avec succès`
    })

  } catch (e: any) {
    console.error('wallet-v2/fund error:', e.message)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
