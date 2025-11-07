import { NextResponse } from 'next/server'

/**
 * Route de test pour diagnostiquer les variables Mux sur Vercel
 * À SUPPRIMER après résolution du problème
 */
export async function GET() {
  // Version ultra-simple pour vérifier que la route fonctionne
  const response = {
    status: 'Route active',
    timestamp: new Date().toISOString(),
    hasTokenId: !!process.env.MUX_TOKEN_ID,
    hasTokenSecret: !!process.env.MUX_TOKEN_SECRET,
    tokenIdLength: process.env.MUX_TOKEN_ID?.length || 0,
    tokenSecretLength: process.env.MUX_TOKEN_SECRET?.length || 0,
    tokenIdPreview: process.env.MUX_TOKEN_ID?.substring(0, 10) + '...',
    tokenSecretPreview: process.env.MUX_TOKEN_SECRET?.substring(0, 20) + '...',
    allMuxKeys: Object.keys(process.env).filter(k => k.includes('MUX')),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'non défini',
    // Info debug supplémentaire
    allEnvKeysCount: Object.keys(process.env).length
  }

  console.log('🔍 Test Mux Env:', response)

  return NextResponse.json(response)
}
