import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET /api/wallet-v2/balance?userId=...
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUserId = (session as any)?.user?.id
    
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || sessionUserId

    if (!userId) {
      return NextResponse.json({ error: 'missing_user' }, { status: 400 })
    }

    // Vérification sécurité : session doit correspondre à userId (sauf en dev)
    if (process.env.NODE_ENV === 'production' && sessionUserId !== userId) {
      return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
    }

    // Récupérer wallet et transactions récentes
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Dernières 10 transactions
        }
      }
    })

    if (!wallet) {
      return NextResponse.json({ 
        balance: 0, 
        transactions: [] 
      })
    }

    return NextResponse.json({
      balance: wallet.balance,
      transactions: wallet.transactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        meta: tx.meta,
        createdAt: tx.createdAt
      }))
    })

  } catch (e: any) {
    console.error('wallet-v2/balance error:', e.message)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
