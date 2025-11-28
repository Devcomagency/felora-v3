import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    hasAdminPasswordLegacy: !!process.env.ADMIN_PASSWORD,

    adminEmail: process.env.ADMIN_EMAIL || 'NOT_SET',
    hashLength: process.env.ADMIN_PASSWORD_HASH?.length || 0,
    hashStart: process.env.ADMIN_PASSWORD_HASH?.substring(0, 20) || 'NOT_SET',
    legacyPasswordExists: process.env.ADMIN_PASSWORD ? 'YES' : 'NO',
  })
}
