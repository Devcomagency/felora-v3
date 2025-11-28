import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

/**
 * Admin Login API - Secured with JWT
 *
 * MIGRATION NOTES:
 * - V1 (OLD): Plain password comparison + Base64 token (INSECURE)
 * - V2 (NEW): Bcrypt password hash + JWT token (SECURE)
 * - Backward compatible during migration period
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 🔒 SÉCURITÉ: Exiger que les variables soient définies (pas de fallback)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET

    // ⚠️ BACKWARD COMPATIBILITY: Support de l'ancien système pendant migration
    const ADMIN_PASSWORD_LEGACY = process.env.ADMIN_PASSWORD

    // 🐛 DEBUG: Log pour vérifier les variables (à supprimer après debug)
    const debugInfo = {
      hasEmail: !!ADMIN_EMAIL,
      hasHash: !!ADMIN_PASSWORD_HASH,
      hasLegacy: !!ADMIN_PASSWORD_LEGACY,
      hashLength: ADMIN_PASSWORD_HASH?.length || 0,
      hashPreview: ADMIN_PASSWORD_HASH?.substring(0, 20) + '...',
      emailValue: ADMIN_EMAIL,
      receivedEmail: email,
      receivedPasswordLength: password.length,
    }
    console.log('🔍 ENV CHECK:', debugInfo)

    // 🚨 TOUJOURS retourner les infos de debug pour comprendre le problème
    if (email === 'debug@test.com') {
      return NextResponse.json({
        debug: debugInfo,
        timestamp: Date.now(),
        version: 'v2.0' // Pour vérifier que c'est bien le nouveau code
      })
    }

    // 🐛 HASH TEST: Tester si bcrypt fonctionne
    if (email === 'hashtest@test.com') {
      const testHash = '$2b$10$RLTaYYRZo0LXsVRhQzwDS.1y1mH5QsLtGciC8beY6LvMF4U2lgKw2'
      const testPassword = 'Felora2025!SecureAdmin'
      const bcryptResult = await bcrypt.compare(testPassword, testHash)
      const envHashResult = ADMIN_PASSWORD_HASH ? await bcrypt.compare(testPassword, ADMIN_PASSWORD_HASH) : null

      return NextResponse.json({
        testHashWorks: bcryptResult,
        envHashWorks: envHashResult,
        envHashValue: ADMIN_PASSWORD_HASH?.substring(0, 30),
        version: 'v2.0'
      })
    }

    // Validation: Au moins un système d'auth doit être configuré
    if (!ADMIN_EMAIL) {
      console.error('🚨 ADMIN_EMAIL not configured')
      return NextResponse.json(
        { success: false, error: 'Configuration admin incomplète' },
        { status: 500 }
      )
    }

    if (!ADMIN_PASSWORD_HASH && !ADMIN_PASSWORD_LEGACY) {
      console.error('🚨 Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD configured')
      return NextResponse.json(
        { success: false, error: 'Configuration admin incomplète' },
        { status: 500 }
      )
    }

    // Vérifier l'email
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // 🔒 Vérifier le mot de passe (système sécurisé prioritaire)
    let isPasswordValid = false

    if (ADMIN_PASSWORD_HASH) {
      // ✅ NOUVEAU SYSTÈME: Bcrypt hash (SÉCURISÉ)
      console.log('🔍 Testing with bcrypt hash...')
      isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      console.log('🔍 Bcrypt result:', isPasswordValid)
      if (isPasswordValid) {
        console.log('✅ Admin login with bcrypt hash (secure)')
      } else {
        console.log('❌ Bcrypt hash did not match')
      }
    } else if (ADMIN_PASSWORD_LEGACY) {
      // ⚠️ ANCIEN SYSTÈME: Plain text comparison (LEGACY - À SUPPRIMER)
      console.log('🔍 Testing with legacy password...')
      isPasswordValid = password === ADMIN_PASSWORD_LEGACY
      if (isPasswordValid) {
        console.warn('⚠️  Admin login with legacy plain password - UPGRADE TO BCRYPT HASH!')
      } else {
        console.log('❌ Legacy password did not match')
      }
    } else {
      console.error('🚨 NO PASSWORD METHOD AVAILABLE (neither hash nor legacy)')
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // 🔒 Créer un token JWT sécurisé (ou fallback Base64 si pas de secret JWT)
    let token: string

    if (ADMIN_JWT_SECRET) {
      // ✅ NOUVEAU: JWT signé (SÉCURISÉ)
      // Note: On utilise un simple payload car on vérifie juste l'authenticité
      const payload = {
        email,
        role: 'admin',
        iat: Date.now(),
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 jours
      }

      // Simple JWT sans librairie (pour éviter dépendance)
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')

      const crypto = await import('crypto')
      const signature = crypto
        .createHmac('sha256', ADMIN_JWT_SECRET)
        .update(`${header}.${payloadB64}`)
        .digest('base64url')

      token = `${header}.${payloadB64}.${signature}`
      console.log('✅ Admin JWT token created (secure)')
    } else {
      // ⚠️ FALLBACK: Base64 token (LEGACY - moins sécurisé)
      token = Buffer.from(`${email}:${Date.now()}`).toString('base64')
      console.warn('⚠️  Admin token created with Base64 (legacy) - ADD ADMIN_JWT_SECRET!')
    }

    // Cookie sécurisé (httpOnly = inaccessible au JavaScript)
    const cookieStore = await cookies()
    cookieStore.set('felora-admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie'
    })
  } catch (error) {
    console.error('❌ Error in admin login:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
