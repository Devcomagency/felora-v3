import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ hasEscortProfile: false })
    
    const escort = await prisma.escortProfile.findUnique({ 
      where: { userId }, 
      select: { 
        id: true,
        stageName: true,
        city: true,
        latitude: true,
        longitude: true,
        addressPrivacy: true,
        status: true,
        isVerifiedBadge: true,
        services: true,
        languages: true
      } 
    })
    
    if (!escort) {
      return NextResponse.json({ hasEscortProfile: false })
    }
    
    return NextResponse.json({
      hasEscortProfile: true,
      escortId: escort.id,
      stageName: escort.stageName,
      city: escort.city,
      latitude: escort.latitude,
      longitude: escort.longitude,
      addressPrivacy: escort.addressPrivacy,
      status: escort.status,
      isVerifiedBadge: escort.isVerifiedBadge,
      services: escort.services,
      languages: escort.languages
    })
  } catch (e:any) {
    console.error('Erreur API /api/me/escort-profile:', e)
    return NextResponse.json({ hasEscortProfile: false, error: e?.message || 'server_error' }, { status: 200 })
  }
}

