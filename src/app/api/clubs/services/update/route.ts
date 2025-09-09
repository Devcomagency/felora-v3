import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const Schema = z.object({
      languages: z.array(z.string()).optional(),
      paymentMethods: z.array(z.string()).optional(),
      services: z.array(z.string()).optional()
    })
    
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data

    // Vérifier que l'utilisateur a un club
    const club = await prisma.club.findUnique({ where: { ownerId: userId } })
    
    if (!club) {
      return NextResponse.json({ ok: false, error: 'Club non trouvé' }, { status: 404 })
    }

    // Construire les données à mettre à jour (stockage en CSV pour compatibilité)
    const dataToUpdate: any = {}
    if (input.languages) dataToUpdate.languages = input.languages.join(', ')
    if (input.paymentMethods) dataToUpdate.paymentMethods = input.paymentMethods.join(', ')
    if (input.services) dataToUpdate.services = input.services.join(', ')

    console.log('🏢 Club services update data:', JSON.stringify(dataToUpdate, null, 2))
    
    // Mettre à jour le club
    await prisma.club.update({
      where: { id: club.id },
      data: dataToUpdate
    })

    return NextResponse.json({ ok: true, message: 'Services mis à jour' })
    
  } catch (e: any) {
    console.error('❌ /api/clubs/services/update error:', e.message)
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}