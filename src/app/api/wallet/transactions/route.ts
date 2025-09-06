import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/wallet/transactions?page
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || '1')
    const pageSize = 10

    const [total, tx] = await Promise.all([
      prisma.diamondTransaction.count({ where: { toUserId: userId } }),
      prisma.diamondTransaction.findMany({
        where: { toUserId: userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ])

    const items = tx.map(t => ({
      id: t.id,
      date: +t.createdAt,
      type: t.type.toLowerCase(),
      amount: t.amount,
      currency: 'DIAMOND',
      status: t.status.toLowerCase(),
      ref: t.externalTransactionId || t.stripePaymentIntentId || t.description || ''
    }))
    const hasMore = page * pageSize < total
    return NextResponse.json({ items, page, hasMore })
  } catch (e:any) {
    console.error('wallet/transactions error:', e.message)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
