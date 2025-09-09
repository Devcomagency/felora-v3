import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function splitCsv(v?: string | null): string[] | undefined {
  if (!v) return undefined
  try {
    const s = String(v)
    if (s.trim().startsWith('[')) {
      const arr = JSON.parse(s)
      return Array.isArray(arr) ? arr.map((x: any) => String(x).trim()).filter(Boolean) : undefined
    }
    return s.split(',').map(x => x.trim()).filter(Boolean)
  } catch {
    return undefined
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const p = await prisma.escortProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        stageName: true,
        description: true,
        canton: true,
        // legacy
        city: true,
        workingArea: true,
        // new fields
        ville: true,
        rue: true,
        numero: true,
        codePostal: true,
        latitude: true,
        longitude: true,
        // lists
        languages: true,
        services: true,
        practices: true,
        // misc
        phoneVisibility: true,
        outcall: true,
        incall: true,
        rate1H: true,
        dateOfBirth: true,
        updatedAt: true,
        createdAt: true,
      }
    })

    if (!p) return NextResponse.json({ ok: false, error: 'profile_not_found' }, { status: 404 })

    const normalized = {
      id: p.id,
      stageName: p.stageName,
      description: p.description,
      canton: p.canton,
      // preferred + legacy
      ville: p.ville || undefined,
      city_legacy: p.city || undefined,
      address: {
        rue: p.rue || undefined,
        numero: p.numero || undefined,
        codePostal: p.codePostal || undefined,
        workingArea_legacy: p.workingArea || undefined,
        composed: [
          [p.rue, p.numero].filter(Boolean).join(' ').trim(),
          [p.codePostal, p.ville || p.city || ''].filter(Boolean).join(' ').trim(),
        ].filter(Boolean).join(', '),
      },
      coords: (typeof p.latitude === 'number' && typeof p.longitude === 'number') ? { lat: p.latitude, lng: p.longitude } : undefined,
      lists: {
        languages_csv: p.languages,
        languages: splitCsv(p.languages) || [],
        services_csv: p.services,
        services: splitCsv(p.services) || [],
        practices_csv: p.practices || undefined,
        practices: splitCsv(p.practices) || [],
      },
      flags: {
        phoneVisibility: p.phoneVisibility || 'hidden',
        outcall: !!p.outcall,
        incall: !!p.incall,
      },
      rates: { oneHour: p.rate1H ?? undefined },
      dateOfBirth: p.dateOfBirth ?? undefined,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    }

    return NextResponse.json({ ok: true, profile: normalized })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'server_error' }, { status: 500 })
  }
}

