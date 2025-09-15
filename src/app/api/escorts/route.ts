import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortKey = 'recent' | 'relevance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, Math.min(30, parseInt(searchParams.get('limit') || '20')))
    const cursorRaw = searchParams.get('cursor') // on utilise un offset numérique pour la v1
    const offset = Math.max(0, parseInt(cursorRaw || '0'))

    const q = (searchParams.get('q') || searchParams.get('search') || '').trim()
    const city = (searchParams.get('city') || '').trim()
    const canton = (searchParams.get('canton') || '').trim()
    const servicesCSV = (searchParams.get('services') || '').trim()
    const languagesCSV = (searchParams.get('languages') || '').trim()
    const status = (searchParams.get('status') || '').trim().toUpperCase()
    const sort: SortKey = ((searchParams.get('sort') || 'recent') as SortKey)

    const where: any = {}
    // Status filter
    if (status === 'ACTIVE' || status === 'PAUSED') {
      where.status = status
    } else {
      // Par défaut: profils activés ou en attente avec photo
      where.OR = [
        { status: 'ACTIVE' },
        { AND: [{ status: 'PENDING' }, { hasProfilePhoto: true }] },
      ]
    }
    if (city) where.city = { contains: city, mode: 'insensitive' as const }
    if (canton) where.canton = { contains: canton, mode: 'insensitive' as const }
    
    // q: stageName + description
    if (q) {
      const textFilter = {
        OR: [
          { stageName: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      }
      if (where.OR) where.OR = [...where.OR, textFilter]
      else Object.assign(where, textFilter)
    }

    // services/langues stockés en String (JSON). On fait un contains simple.
    if (servicesCSV) {
      const terms = servicesCSV.split(',').map(s => s.trim()).filter(Boolean)
      if (terms.length) where.services = { contains: terms[0], mode: 'insensitive' as const }
    }
    if (languagesCSV) {
      const terms = languagesCSV.split(',').map(s => s.trim()).filter(Boolean)
      if (terms.length) where.languages = { contains: terms[0], mode: 'insensitive' as const }
    }

    const orderBy = sort === 'recent' 
      ? { updatedAt: 'desc' as const }
      : { updatedAt: 'desc' as const } // relevance non implémenté pour v1

    const rows = await prisma.escortProfile.findMany({
      where,
      select: {
        id: true,
        stageName: true,
        description: true,
        city: true,
        canton: true,
        isVerifiedBadge: true,
        hasProfilePhoto: true,
        profilePhoto: true,
        languages: true,
        services: true,
        rate1H: true,
        latitude: true,
        longitude: true,
        updatedAt: true,
        dateOfBirth: true,
      },
      orderBy,
      take: limit,
      skip: offset,
    })

    const items = rows.map((e) => {
      const gallery = (() => { try { return JSON.parse(e.services || '[]') } catch { return [] } })() // not used here but kept pattern
      const langs = (() => { try { const L = JSON.parse(String(e.languages||'[]')); return Array.isArray(L)?L:[] } catch { return [] } })()
      const servs = (() => { try { const S = JSON.parse(String(e.services||'[]')); return Array.isArray(S)?S:[] } catch { return [] } })()
      const hero: any = e.profilePhoto ? { type: 'IMAGE', url: e.profilePhoto } : undefined
      const year = new Date().getFullYear()
      const age = (() => { try { return e.dateOfBirth ? (year - new Date(e.dateOfBirth).getFullYear()) : undefined } catch { return undefined } })()
      return {
        id: e.id,
        stageName: e.stageName || '',
        age,
        city: e.city || undefined,
        canton: e.canton || undefined,
        isVerifiedBadge: !!e.isVerifiedBadge,
        isActive: undefined,
        profilePhoto: e.profilePhoto || undefined,
        heroMedia: hero,
        languages: langs,
        services: servs,
        rate1H: e.rate1H || undefined,
        latitude: e.latitude || undefined,
        longitude: e.longitude || undefined,
        updatedAt: e.updatedAt as any,
      }
    })

    const nextCursor = items.length === limit ? String(offset + limit) : undefined

    return NextResponse.json({ items, nextCursor, total: undefined })
  } catch (error) {
    console.error('api/escorts error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
