import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Vérifie si l'utilisateur est authentifié en tant qu'admin
 * @returns true si authentifié, false sinon
 */
export async function isAdminAuthenticated(): Promise<boolean> {
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
