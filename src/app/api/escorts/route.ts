import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EscortStatus } from '@prisma/client'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '20')))
    const city = (searchParams.get('city') || '').trim()
    const q = (searchParams.get('search') || '').trim()

    // 1) Fetch real escorts from DB
    const where: any = {}
    // Show quickly: allow PENDING with minimal presence (hasProfilePhoto) or ACTIVE
    where.OR = [
      { status: 'ACTIVE' },
      { AND: [ { status: 'PENDING' }, { hasProfilePhoto: true } ] }
    ]
    if (city) where.city = { contains: city, mode: 'insensitive' as const }
    if (q) {
      where.OR = [
        ...(where.OR || []),
        { stageName: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } }
      ]
    }

    const dbEscorts = await prisma.escortProfile.findMany({
      where,
      select: {
        id: true,
        stageName: true,
        city: true,
        description: true,
        profilePhoto: true,
        galleryPhotos: true,
        status: true,
        languages: true,
        services: true,
        rate1H: true,
        dateOfBirth: true,
        isVerifiedBadge: true,
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      orderBy: { updatedAt: 'desc' }
    })

    const year = new Date().getFullYear()
    const transformedDb = dbEscorts.map((e, i) => {
      // best-effort fallback images
      const gallery = (() => { try { return JSON.parse(e.galleryPhotos || '[]') } catch { return [] } })()
      const firstImg = e.profilePhoto || gallery.find((m: any) => m?.type !== 'video')?.url || 'https://picsum.photos/600/900?random=' + (i+1)
      const age = (() => { try { return e.dateOfBirth ? (year - new Date(e.dateOfBirth).getFullYear()) : undefined } catch { return undefined } })()
      return {
        id: e.id,
        name: e.stageName || 'Escort',
        username: '@' + (e.stageName || 'escort').toLowerCase().replace(/\s+/g,'_'),
        age,
        location: e.city || '—',
        media: firstImg,
        profileImage: firstImg,
        image: firstImg,
        mediaType: 'image',
        verified: !!e.isVerifiedBadge,
        premium: true,
        online: e.status === 'ACTIVE',
        description: e.description || '',
        likes: 0,
        followers: 0,
        following: 0,
        isLiked: false,
        isFollowing: false,
        rating: 0,
        reviews: 0,
        price: e.rate1H || undefined,
        height: undefined,
        bodyType: undefined,
        breastSize: undefined,
        hairColor: undefined,
        eyeColor: undefined,
        outcall: false,
        incall: false,
        acceptCards: false,
        languages: (()=>{ try { const L = JSON.parse(String(e.languages||'[]')); return Array.isArray(L)?L:[] } catch { return [] } })(),
        practices: [],
        services: (()=>{ try { const S = JSON.parse(String(e.services||'[]')); return Array.isArray(S)?S:[] } catch { return [] } })(),
        gallery: gallery.map((m:any)=>m.url).slice(0,3),
        status: e.status as EscortStatus,
        views: 0,
        userId: undefined,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }
    })

    return NextResponse.json({ 
      success: true, 
      escorts: transformedDb, 
      total: transformedDb.length, 
      hasMore: transformedDb.length >= limit 
    })
  } catch (error) {
    console.error('Erreur récupération escorts:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
