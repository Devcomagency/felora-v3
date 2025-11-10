import { NextRequest, NextResponse } from 'next/server'
import { signBunnyUrl } from '@/lib/bunny'

/**
 * API pour obtenir une URL Bunny signée avec Token Authentication
 *
 * Query params:
 * - url: URL Bunny à signer (ex: https://vz-538306.b-cdn.net/{videoId}/playlist.m3u8)
 * - expires: Durée de validité en secondes (défaut: 3600 = 1h)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const expiresParam = searchParams.get('expires')

    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
    }

    // Valider que l'URL est bien une URL Bunny
    if (!url.includes('b-cdn.net') && !url.includes('bunnycdn.com')) {
      return NextResponse.json({ error: 'URL invalide (pas une URL Bunny)' }, { status: 400 })
    }

    const expires = expiresParam ? parseInt(expiresParam) : 3600

    // Signer l'URL
    const signedUrl = signBunnyUrl(url, expires)

    return NextResponse.json({
      success: true,
      originalUrl: url,
      signedUrl: signedUrl,
      expiresIn: expires
    })

  } catch (error: any) {
    console.error('❌ Erreur signature URL Bunny:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur signature URL'
    }, { status: 500 })
  }
}
