import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Vérifie si l'utilisateur est authentifié en tant qu'admin
 * @returns true si authentifié, false sinon
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  // 🔓 DEV MODE: Bypass auth en développement local
  // ⚠️ À RETIRER EN PRODUCTION ou définir DISABLE_ADMIN_AUTH=false
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_ADMIN_AUTH !== 'false') {
    console.log('⚠️ [DEV MODE] Admin auth bypassed for development')
    return true
  }

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('felora-admin-token')
    return !!token
  } catch (error) {
    return false
  }
}

/**
 * Middleware pour protéger les routes admin
 * Renvoie une erreur 401 si non authentifié
 */
export async function requireAdminAuth() {
  const isAuth = await isAdminAuthenticated()

  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    )
  }

  return null
}
