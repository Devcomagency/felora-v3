/**
 * API Route pour générer des signed URLs pour les médias
 * POST /api/media/sign
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateSignedUrl } from '@/lib/media/signedUrls'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const body = await req.json()
    const { url, expirySeconds } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Générer l'URL signée
    const signedUrl = generateSignedUrl(url, {
      expirySeconds: expirySeconds || 3600,
      userId: session?.user?.id
    })

    return NextResponse.json({ signedUrl })
  } catch (error) {
    console.error('❌ [SIGN URL API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to sign URL' },
      { status: 500 }
    )
  }
}
