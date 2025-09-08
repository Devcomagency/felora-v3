import { NextResponse } from 'next/server'

export async function GET() {
  const r2Config = {
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || 'NOT_SET',
    accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY ? 'SET' : 'NOT_SET',  
    secretKey: process.env.CLOUDFLARE_R2_SECRET_KEY ? 'SET' : 'NOT_SET',
    bucket: process.env.CLOUDFLARE_R2_BUCKET || 'NOT_SET'
  }
  
  // Test si le SDK AWS est disponible
  let sdkAvailable = false
  try {
    await import('@aws-sdk/client-s3')
    sdkAvailable = true
  } catch (e) {
    sdkAvailable = false
  }
  
  return NextResponse.json({
    r2Config,
    sdkAvailable,
    environment: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production'
  })
}