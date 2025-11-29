import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const all = await prisma.escortProfile.findMany({
    select: { id: true, isActive: true, status: true, stageName: true }
  })

  const byStatus = all.reduce((acc: Record<string, number>, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1
    return acc
  }, {})

  const byIsActive = {
    true: all.filter(e => e.isActive).length,
    false: all.filter(e => e.isActive === false).length
  }

  const activeAndStatusActive = all.filter(e => e.isActive && e.status === 'ACTIVE')

  return NextResponse.json({
    total: all.length,
    byStatus,
    byIsActive,
    activeAndStatusActive: {
      count: activeAndStatusActive.length,
      samples: activeAndStatusActive.slice(0, 5).map(e => ({
        id: e.id,
        name: e.stageName,
        isActive: e.isActive,
        status: e.status
      }))
    },
    allSamples: all.slice(0, 10).map(e => ({
      id: e.id,
      name: e.stageName,
      isActive: e.isActive,
      status: e.status
    }))
  })
}
