import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const SITE_PASSWORD = process.env.SITE_PASSWORD

    // Si pas de mot de passe défini, on refuse
    if (!SITE_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Password not configured' }, { status: 500 })
    }

    // Vérifier le mot de passe
    if (password === SITE_PASSWORD) {
      // Créer un cookie qui dure 24h
      const cookieStore = await cookies()
      cookieStore.set('site-auth', password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 heures
        path: '/',
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
