import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * DEBUG: Endpoint pour vérifier l'état de l'auth admin
 * À SUPPRIMER EN PRODUCTION
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('felora-admin-token')

    // Récupérer tous les cookies pour debug
    const allCookies = cookieStore.getAll()

    return NextResponse.json({
      hasAdminToken: !!adminToken,
      adminTokenValue: adminToken?.value ? `${adminToken.value.substring(0, 20)}...` : null,
      allCookiesNames: allCookies.map(c => c.name),
      totalCookies: allCookies.length,
      requestUrl: request.url,
      requestHeaders: {
        cookie: request.headers.get('cookie')?.substring(0, 100) + '...',
        host: request.headers.get('host'),
        origin: request.headers.get('origin')
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      message: 'Failed to check auth'
    }, { status: 500 })
  }
}
