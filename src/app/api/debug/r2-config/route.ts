import { NextResponse } from 'next/server'

// Headers pour bypasser la protection Vercel
export const headers = {
  'x-vercel-deployment-protection-bypass': 'true',
  'x-deployment-protection-bypass': 'true'
}

// API debug pour vérifier la config R2 (sans upload)
export async function GET() {
  console.log('🔍 [DEBUG R2] Checking R2 configuration')

  const r2Config = {
    storageProvider: process.env.STORAGE_PROVIDER,
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    bucket: process.env.CLOUDFLARE_R2_BUCKET
  }

  const configStatus = {
    storageProvider: r2Config.storageProvider || 'NOT_SET',
    endpoint: r2Config.endpoint ? 'SET' : 'MISSING',
    accountId: r2Config.accountId ? 'SET' : 'MISSING',
    accessKey: r2Config.accessKey ? 'SET' : 'MISSING',
    secretKey: r2Config.secretKey ? 'SET' : 'MISSING',
    bucket: r2Config.bucket ? 'SET' : 'MISSING'
  }

  const allConfigured = Object.values(configStatus).every(status =>
    status === 'SET' || status === 'cloudflare-r2'
  )

  console.log('🔍 [DEBUG R2] Config status:', configStatus)

  return NextResponse.json({
    success: true,
    message: 'R2 Configuration Status',
    allConfigured,
    config: configStatus,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}