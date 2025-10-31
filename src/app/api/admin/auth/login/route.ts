import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Vérifier les credentials (côté serveur uniquement)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@devcom.ch'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Devcom20!'

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Créer un token sécurisé (simple pour commencer)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')

    // Créer la réponse avec cookie httpOnly
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie'
    })

    // Cookie sécurisé (httpOnly = inaccessible au JavaScript)
    response.cookies.set('felora-admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error in admin login:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
