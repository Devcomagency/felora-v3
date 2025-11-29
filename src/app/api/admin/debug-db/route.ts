import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Count total clubs
    const totalClubs = await prisma.clubProfile.count()

    // Count media with club owners
    const mediaWithClubs = await prisma.media.count({
      where: { ownerType: 'CLUB' }
    })

    // Get unique club IDs from media
    const mediaClubIds = await prisma.media.findMany({
      where: { ownerType: 'CLUB' },
      select: { ownerId: true },
      distinct: ['ownerId']
    })

    // Check which club IDs exist
    const clubIds = mediaClubIds.map(m => m.ownerId).filter(id => id !== 'unknown')
    const existingClubs = await prisma.clubProfile.findMany({
      where: { id: { in: clubIds } },
      select: { id: true, name: true, handle: true }
    })

    // Find orphaned media (club owner but club doesn't exist)
    const existingClubIds = new Set(existingClubs.map(c => c.id))
    const orphanedClubIds = clubIds.filter(id => !existingClubIds.has(id))

    // Count media with "unknown" as ownerId
    const unknownMedia = await prisma.media.count({
      where: { ownerId: 'unknown' }
    })

    // Sample orphaned media
    const sampleOrphaned = await prisma.media.findMany({
      where: {
        ownerType: 'CLUB',
        ownerId: { in: orphanedClubIds.slice(0, 5) }
      },
      take: 5,
      select: {
        id: true,
        ownerId: true,
        url: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      summary: {
        totalClubs,
        mediaWithClubs,
        uniqueClubIdsInMedia: clubIds.length,
        existingClubsCount: existingClubs.length,
        orphanedClubIds: orphanedClubIds.length,
        unknownMedia
      },
      existingClubs,
      orphanedClubIds: orphanedClubIds.slice(0, 10),
      sampleOrphaned
    })
  } catch (error) {
    console.error('Debug DB error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
