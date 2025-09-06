import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/wallet/summary
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const wallet = await prisma.diamondWallet.findUnique({ where: { userId } })
    const balance = wallet?.balance || 0

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    const [curr, prev] = await Promise.all([
      prisma.diamondTransaction.aggregate({ _sum: { amount: true }, where: { toUserId: userId, status: 'COMPLETED' as any, createdAt: { gte: monthStart, lte: now } } }),
      prisma.diamondTransaction.aggregate({ _sum: { amount: true }, where: { toUserId: userId, status: 'COMPLETED' as any, createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
    ])
    const totalEarnedThisMonth = curr._sum.amount || 0
    const prevEarned = prev._sum.amount || 0
    const balanceDeltaPct = prevEarned ? Math.round(((totalEarnedThisMonth - prevEarned) / Math.max(1, prevEarned)) * 100) : (totalEarnedThisMonth > 0 ? 100 : 0)

    return NextResponse.json({
      balance,
      balanceDeltaPct,
      totalEarnedThisMonth,
      totalWithdrawn: 0,
      pendingWithdrawal: { amount: 0, status: 'pending' as const }
    })
  } catch (e:any) {
    console.error('wallet/summary error:', e.message)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
