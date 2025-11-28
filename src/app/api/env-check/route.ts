import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
      hasAdminJwtSecret: !!process.env.ADMIN_JWT_SECRET,
      hasAdminPasswordLegacy: !!process.env.ADMIN_PASSWORD,

      // Previews (premiers caractères seulement)
      adminEmailValue: process.env.ADMIN_EMAIL || 'NOT_SET',
      adminHashPreview: process.env.ADMIN_PASSWORD_HASH ?
        process.env.ADMIN_PASSWORD_HASH.substring(0, 20) + '...' : 'NOT_SET',
      legacyPasswordPreview: process.env.ADMIN_PASSWORD ?
        '***SET***' : 'NOT_SET',
    }
  })
}
