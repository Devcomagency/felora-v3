import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
    NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL,
    baseUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://media.felora.ch',
    containsUndefined: (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').includes('undefined'),
    allEnvVars: Object.keys(process.env).filter(key => key.includes('CLOUDFLARE'))
  })
}
