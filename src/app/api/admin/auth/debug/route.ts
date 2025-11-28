import { NextResponse } from 'next/server'

/**
 * DEBUG ENDPOINT - À SUPPRIMER EN PRODUCTION
 * Permet de vérifier quelles variables d'environnement sont chargées
 */
export async function GET() {
  return NextResponse.json({
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    hasAdminJwtSecret: !!process.env.ADMIN_JWT_SECRET,
    hasAdminPasswordLegacy: !!process.env.ADMIN_PASSWORD,
    hasMediaSignatureSecret: !!process.env.MEDIA_SIGNATURE_SECRET,

    // Afficher les 5 premiers caractères pour vérifier (sans exposer les secrets complets)
    adminEmailPreview: process.env.ADMIN_EMAIL?.substring(0, 5) + '...',
    adminPasswordHashPreview: process.env.ADMIN_PASSWORD_HASH?.substring(0, 10) + '...',

    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  })
}
